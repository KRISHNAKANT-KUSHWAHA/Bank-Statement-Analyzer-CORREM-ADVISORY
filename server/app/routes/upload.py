"""
Upload route – handles PDF upload, parsing, categorization,
analytics, Excel generation, and DB persistence.
"""

import logging
import uuid

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.analytics.analyzer import AnalyticsEngine
from app.auth.dependencies import get_current_user
from app.categorizer.engine import CategorizationEngine
from app.config import EXPORTS_DIR, UPLOADS_DIR
from app.database.connection import get_db
from app.excel.generator import ExcelGenerator
from app.models.analysis import Analysis
from app.models.user import User
from app.parsers.parser_factory import (
    InvalidPDFError,
    PDFInvalidPasswordError,
    PDFPasswordRequiredError,
    UnsupportedStatementError,
    parse_statement,
)
from app.parsers.validators import validate_transactions
from app.schemas.analysis import UploadResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Upload & Analysis"])

# Directories (relative to server/)
@router.post("/upload", response_model=UploadResponse)
async def upload_statement(
    file: UploadFile = File(...),
    password: str | None = Form(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UploadResponse:
    """
    Upload an HDFC bank statement PDF, parse it, categorise
    transactions, generate analytics and an Excel report.
    """
    # ------------------------------------------------------------------
    # 1. Validate file
    # ------------------------------------------------------------------
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are accepted",
        )

    # ------------------------------------------------------------------
    # 2. Save uploaded file
    # ------------------------------------------------------------------
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)

    unique_name = f"{uuid.uuid4().hex}_{file.filename}"
    upload_path = UPLOADS_DIR / unique_name

    try:
        contents = await file.read()
        with open(upload_path, "wb") as f:
            f.write(contents)
        logger.info("Saved upload: %s", upload_path)
    except Exception as exc:
        logger.error("Failed to save upload: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded file: {exc}",
        )

    # ------------------------------------------------------------------
    # 3. Parse the PDF
    # ------------------------------------------------------------------
    try:
        parse_result = parse_statement(str(upload_path), password=password)
        account_details = parse_result.get("account_details", {})
        transactions = parse_result.get("transactions", [])
    except PDFPasswordRequiredError:
        upload_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "PDF_PASSWORD_REQUIRED",
                "message": "This PDF is password protected. Enter its password to continue.",
            },
        )
    except PDFInvalidPasswordError:
        upload_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "PDF_INVALID_PASSWORD",
                "message": "The PDF password is incorrect. Please try again.",
            },
        )
    except UnsupportedStatementError as exc:
        upload_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": "UNSUPPORTED_BANK_STATEMENT",
                "message": str(exc),
            },
        )
    except InvalidPDFError as exc:
        upload_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_PDF",
                "message": str(exc),
            },
        )
    except Exception as exc:
        upload_path.unlink(missing_ok=True)
        logger.exception("PDF parsing failed")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": "PDF_PARSE_FAILED",
                "message": (
                    "The statement could not be read. Check that it is an HDFC "
                    "Bank statement and try again."
                ),
            },
        )

    # ------------------------------------------------------------------
    # 4. Validate & clean transactions
    # ------------------------------------------------------------------
    transactions, _validation_report = validate_transactions(
        transactions,
        expected_credits=account_details.get("total_credits", 0.0),
        expected_debits=account_details.get("total_debits", 0.0),
    )

    # ------------------------------------------------------------------
    # 5. Categorise transactions
    # ------------------------------------------------------------------
    categoriser = CategorizationEngine()
    transactions = categoriser.categorize_all(transactions)

    # ------------------------------------------------------------------
    # 6. Generate analytics
    # ------------------------------------------------------------------
    analytics_engine = AnalyticsEngine()
    analytics = analytics_engine.generate_full_analytics(transactions)

    # ------------------------------------------------------------------
    # 7. Generate Excel report
    # ------------------------------------------------------------------
    excel_name = f"analysis_{uuid.uuid4().hex}.xlsx"
    excel_path = EXPORTS_DIR / excel_name

    try:
        excel_gen = ExcelGenerator()
        excel_gen.generate(account_details, transactions, analytics, str(excel_path))
    except Exception as exc:
        logger.error("Excel generation failed: %s", exc)
        # Non-fatal – we can still return the analysis without Excel
        excel_path = None

    # ------------------------------------------------------------------
    # 8. Persist analysis record
    # ------------------------------------------------------------------
    analysis = Analysis(
        user_id=current_user.id,
        original_pdf_name=file.filename,
        total_transactions=len(transactions),
        excel_file_path=str(excel_path) if excel_path else None,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    # ------------------------------------------------------------------
    # 9. Build response
    # ------------------------------------------------------------------
    return UploadResponse(
        message="Analysis completed successfully",
        analysis_id=analysis.id,
        total_transactions=len(transactions),
        account_details=account_details,
        category_summary=analytics.get("category_summary", []),
        monthly_analysis=analytics.get("monthly_analysis", []),
        top_transactions=analytics.get("top_transactions", []),
        salary_detection=analytics.get("salary_detection", []),
        emi_detection=analytics.get("emi_detection", []),
        categorization_stats=analytics.get("categorization_stats", {}),
    )

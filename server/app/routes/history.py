"""
History routes – list past analyses and download Excel reports.
"""

import logging
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.analysis import Analysis
from app.models.user import User
from app.schemas.analysis import AnalysisResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["History"])


@router.get("/history", response_model=List[AnalysisResponse])
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[AnalysisResponse]:
    """
    Return all analyses for the current user, ordered by upload date
    descending (most recent first).
    """
    analyses = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.upload_date.desc())
        .all()
    )
    return [AnalysisResponse.model_validate(a) for a in analyses]


@router.get("/download/{analysis_id}")
def download_report(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FileResponse:
    """
    Download the Excel report for a specific analysis.

    - Verifies the analysis belongs to the current user.
    - Returns the file as an attachment.
    """
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()

    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    if analysis.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this analysis",
        )

    if not analysis.excel_file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Excel report was not generated for this analysis",
        )

    file_path = Path(analysis.excel_file_path)
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Excel file not found on disk – it may have been deleted",
        )

    # Build a user-friendly download filename
    safe_name = analysis.original_pdf_name.replace(".pdf", "").replace(".PDF", "")
    download_name = f"{safe_name}_analysis.xlsx"

    return FileResponse(
        path=str(file_path),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=download_name,
    )


@router.delete("/history/{analysis_id}", status_code=status.HTTP_200_OK)
def delete_history_item(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete a specific analysis from history and remove its generated Excel report.
    """
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()

    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    if analysis.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this analysis",
        )

    # Delete the generated Excel report file from disk if it exists
    if analysis.excel_file_path:
        try:
            excel_path = Path(analysis.excel_file_path)
            if excel_path.exists():
                excel_path.unlink()
                logger.info("Deleted Excel report: %s", excel_path)
        except Exception as exc:
            logger.error("Failed to delete Excel file %s: %s", analysis.excel_file_path, exc)

    db.delete(analysis)
    db.commit()

    return {"message": "Analysis deleted successfully"}

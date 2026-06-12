"""
Parser factory – auto-detects the PDF type and routes to the
appropriate parser (text-based or OCR-based).
"""

import logging
from typing import Any, Dict

import fitz  # PyMuPDF

from app.parsers.text_parser import TextParser
from app.parsers.ocr_parser import OCRParser

logger = logging.getLogger(__name__)

# Minimum characters of extractable text per page to consider a PDF
# as text-based (digital). Below this threshold it is treated as scanned.
_TEXT_THRESHOLD = 50  # characters per page


class PDFPasswordRequiredError(ValueError):
    """Raised when a PDF is encrypted and no password was supplied."""


class PDFInvalidPasswordError(ValueError):
    """Raised when the supplied PDF password is incorrect."""


class InvalidPDFError(ValueError):
    """Raised when the uploaded file is not a readable PDF."""


class UnsupportedStatementError(ValueError):
    """Raised when a PDF is not a recognizable HDFC bank statement."""


def _validate_hdfc_statement(result: Dict[str, Any]) -> None:
    text = result.pop("_source_text", "")
    normalized = " ".join(text.upper().split())
    account_details = result.get("account_details", {})
    transactions = result.get("transactions", [])

    has_hdfc_identity = (
        "HDFC BANK" in normalized
        or str(account_details.get("ifsc", "")).upper().startswith("HDFC")
    )
    has_statement_columns = (
        any(marker in normalized for marker in ("NARRATION", "PARTICULARS", "DESCRIPTION"))
        and any(marker in normalized for marker in ("WITHDRAWAL", "DEBIT"))
        and any(marker in normalized for marker in ("DEPOSIT", "CREDIT"))
        and "BALANCE" in normalized
    )

    if not has_hdfc_identity:
        raise UnsupportedStatementError(
            "Only HDFC Bank statement PDFs are supported."
        )
    if not has_statement_columns or not transactions:
        raise UnsupportedStatementError(
            "This looks like an HDFC PDF, but no statement transactions could be read."
        )


def detect_pdf_type(file_path: str, password: str | None = None) -> str:
    """
    Determine whether a PDF is text-based or image/scanned.

    Opens the PDF with PyMuPDF and checks the first few pages for
    extractable text content.

    Args:
        file_path: Absolute path to the PDF.

    Returns:
        ``"text"`` if the PDF has sufficient extractable text,
        ``"scanned"`` otherwise.
    """
    try:
        doc = fitz.open(file_path)
        try:
            if doc.needs_pass:
                if not password:
                    raise PDFPasswordRequiredError("This PDF is password protected")
                if not doc.authenticate(password):
                    raise PDFInvalidPasswordError("The PDF password is incorrect")

            pages_to_check = min(3, len(doc))
            total_text_len = 0

            for page_num in range(pages_to_check):
                page = doc[page_num]
                text = page.get_text("text") or ""
                total_text_len += len(text.strip())
        finally:
            doc.close()

        avg_text_per_page = total_text_len / max(pages_to_check, 1)
        pdf_type = "text" if avg_text_per_page >= _TEXT_THRESHOLD else "scanned"
        logger.info(
            "PDF type detection: avg %.0f chars/page → %s  (%s)",
            avg_text_per_page,
            pdf_type,
            file_path,
        )
        return pdf_type

    except (PDFPasswordRequiredError, PDFInvalidPasswordError):
        raise
    except Exception as exc:
        logger.warning("PDF type detection failed for %s: %s", file_path, exc)
        raise InvalidPDFError("The uploaded file is not a readable PDF") from exc


def parse_statement(
    file_path: str,
    password: str | None = None,
) -> Dict[str, Any]:
    """
    Parse an HDFC bank statement PDF.

    Auto-detects whether the PDF is text-based or scanned/image and
    routes to the appropriate parser.

    Args:
        file_path: Absolute path to the PDF file.

    Returns:
        Unified result dictionary::

            {
                "account_details": { ... },
                "transactions": [ { ... }, ... ]
            }
    """
    pdf_type = detect_pdf_type(file_path, password)

    if pdf_type == "scanned":
        logger.info("Using OCR parser for: %s", file_path)
        parser = OCRParser()
    else:
        logger.info("Using text parser for: %s", file_path)
        parser = TextParser()

    try:
        result = parser.parse(file_path, password=password)
    except (PDFPasswordRequiredError, PDFInvalidPasswordError):
        raise
    except Exception as exc:
        message = str(exc).lower()
        if "password" in message:
            if password:
                raise PDFInvalidPasswordError("The PDF password is incorrect") from exc
            raise PDFPasswordRequiredError("This PDF is password protected") from exc
        raise

    # Ensure the result always has both keys
    result.setdefault("account_details", {})
    result.setdefault("transactions", [])
    _validate_hdfc_statement(result)

    logger.info(
        "Parsed %d transactions from %s",
        len(result["transactions"]),
        file_path,
    )
    return result

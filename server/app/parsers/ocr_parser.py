"""
OCR-based PDF parser for scanned HDFC bank statements.

Converts each PDF page to an image using pdf2image, then applies
Tesseract OCR via pytesseract.  The extracted text is parsed using
the same logic as the text parser.
"""

import logging
import re
from typing import Any, Dict, List

from app.parsers.text_parser import TextParser

logger = logging.getLogger(__name__)


class OCRParser:
    """Parse scanned / image-based HDFC bank statement PDFs using OCR."""

    def __init__(self) -> None:
        self._text_parser = TextParser()

    # ------------------------------------------------------------------ #
    # Public API
    # ------------------------------------------------------------------ #

    def parse(
        self,
        file_path: str,
        password: str | None = None,
    ) -> Dict[str, Any]:
        """
        Parse a scanned PDF via OCR.

        Args:
            file_path: Absolute path to the PDF file.

        Returns:
            Dictionary with ``account_details`` and ``transactions`` keys.
        """
        raw_text = self._ocr_extract(file_path, password)
        cleaned_text = self._clean_ocr_text(raw_text)

        # Reuse the text parser's internal methods via a small hack:
        # we call the private helpers directly on the merged text.
        account_details = self._text_parser._parse_account_details(cleaned_text)
        transactions = self._text_parser._parse_transactions(cleaned_text)

        total_credits = sum(t.get("credit", 0.0) for t in transactions)
        total_debits = sum(t.get("debit", 0.0) for t in transactions)
        account_details["total_credits"] = round(total_credits, 2)
        account_details["total_debits"] = round(total_debits, 2)

        return {
            "account_details": account_details,
            "transactions": transactions,
            "_source_text": cleaned_text,
        }

    # ------------------------------------------------------------------ #
    # OCR extraction
    # ------------------------------------------------------------------ #

    def _ocr_extract(
        self,
        file_path: str,
        password: str | None = None,
    ) -> str:
        """
        Convert PDF pages to images and run Tesseract OCR.

        Falls back to empty string per page on failure so that partial
        results can still be returned.
        """
        pages_text: List[str] = []

        try:
            from pdf2image import convert_from_path
            import pytesseract

            images = convert_from_path(file_path, dpi=300, userpw=password)

            for idx, image in enumerate(images):
                try:
                    text = pytesseract.image_to_string(
                        image,
                        lang="eng",
                        config="--psm 6",  # Assume uniform block of text
                    )
                    pages_text.append(text)
                except Exception as page_err:
                    logger.warning("OCR failed on page %d: %s", idx + 1, page_err)
                    pages_text.append("")

        except ImportError as imp_err:
            logger.error(
                "pdf2image or pytesseract not installed. "
                "OCR parsing unavailable: %s",
                imp_err,
            )
        except Exception as exc:
            logger.error("OCR extraction failed: %s", exc)
            raise

        return "\n".join(pages_text)

    # ------------------------------------------------------------------ #
    # OCR text cleaning
    # ------------------------------------------------------------------ #

    @staticmethod
    def _clean_ocr_text(text: str) -> str:
        """
        Clean up common OCR artefacts.

        - Fix common character misreadings (e.g. ``|`` → ``l``, ``0`` ↔ ``O``)
        - Remove stray non-printable characters
        - Normalise whitespace
        """
        # Replace common OCR mis-reads
        replacements = {
            "|": "l",
            "~": "-",
            "—": "-",
            "–": "-",
            "\u2018": "'",
            "\u2019": "'",
            "\u201c": '"',
            "\u201d": '"',
        }
        for old, new in replacements.items():
            text = text.replace(old, new)

        # Fix amounts where OCR reads 'O' as '0' in numeric context
        text = re.sub(r"(?<=\d)O(?=\d)", "0", text)
        text = re.sub(r"(?<=\d)o(?=\d)", "0", text)

        # Fix common 'l' / '1' confusion in amounts
        text = re.sub(r"(?<=\d)l(?=\d)", "1", text)
        text = re.sub(r"(?<=\d)I(?=\d)", "1", text)

        # Remove non-printable characters except newlines and tabs
        text = re.sub(r"[^\x20-\x7E\n\t]", " ", text)

        # Collapse multiple spaces
        text = re.sub(r"[ \t]{2,}", " ", text)

        # Collapse multiple blank lines
        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()

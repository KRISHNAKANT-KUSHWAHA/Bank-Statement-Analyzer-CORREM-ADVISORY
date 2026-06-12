"""
Text-based PDF parser for HDFC bank statements.

Uses pdfplumber to extract text from each page and then applies
regex-based parsing to identify account details and transactions.
"""

import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import pdfplumber


class TextParser:
    """Parse text-based (digital) HDFC bank statement PDFs."""

    # ------------------------------------------------------------------ #
    # Regex patterns
    # ------------------------------------------------------------------ #

    # Date formats: dd/mm/yy, dd/mm/yyyy, dd-mm-yy, dd-mm-yyyy
    DATE_PATTERN = re.compile(
        r"(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})"
    )

    # Full transaction line:
    # date  [value_date]  description  [ref]  debit  credit  balance
    TRANSACTION_LINE = re.compile(
        r"^(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})"  # date
        r"\s+"
        r"(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})?"  # optional value date
        r"\s*"
        r"(.+?)"  # description (non-greedy)
        r"\s+"
        r"([\d,]+\.\d{2})"  # amount 1 (debit or credit)
        r"(?:\s+([\d,]+\.\d{2}))?"  # amount 2 (optional)
        r"(?:\s+([\d,]+\.\d{2}))?"  # amount 3 / running balance (optional)
        r"\s*$",
        re.MULTILINE,
    )

    ACCOUNT_NUMBER_PATTERN = re.compile(r"(\d{10,14})")
    IFSC_PATTERN = re.compile(r"([A-Z]{4}0[A-Z0-9]{6})")
    AMOUNT_PATTERN = re.compile(r"([\d,]+\.\d{2})")

    # ------------------------------------------------------------------ #
    # Public API
    # ------------------------------------------------------------------ #

    def parse(
        self,
        file_path: str,
        password: str | None = None,
    ) -> Dict[str, Any]:
        """
        Parse a text-based HDFC bank statement PDF.

        Args:
            file_path: Absolute path to the PDF file.

        Returns:
            Dictionary with ``account_details`` and ``transactions`` keys.
        """
        raw_text = self._extract_text(file_path, password)
        account_details = self._parse_account_details(raw_text)
        transactions = self._parse_transactions(raw_text, account_details.get("opening_balance"))

        # Compute totals
        total_credits = sum(t.get("credit", 0.0) for t in transactions)
        total_debits = sum(t.get("debit", 0.0) for t in transactions)
        account_details["total_credits"] = round(total_credits, 2)
        account_details["total_debits"] = round(total_debits, 2)

        return {
            "account_details": account_details,
            "transactions": transactions,
            "_source_text": raw_text,
        }

    # ------------------------------------------------------------------ #
    # Text extraction
    # ------------------------------------------------------------------ #

    def _extract_text(
        self,
        file_path: str,
        password: str | None = None,
    ) -> str:
        """Extract all text from every page of the PDF."""
        pages_text: List[str] = []
        with pdfplumber.open(file_path, password=password) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages_text.append(text)
        return "\n".join(pages_text)

    # ------------------------------------------------------------------ #
    # Account details parsing
    # ------------------------------------------------------------------ #

    def _parse_account_details(self, text: str) -> Dict[str, Any]:
        """Extract account-level metadata from the statement text."""
        details: Dict[str, Any] = {
            "account_holder_name": "",
            "account_number": "",
            "bank_name": "HDFC Bank",
            "branch": "",
            "ifsc": "",
            "statement_period": "",
            "opening_balance": 0.0,
            "closing_balance": 0.0,
        }

        lines = text.split("\n")

        for i, line in enumerate(lines):
            upper = line.upper().strip()

            # Account number
            if not details["account_number"]:
                if any(kw in upper for kw in ["ACCOUNT NO", "ACCOUNT NUMBER", "A/C NO", "AC NO", "A/C NUMBER", "ACCOUNT_NO"]):
                    match = re.search(r"(\d[\d\s\-]{8,20}\d)", line)
                    if match:
                        acct_num = re.sub(r"[\s\-]", "", match.group(1))
                        if 9 <= len(acct_num) <= 18:
                            details["account_number"] = acct_num
                    elif i + 1 < len(lines):
                        next_line = lines[i + 1].strip()
                        match = re.search(r"(\d[\d\s\-]{8,20}\d)", next_line)
                        if match:
                            acct_num = re.sub(r"[\s\-]", "", match.group(1))
                            if 9 <= len(acct_num) <= 18:
                                details["account_number"] = acct_num

            # IFSC
            if not details["ifsc"]:
                ifsc_match = self.IFSC_PATTERN.search(line)
                if ifsc_match:
                    details["ifsc"] = ifsc_match.group(1)

            # Branch
            if "BRANCH" in upper and not details["branch"]:
                parts = re.split(r"BRANCH\s*:?\s*", line, flags=re.IGNORECASE)
                if len(parts) > 1:
                    details["branch"] = parts[-1].strip()

            # Account holder name
            if not details["account_holder_name"]:
                if any(kw in upper for kw in ["ACCOUNT HOLDER", "CUSTOMER NAME", "NAME", "MR.", "MRS.", "MS.", "SHRI", "SMT"]):
                    # Try to extract the name from the same line
                    name_match = re.search(
                        r"(?:ACCOUNT\s*HOLDER|CUSTOMER\s*NAME|NAME)\s*:?\s*(.+)",
                        line,
                        re.IGNORECASE,
                    )
                    if name_match:
                        details["account_holder_name"] = name_match.group(1).strip()
                    else:
                        # Sometimes the name is on the next line
                        cleaned = re.sub(r"(MR\.|MRS\.|MS\.|SHRI|SMT)\.?\s*", "", line, flags=re.IGNORECASE).strip()
                        if cleaned and len(cleaned) > 2:
                            details["account_holder_name"] = cleaned

            # Statement period
            if "STATEMENT" in upper and ("FROM" in upper or "PERIOD" in upper or "TO" in upper):
                dates_found = self.DATE_PATTERN.findall(line)
                if len(dates_found) >= 2:
                    details["statement_period"] = f"{dates_found[0]} to {dates_found[1]}"
                else:
                    word_dates = re.findall(
                        r"(\d{1,2}[/\-\s]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[/\-\s]+\d{2,4})",
                        line,
                        re.IGNORECASE
                    )
                    if len(word_dates) >= 2:
                        details["statement_period"] = f"{word_dates[0]} to {word_dates[1]}"
                    elif word_dates:
                        details["statement_period"] = word_dates[0]
                    elif dates_found:
                        details["statement_period"] = dates_found[0]

            # Opening balance
            if "OPENING" in upper and "BALANCE" in upper:
                amt = self.AMOUNT_PATTERN.findall(line)
                if amt:
                    if "CLOSING" in upper and len(amt) >= 2:
                        details["opening_balance"] = self._parse_amount(amt[0])
                    else:
                        details["opening_balance"] = self._parse_amount(amt[-1])

            # Closing balance
            if "CLOSING" in upper and "BALANCE" in upper:
                amt = self.AMOUNT_PATTERN.findall(line)
                if amt:
                    details["closing_balance"] = self._parse_amount(amt[-1])

        # Fallback: try to find account number anywhere near keywords
        if not details["account_number"]:
            match = re.search(
                r"(?:ACCOUNT\s*NO|ACCOUNT\s*NUMBER|A/C\s*NO|AC\s*NO|A/C\s*NUMBER|ACCOUNT_NO)\s*:?\s*(\d[\d\s\-]{8,20}\d)",
                text,
                re.IGNORECASE
            )
            if match:
                acct_num = re.sub(r"[\s\-]", "", match.group(1))
                if 9 <= len(acct_num) <= 18:
                    details["account_number"] = acct_num

        return details

    # ------------------------------------------------------------------ #
    # Transaction parsing
    # ------------------------------------------------------------------ #

    def _parse_transactions(self, text: str, opening_balance: Optional[float] = None) -> List[Dict[str, Any]]:
        """
        Parse individual transactions from the statement text.

        HDFC statements typically have columns:
        Date | Narration | Chq./Ref.No. | Value Dt | Withdrawal Amt. | Deposit Amt. | Closing Balance
        """
        transactions: List[Dict[str, Any]] = []
        lines = text.split("\n")

        current_txn: Optional[Dict[str, Any]] = None
        header_found = False

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            upper = stripped.upper()

            # Detect the header row to know when transactions start
            if any(kw in upper for kw in ["NARRATION", "PARTICULARS", "DESCRIPTION", "WITHDRAWAL AMT", "DEPOSIT AMT"]):
                header_found = True
                continue

            # Skip non-transaction lines before header
            if not header_found:
                # Also try to detect transactions without explicit header
                if not self.DATE_PATTERN.match(stripped):
                    continue

            # Check if line starts with a date (new transaction)
            date_match = self.DATE_PATTERN.match(stripped)
            if date_match:
                # Save previous transaction if exists
                if current_txn is not None:
                    transactions.append(current_txn)

                current_txn = self._parse_transaction_line(stripped)
            elif current_txn is not None:
                # Multi-line description continuation
                # Only append if it doesn't look like a summary/footer line
                if not any(kw in upper for kw in [
                    "OPENING BALANCE", "CLOSING BALANCE", "STATEMENT SUMMARY",
                    "PAGE", "TOTAL", "GENERATED", "THIS IS A COMPUTER"
                ]):
                    # Check if this line has amounts (could be continuation with amounts)
                    amounts = self.AMOUNT_PATTERN.findall(stripped)
                    if amounts and len(amounts) >= 2:
                        # This might be amounts from a wrapped line
                        self._apply_amounts_to_txn(current_txn, amounts)
                    else:
                        current_txn["description"] += " " + stripped

        # Don't forget the last transaction
        if current_txn is not None:
            transactions.append(current_txn)

        # Post-process to correctly assign debit vs credit based on running balance
        for i, txn in enumerate(transactions):
            amount = txn.get("debit", 0.0)
            current_bal = txn.get("running_balance", 0.0)
            
            # We only fix if we defaulted to debit and there's an amount
            if amount > 0 and txn.get("credit", 0.0) == 0.0:
                prev_bal = opening_balance if i == 0 else transactions[i-1].get("running_balance", 0.0)
                
                # If we don't have a reliable previous balance (e.g. first transaction with no opening balance)
                if prev_bal is None or prev_bal == 0.0:
                    desc_upper = txn.get("description", "").upper()
                    credit_keywords = [
                        "/DEP/", "CREDIT", "NEFT/IN", "IMPS/IN", "UPI/CR", 
                        "BY ", "NEFT CR", "RTGS CR", "UPI CR", " CR ", 
                        " CR-", "- CR", "SALARY", "REFUND", "DIVIDEND", "CASH DEP"
                    ]
                    if any(kw in desc_upper for kw in credit_keywords):
                        txn["credit"] = amount
                        txn["debit"] = 0.0
                else:
                    diff_if_credit = round(current_bal - amount, 2)
                    diff_if_debit = round(current_bal + amount, 2)
                    
                    if abs(diff_if_credit - prev_bal) < 0.1:
                        txn["credit"] = amount
                        txn["debit"] = 0.0
                    elif abs(diff_if_debit - prev_bal) < 0.1:
                        txn["debit"] = amount
                        txn["credit"] = 0.0
                    else:
                        # Fallback to keywords if math doesn't perfectly align due to missed transactions
                        desc_upper = txn.get("description", "").upper()
                        credit_keywords = [
                            "/DEP/", "CREDIT", "NEFT/IN", "IMPS/IN", "UPI/CR", 
                            "BY ", "NEFT CR", "RTGS CR", "UPI CR", " CR ", 
                            " CR-", "- CR", "SALARY", "REFUND", "DIVIDEND", "CASH DEP"
                        ]
                        if any(kw in desc_upper for kw in credit_keywords):
                            txn["credit"] = amount
                            txn["debit"] = 0.0

        return transactions

    def _parse_transaction_line(self, line: str) -> Dict[str, Any]:
        """Parse a single transaction line into a structured dictionary."""
        txn: Dict[str, Any] = {
            "date": "",
            "value_date": "",
            "description": "",
            "cheque_ref_no": "",
            "credit": 0.0,
            "debit": 0.0,
            "running_balance": 0.0,
        }

        # Extract date at start
        date_match = self.DATE_PATTERN.match(line)
        if date_match:
            txn["date"] = self._normalize_date(date_match.group(1))
            rest = line[date_match.end():].strip()
        else:
            rest = line

        # Find all amounts in the rest of the line
        amounts = self.AMOUNT_PATTERN.findall(rest)

        # Remove amounts from the description portion
        desc_part = rest
        for amt in amounts:
            desc_part = desc_part.replace(amt, "", 1)
        desc_part = re.sub(r"\s{2,}", " ", desc_part).strip()

        # Check for a second date (value date)
        val_date_match = self.DATE_PATTERN.match(desc_part)
        if val_date_match:
            txn["value_date"] = self._normalize_date(val_date_match.group(1))
            desc_part = desc_part[val_date_match.end():].strip()
        else:
            # Sometimes value date appears inside description
            inner_dates = self.DATE_PATTERN.findall(desc_part)
            if inner_dates:
                txn["value_date"] = self._normalize_date(inner_dates[-1])

        # Extract cheque/ref number (typically numeric, 6-15 digits)
        ref_match = re.search(r"\b(\d{6,15})\b", desc_part)
        if ref_match:
            txn["cheque_ref_no"] = ref_match.group(1)

        txn["description"] = desc_part.strip()

        # Assign amounts based on HDFC format
        self._apply_amounts_to_txn(txn, amounts)

        return txn

    def _apply_amounts_to_txn(self, txn: Dict[str, Any], amounts: List[str]) -> None:
        """
        Assign parsed amount strings to debit, credit, and running balance fields.

        HDFC format typically: Withdrawal | Deposit | Closing Balance
        """
        parsed = [self._parse_amount(a) for a in amounts]

        if len(parsed) == 3:
            # withdrawal, deposit, balance
            txn["debit"] = parsed[0]
            txn["credit"] = parsed[1]
            txn["running_balance"] = parsed[2]
        elif len(parsed) == 2:
            # Could be (debit, balance) or (credit, balance)
            # If first amount is 0, it's (credit=0, balance) or vice versa
            txn["running_balance"] = parsed[-1]
            # Heuristic: if the balance decreases, it's a debit
            if txn.get("running_balance", 0) > 0:
                # Can't determine direction without previous balance,
                # default to debit for first amount
                txn["debit"] = parsed[0]
        elif len(parsed) == 1:
            txn["running_balance"] = parsed[0]

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #

    @staticmethod
    def _parse_amount(amount_str: str) -> float:
        """Convert an amount string like '1,23,456.78' to a float."""
        try:
            return float(amount_str.replace(",", ""))
        except (ValueError, TypeError):
            return 0.0

    @staticmethod
    def _normalize_date(date_str: str) -> str:
        """
        Normalise various date formats to DD/MM/YYYY.

        Accepts dd/mm/yy, dd/mm/yyyy, dd-mm-yy, dd-mm-yyyy.
        """
        date_str = date_str.replace("-", "/")
        parts = date_str.split("/")
        if len(parts) == 3:
            day, month, year = parts
            if len(year) == 2:
                year_int = int(year)
                year = f"20{year}" if year_int < 50 else f"19{year}"
            return f"{day.zfill(2)}/{month.zfill(2)}/{year}"
        return date_str

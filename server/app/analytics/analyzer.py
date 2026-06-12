"""
Analytics engine for HDFC bank statement transactions.

Provides aggregated insights: category summary, monthly analysis,
top transactions, salary detection, EMI detection, and categorization
statistics.
"""

import logging
import re
from collections import defaultdict
from datetime import datetime
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


class AnalyticsEngine:
    """Generate analytical insights from categorised transactions."""

    # ------------------------------------------------------------------ #
    # Category summary
    # ------------------------------------------------------------------ #

    def category_summary(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Group transactions by category and aggregate totals.

        Returns a list of dicts sorted by total debit descending::

            [
                {
                    "category": "Food & Dining",
                    "transaction_count": 42,
                    "total_debit": 15000.00,
                    "total_credit": 0.00,
                },
                ...
            ]
        """
        buckets: Dict[str, Dict[str, Any]] = defaultdict(
            lambda: {"transaction_count": 0, "total_debit": 0.0, "total_credit": 0.0}
        )

        for txn in transactions:
            cat = txn.get("category", "Other")
            buckets[cat]["transaction_count"] += 1
            buckets[cat]["total_debit"] += txn.get("debit", 0.0)
            buckets[cat]["total_credit"] += txn.get("credit", 0.0)

        result = []
        for cat, data in buckets.items():
            result.append({
                "category": cat,
                "transaction_count": data["transaction_count"],
                "total_debit": round(data["total_debit"], 2),
                "total_credit": round(data["total_credit"], 2),
            })

        result.sort(key=lambda x: x["total_debit"], reverse=True)
        return result

    # ------------------------------------------------------------------ #
    # Monthly analysis
    # ------------------------------------------------------------------ #

    def monthly_analysis(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Group transactions by month (YYYY-MM) and sum inflows / outflows.

        Returns a sorted list::

            [
                {"month": "2024-01", "inflows": 50000.00, "outflows": 35000.00, "net": 15000.00},
                ...
            ]
        """
        buckets: Dict[str, Dict[str, float]] = defaultdict(
            lambda: {"inflows": 0.0, "outflows": 0.0}
        )

        for txn in transactions:
            month_key = self._extract_month(txn.get("date", ""))
            if not month_key:
                continue
            buckets[month_key]["inflows"] += txn.get("credit", 0.0)
            buckets[month_key]["outflows"] += txn.get("debit", 0.0)

        result = []
        for month, data in sorted(buckets.items()):
            inflows = round(data["inflows"], 2)
            outflows = round(data["outflows"], 2)
            result.append({
                "month": month,
                "inflows": inflows,
                "outflows": outflows,
                "net": round(inflows - outflows, 2),
            })

        return result

    # ------------------------------------------------------------------ #
    # Top transactions
    # ------------------------------------------------------------------ #

    def top_transactions(
        self, transactions: List[Dict[str, Any]], n: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Return the top *n* transactions by amount (max of credit, debit).
        """

        def _amount(txn: Dict) -> float:
            return max(txn.get("credit", 0.0), txn.get("debit", 0.0))

        sorted_txns = sorted(transactions, key=_amount, reverse=True)
        top = sorted_txns[:n]

        return [
            {
                "date": t.get("date", ""),
                "description": t.get("description", ""),
                "credit": t.get("credit", 0.0),
                "debit": t.get("debit", 0.0),
                "amount": _amount(t),
                "category": t.get("category", "Other"),
            }
            for t in top
        ]

    # ------------------------------------------------------------------ #
    # Salary detection
    # ------------------------------------------------------------------ #

    def detect_salary(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Find recurring monthly credits with similar amounts (within 10 %
        variance) that are likely salary payments.

        Strategy:
        1. Filter credit transactions.
        2. Group by month.
        3. For each month pick the largest credit.
        4. Check if amounts across months are within 10 % of the median.
        """
        # Collect credits by month
        monthly_credits: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        for txn in transactions:
            if txn.get("credit", 0.0) > 0:
                month = self._extract_month(txn.get("date", ""))
                if month:
                    monthly_credits[month].append(txn)

        if len(monthly_credits) < 2:
            return []

        # Pick largest credit per month
        candidates = []
        for month in sorted(monthly_credits):
            txns = monthly_credits[month]
            best = max(txns, key=lambda t: t.get("credit", 0.0))
            candidates.append({
                "month": month,
                "amount": best.get("credit", 0.0),
                "description": best.get("description", ""),
                "date": best.get("date", ""),
            })

        if not candidates:
            return []

        # Compute median
        amounts = sorted(c["amount"] for c in candidates)
        mid = len(amounts) // 2
        median = (
            amounts[mid]
            if len(amounts) % 2 == 1
            else (amounts[mid - 1] + amounts[mid]) / 2
        )

        if median == 0:
            return []

        # Keep entries within 10 % of median
        salary_entries = [
            c for c in candidates if abs(c["amount"] - median) / median <= 0.10
        ]

        if len(salary_entries) >= 2:
            logger.info("Detected %d probable salary entries", len(salary_entries))
            return salary_entries

        return []

    # ------------------------------------------------------------------ #
    # EMI detection
    # ------------------------------------------------------------------ #

    def detect_emi(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Find recurring monthly debits with similar amounts (within 5 %
        variance) that are likely EMI payments.

        Strategy similar to salary detection but for debits with stricter
        variance and keyword hints.
        """
        monthly_debits: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        for txn in transactions:
            if txn.get("debit", 0.0) > 0:
                month = self._extract_month(txn.get("date", ""))
                if month:
                    monthly_debits[month].append(txn)

        if len(monthly_debits) < 2:
            return []

        # Collect all debit amounts and group similar amounts
        all_debits: List[Dict[str, Any]] = []
        for month, txns in monthly_debits.items():
            for txn in txns:
                all_debits.append({
                    "month": month,
                    "amount": txn.get("debit", 0.0),
                    "description": txn.get("description", ""),
                    "date": txn.get("date", ""),
                })

        # Group by similar amount (within 5 %)
        emi_groups: List[List[Dict[str, Any]]] = []
        used = set()

        sorted_debits = sorted(all_debits, key=lambda x: x["amount"], reverse=True)

        for i, d1 in enumerate(sorted_debits):
            if i in used or d1["amount"] < 100:  # ignore very small amounts
                continue
            group = [d1]
            used.add(i)
            for j, d2 in enumerate(sorted_debits):
                if j in used or j == i:
                    continue
                if d1["amount"] > 0 and abs(d1["amount"] - d2["amount"]) / d1["amount"] <= 0.05:
                    # Different months check
                    if d2["month"] != d1["month"] or d2["month"] not in [g["month"] for g in group]:
                        group.append(d2)
                        used.add(j)
            if len(group) >= 2:
                emi_groups.append(group)

        # Flatten to unique entries per EMI series
        result: List[Dict[str, Any]] = []
        for group in emi_groups:
            # Deduplicate by month
            seen_months = set()
            for entry in sorted(group, key=lambda x: x["month"]):
                if entry["month"] not in seen_months:
                    seen_months.add(entry["month"])
                    result.append(entry)

        if result:
            logger.info("Detected %d probable EMI entries", len(result))

        return result

    # ------------------------------------------------------------------ #
    # Categorization stats
    # ------------------------------------------------------------------ #

    def categorization_stats(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Return categorization coverage statistics.
        """
        total = len(transactions)
        if total == 0:
            return {
                "categorized_count": 0,
                "uncategorized_count": 0,
                "categorized_pct": 0.0,
                "uncategorized_pct": 0.0,
                "total": 0,
            }

        uncategorized = sum(1 for t in transactions if t.get("category", "Other") == "Other")
        categorized = total - uncategorized

        return {
            "categorized_count": categorized,
            "uncategorized_count": uncategorized,
            "categorized_pct": round((categorized / total) * 100, 2),
            "uncategorized_pct": round((uncategorized / total) * 100, 2),
            "total": total,
        }

    # ------------------------------------------------------------------ #
    # Full analytics bundle
    # ------------------------------------------------------------------ #

    def generate_full_analytics(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Run all analytics and return a combined result dictionary.
        """
        return {
            "category_summary": self.category_summary(transactions),
            "monthly_analysis": self.monthly_analysis(transactions),
            "top_transactions": self.top_transactions(transactions),
            "salary_detection": self.detect_salary(transactions),
            "emi_detection": self.detect_emi(transactions),
            "categorization_stats": self.categorization_stats(transactions),
        }

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #

    @staticmethod
    def _extract_month(date_str: str) -> str:
        """
        Extract YYYY-MM from a date string.

        Supports dd/mm/yyyy and dd-mm-yyyy formats.
        """
        if not date_str:
            return ""

        # Try dd/mm/yyyy or dd-mm-yyyy
        match = re.match(r"(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})", date_str)
        if match:
            day, month, year = match.groups()
            return f"{year}-{month.zfill(2)}"

        # Try dd/mm/yy
        match = re.match(r"(\d{1,2})[/\-](\d{1,2})[/\-](\d{2})", date_str)
        if match:
            day, month, year = match.groups()
            full_year = f"20{year}" if int(year) < 50 else f"19{year}"
            return f"{full_year}-{month.zfill(2)}"

        return ""

"""
Transaction categorization engine.

Matches each transaction description against the keyword / regex rules
defined in ``category_rules.py`` and assigns a category label.
"""

import logging
from typing import Any, Dict, List

from app.categorizer.category_rules import CATEGORY_RULES

logger = logging.getLogger(__name__)


class CategorizationEngine:
    """Rule-based transaction categoriser."""

    def __init__(self) -> None:
        # Load rules (exclude the catch-all "Other" from matching)
        self._rules: Dict[str, Dict] = {
            cat: rule
            for cat, rule in CATEGORY_RULES.items()
            if cat != "Other"
        }

    # ------------------------------------------------------------------ #
    # Public API
    # ------------------------------------------------------------------ #

    def categorize_transaction(self, description: str) -> str:
        """
        Determine the category of a single transaction.

        Args:
            description: The transaction narration / description.

        Returns:
            Category name string (one of the 16 categories).
        """
        if not description:
            return "Other"

        normalised = description.upper().strip()

        # Pass 1 – keyword substring match (longest keyword first for accuracy)
        for category, rule in self._rules.items():
            keywords: List[str] = rule.get("keywords", [])
            for kw in keywords:
                if kw.upper() in normalised:
                    return category

        # Pass 2 – regex pattern match
        for category, rule in self._rules.items():
            patterns = rule.get("patterns", [])
            for pattern in patterns:
                if pattern.search(normalised):
                    return category

        return "Other"

    def categorize_all(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Add a ``category`` field to every transaction in the list.

        Args:
            transactions: List of transaction dicts (must have a
                ``description`` key).

        Returns:
            The same list, mutated in-place, with ``category`` added.
        """
        categorised_count = 0
        for txn in transactions:
            desc = txn.get("description", "")
            category = self.categorize_transaction(desc)
            txn["category"] = category
            if category != "Other":
                categorised_count += 1

        logger.info(
            "Categorised %d / %d transactions (%.1f%%)",
            categorised_count,
            len(transactions),
            (categorised_count / max(len(transactions), 1)) * 100,
        )
        return transactions

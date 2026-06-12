"""
Transaction validation utilities.

Provides functions to drop zero-value transactions, verify the balance
chain, and verify aggregate totals.
"""

import logging
from typing import Any, Dict, List, Tuple

logger = logging.getLogger(__name__)


def drop_zero_transactions(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Remove transactions where both credit and debit are zero.

    Args:
        transactions: List of transaction dicts.

    Returns:
        Filtered list with zero-amount entries removed.
    """
    original_count = len(transactions)
    filtered = [
        txn for txn in transactions
        if txn.get("credit", 0.0) != 0.0 or txn.get("debit", 0.0) != 0.0
    ]
    removed = original_count - len(filtered)
    if removed:
        logger.info("Dropped %d zero-amount transactions", removed)
    return filtered


def verify_balance_chain(
    transactions: List[Dict[str, Any]],
) -> Tuple[bool, List[Dict[str, Any]]]:
    """
    Verify that the running balance follows the chain:

        prev_balance + credit - debit = current_balance

    Args:
        transactions: Ordered list of transaction dicts with
            ``credit``, ``debit``, and ``running_balance`` fields.

    Returns:
        Tuple of (is_valid, list_of_discrepancies).
        Each discrepancy dict contains the transaction index, expected
        balance, actual balance, and the difference.
    """
    discrepancies: List[Dict[str, Any]] = []

    for i in range(1, len(transactions)):
        prev_balance = transactions[i - 1].get("running_balance", 0.0)
        credit = transactions[i].get("credit", 0.0)
        debit = transactions[i].get("debit", 0.0)
        actual_balance = transactions[i].get("running_balance", 0.0)

        expected = round(prev_balance + credit - debit, 2)
        actual = round(actual_balance, 2)

        if abs(expected - actual) > 0.01:  # tolerance for floating point
            discrepancies.append({
                "index": i,
                "date": transactions[i].get("date", ""),
                "description": transactions[i].get("description", "")[:60],
                "expected_balance": expected,
                "actual_balance": actual,
                "difference": round(actual - expected, 2),
            })

    is_valid = len(discrepancies) == 0
    if not is_valid:
        logger.warning(
            "Balance chain has %d discrepancies out of %d transactions",
            len(discrepancies),
            len(transactions),
        )
    return is_valid, discrepancies


def verify_totals(
    transactions: List[Dict[str, Any]],
    expected_credits: float = 0.0,
    expected_debits: float = 0.0,
) -> Dict[str, Any]:
    """
    Verify that the sum of credits and debits matches expected values.

    Args:
        transactions: List of transaction dicts.
        expected_credits: Expected total credits from the statement.
        expected_debits: Expected total debits from the statement.

    Returns:
        Verification report dict.
    """
    actual_credits = round(sum(t.get("credit", 0.0) for t in transactions), 2)
    actual_debits = round(sum(t.get("debit", 0.0) for t in transactions), 2)

    credits_match = (
        abs(actual_credits - expected_credits) < 0.01
        if expected_credits > 0
        else True
    )
    debits_match = (
        abs(actual_debits - expected_debits) < 0.01
        if expected_debits > 0
        else True
    )

    return {
        "credits_match": credits_match,
        "debits_match": debits_match,
        "actual_credits": actual_credits,
        "actual_debits": actual_debits,
        "expected_credits": expected_credits,
        "expected_debits": expected_debits,
        "credit_difference": round(actual_credits - expected_credits, 2),
        "debit_difference": round(actual_debits - expected_debits, 2),
    }


def validate_transactions(
    transactions: List[Dict[str, Any]],
    expected_credits: float = 0.0,
    expected_debits: float = 0.0,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Run all validations on the parsed transactions.

    1. Drops zero-amount transactions.
    2. Verifies balance chain.
    3. Verifies aggregate totals.

    Args:
        transactions: Raw parsed transaction list.
        expected_credits: Expected total credits (0 = skip check).
        expected_debits: Expected total debits (0 = skip check).

    Returns:
        Tuple of (cleaned_transactions, validation_report).
    """
    # Step 1 – drop zeros
    cleaned = drop_zero_transactions(transactions)

    # Step 2 – balance chain
    chain_valid, chain_discrepancies = verify_balance_chain(cleaned)

    # Step 3 – totals
    totals_report = verify_totals(cleaned, expected_credits, expected_debits)

    report = {
        "original_count": len(transactions),
        "cleaned_count": len(cleaned),
        "zero_dropped": len(transactions) - len(cleaned),
        "balance_chain_valid": chain_valid,
        "balance_chain_discrepancies": chain_discrepancies,
        "totals_verification": totals_report,
    }

    logger.info(
        "Validation complete – %d → %d transactions, chain_valid=%s",
        len(transactions),
        len(cleaned),
        chain_valid,
    )
    return cleaned, report

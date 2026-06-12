"""
Category rules for HDFC bank statement transaction categorization.

Each category has:
- ``keywords``: list of substrings to match (case-insensitive)
- ``patterns``: list of compiled regex patterns

All 16 categories are defined here with comprehensive keyword lists.
"""

import re
from typing import Any, Dict, List


def _compile(patterns: List[str]) -> List[re.Pattern]:
    """Compile a list of regex pattern strings (case-insensitive)."""
    return [re.compile(p, re.IGNORECASE) for p in patterns]


CATEGORY_RULES: Dict[str, Dict[str, Any]] = {

    # ------------------------------------------------------------------ #
    # 1. Salary
    # ------------------------------------------------------------------ #
    "Salary": {
        "keywords": [
            "SALARY", "SAL", "PAYROLL", "STIPEND", "WAGES", "CREDIT SALARY",
            "NEFT SALARY", "MONTHLY SALARY", "PAY", "REMUNERATION",
            "COMPENSATION", "EMOLUMENT", "HONORARIUM", "BONUS", "INCENTIVE",
            "ALLOWANCE", "DA", "HRA", "CONVEYANCE", "OVERTIME", "ARREARS",
            "GRATUITY", "COMMISSION", "CONSULTANCY FEE", "PROFESSIONAL FEE",
            "FREELANCE", "CONTRACT PAY", "RETAINER", "NET PAY", "GROSS PAY",
            "TAKE HOME", "CTC", "ANNUAL BONUS", "PERFORMANCE BONUS",
            "JOINING BONUS", "RETENTION BONUS", "VARIABLE PAY",
            "DEFERRED COMP", "SALARY CREDIT", "SAL CR",
        ],
        "patterns": _compile([
            r"SAL(?:ARY)?\s*(?:CR|CREDIT)",
            r"NEFT.*SAL",
            r"PAY\s*ROLL",
            r"SALARY\s*(?:FOR|OF)\s*\w+",
            r"(?:MONTHLY|ANNUAL)\s*(?:SAL|SALARY|PAY)",
        ]),
    },

    # ------------------------------------------------------------------ #
    # 2. EMI / Loan
    # ------------------------------------------------------------------ #
    "EMI/Loan": {
        "keywords": [
            "EMI", "LOAN", "MORTGAGE", "HOME LOAN", "CAR LOAN",
            "PERSONAL LOAN", "EDUCATION LOAN", "VEHICLE LOAN", "GOLD LOAN",
            "CONSUMER LOAN", "BUSINESS LOAN", "OVERDRAFT", "CREDIT LINE",
            "BAJAJ FINSERV", "HDFC LTD", "LICHFL", "TATA CAPITAL",
            "MANAPPURAM", "MUTHOOT", "SHRIRAM", "FULLERTON",
            "ICICI BANK EMI", "AXIS BANK EMI", "SBI LOAN", "PNB HOUSING",
            "INDIABULLS", "REPAYMENT", "INSTALLMENT", "EQUATED MONTHLY",
            "PRINCIPAL", "INTEREST PAYMENT", "FORECLOSURE", "PREPAYMENT",
            "BOUNCE CHARGE", "LOAN EMI", "AUTO LOAN", "TWO WHEELER LOAN",
            "LOAN REPAY", "NACH DEBIT", "NACH EMI",
        ],
        "patterns": _compile([
            r"EMI.*(?:LOAN|\d+)",
            r"(?:HOME|CAR|PERSONAL)\s*LOAN",
            r"LOAN\s*(?:REPAY|EMI)",
            r"(?:BAJAJ|TATA|HDFC)\s*(?:FINSERV|CAPITAL|LTD).*EMI",
            r"NACH.*(?:EMI|LOAN)",
        ]),
    },

    # ------------------------------------------------------------------ #
    # 3. Food & Dining
    # ------------------------------------------------------------------ #
    "Food & Dining": {
        "keywords": [
            "SWIGGY", "ZOMATO", "DOMINOS", "PIZZA HUT", "MCDONALDS", "KFC",
            "BURGER KING", "STARBUCKS", "CAFE COFFEE DAY", "CCD", "SUBWAY",
            "DUNKIN", "BASKIN ROBBINS", "HALDIRAMS", "BARBEQUE NATION",
            "PUNJABI", "RESTAURANT", "FOOD", "DINING", "EATERY", "CANTEEN",
            "MESS", "TIFFIN", "CATERING", "BIRYANI", "DOSA", "CHAI", "TEA",
            "JUICE", "BAKERY", "CONFECTIONERY", "SNACKS", "BEVERAGES",
            "FROZEN", "GROFERS", "BIGBASKET", "BLINKIT", "ZEPTO",
            "INSTAMART", "DMART", "FRESH", "SUPERMARKET", "GROCERY",
            "FOOD PANDA", "UBER EATS", "EAT SURE", "FAASOS", "BEHROUZ",
            "OVEN STORY", "FRESHMENU", "BOX8",
        ],
        "patterns": _compile([
            r"(?:SWIGGY|ZOMATO|FOOD).*(?:ORDER|PAY)",
            r"REST(?:AURANT)?",
            r"CAFE|HOTEL.*FOOD",
            r"(?:BLINKIT|ZEPTO|INSTAMART|BIGBASKET).*(?:ORDER|PAY)",
        ]),
    },

    # ------------------------------------------------------------------ #
    # 4. Travel
    # ------------------------------------------------------------------ #
    "Travel": {
        "keywords": [
            "UBER", "OLA", "RAPIDO", "IRCTC", "MAKEMYTRIP", "GOIBIBO",
            "CLEARTRIP", "YATRA", "REDBUS", "IXIGO", "AIR INDIA", "INDIGO",
            "SPICEJET", "VISTARA", "GO AIR", "AIRASIA", "EMIRATES",
            "FLIGHT", "RAILWAY", "TRAIN", "BUS", "CAB", "TAXI", "AUTO",
            "METRO", "TOLL", "PARKING", "FUEL", "PETROL", "DIESEL", "CNG",
            "HP", "BPCL", "IOCL", "SHELL", "FASTAG", "NHAI", "AIRPORT",
            "BOOKING", "HOTEL", "OYO", "TREEBO", "FABHOTELS", "AIRBNB",
            "TRIVAGO", "AGODA", "EASEMYTRIP", "HAPPYEASYGO",
        ],
        "patterns": _compile([
            r"(?:UBER|OLA|RAPIDO).*(?:TRIP|RIDE)",
            r"(?:IRCTC|MAKEMYTRIP|CLEARTRIP)",
            r"(?:PETROL|DIESEL|FUEL).*PUMP",
            r"(?:AIR\s*INDIA|INDIGO|SPICEJET|VISTARA)",
            r"FASTAG.*(?:TOLL|NHAI)",
        ]),
    },

    # ------------------------------------------------------------------ #
    # 5. Shopping
    # ------------------------------------------------------------------ #
    "Shopping": {
        "keywords": [
            "AMAZON", "FLIPKART", "MYNTRA", "AJIO", "MEESHO", "SNAPDEAL",
            "TATACLIQ", "NYKAA", "PURPLLE", "SHOPPERS STOP", "LIFESTYLE",
            "RELIANCE", "CENTRAL", "PANTALOONS", "WESTSIDE", "ZARA", "H&M",
            "MAX", "DECATHLON", "CROMA", "RELIANCE DIGITAL", "VIJAY SALES",
            "DMART", "BIG BAZAAR", "SPENCER", "MORE", "SPAR", "EASYDAY",
            "LENSKART", "FIRSTCRY", "PEPPERFRY", "URBAN LADDER", "IKEA",
            "HOME CENTRE", "FABINDIA", "BATA", "NIKE", "ADIDAS", "PUMA",
            "REEBOK", "SHOPCLUES", "PAYTM MALL", "JIOMART",
        ],
        "patterns": _compile([
            r"(?:AMAZON|FLIPKART|MYNTRA).*(?:PAY|ORDER)",
            r"SHOPPING",
            r"(?:ONLINE|E-?COMMERCE).*(?:PURCHASE|ORDER)",
            r"(?:CROMA|VIJAY\s*SALES|RELIANCE\s*DIGITAL)",
        ]),
    },

    # ------------------------------------------------------------------ #
    # 6. Utilities
    # ------------------------------------------------------------------ #
    "Utilities": {
        "keywords": [
            "ELECTRICITY", "WATER", "GAS", "PIPED GAS", "PNG", "LPG",
            "ADANI GAS", "MAHANAGAR GAS", "IGL", "BSES", "TATA POWER",
            "RELIANCE ENERGY", "MSEB", "BESCOM", "CESC", "TORRENT POWER",
            "MUNICIPAL", "CORPORATION", "BMC", "PROPERTY TAX", "WATER TAX",
            "SEWAGE", "MAINTENANCE", "SOCIETY", "APARTMENT", "WASTE",
            "GARBAGE", "CLEANING", "ELECTRIC BILL", "WATER BILL",
            "GAS BILL", "UTILITY BILL", "INDRAPRASTHA GAS",
        ],
        "patterns": _compile([
            r"(?:ELECTRIC|WATER|GAS).*(?:BILL|CHARGE|PAYMENT)",
            r"(?:BSES|TATA POWER|BESCOM)",
            r"UTILITY.*(?:BILL|PAY)",
            r"(?:SOCIETY|MAINTENANCE).*(?:CHARGE|FEE|PAY)",
        ]),
    },

    # ------------------------------------------------------------------ #
    # 7. Telecom
    # ------------------------------------------------------------------ #
    "Telecom": {
        "keywords": [
            "AIRTEL", "JIO", "VODAFONE", "VI", "IDEA", "BSNL", "MTNL",
            "ACT FIBERNET", "HATHWAY", "DEN", "TIKONA", "TATA SKY", "D2H",
            "DISH TV", "SUN DIRECT", "AIRTEL XSTREAM", "JIO FIBER",
            "BROADBAND", "INTERNET", "WIFI", "MOBILE", "RECHARGE",
            "PREPAID", "POSTPAID", "DATA PACK", "ROAMING", "SIM",
            "TELEPHONE", "LANDLINE", "EXCITEL", "SPECTRA",
        ],
        "patterns": _compile([
            r"(?:AIRTEL|JIO|VODAFONE|VI|BSNL).*(?:RECHARGE|BILL|PREPAID|POSTPAID)",
            r"(?:MOBILE|PHONE).*(?:RECHARGE|BILL)",
            r"BROADBAND|INTERNET.*BILL",
            r"(?:TATA\s*SKY|DISH\s*TV|D2H|SUN\s*DIRECT)",
        ]),
    },

    # ------------------------------------------------------------------ #
    # 8. Entertainment
    # ------------------------------------------------------------------ #
    "Entertainment": {
        "keywords": [
            "NETFLIX", "AMAZON PRIME", "HOTSTAR", "DISNEY", "SONY LIV",
            "ZEE5", "VOOT", "ALT BALAJI", "MX PLAYER", "SPOTIFY", "GAANA",
            "JIOSAAVN", "APPLE MUSIC", "YOUTUBE PREMIUM", "AUDIBLE",
            "KINDLE", "BOOK MY SHOW", "PVR", "INOX", "CINEPOLIS",
            "MULTIPLEX", "MOVIE", "CINEMA", "THEATRE", "CONCERT", "EVENT",
            "GAMING", "STEAM", "PLAYSTATION", "XBOX", "NINTENDO", "PUBG",
            "DREAM11", "MPL", "BOOKMYSHOW", "JIOCINEMA", "LIONSGATE",
        ],
        "patterns": _compile([
            r"(?:NETFLIX|PRIME|HOTSTAR|SPOTIFY).*(?:SUBSCRIPTION|RENEWAL)",
            r"(?:PVR|INOX|CINEPOLIS).*(?:TICKET|MOVIE)",
            r"(?:GAMING|STREAM)",
            r"(?:BOOK\s*MY\s*SHOW|BOOKMYSHOW)",
        ]),
    },

    # ------------------------------------------------------------------ #
    # 9. Healthcare
    # ------------------------------------------------------------------ #
    "Healthcare": {
        "keywords": [
            "HOSPITAL", "CLINIC", "DOCTOR", "MEDICAL", "PHARMACY",
            "MEDICINE", "APOLLO", "FORTIS", "MAX HOSPITAL", "MEDANTA",
            "NARAYANA", "MANIPAL", "AIIMS", "DIAGNOSTIC", "LAB",
            "PATHOLOGY", "THYROCARE", "SRL", "DENTAL", "OPTICAL",
            "PRACTO", "1MG", "PHARMEASY", "NETMEDS", "MEDLIFE",
            "HEALTHCARE", "WELLNESS", "GYM", "FITNESS", "CULTFIT",
            "GOLD GYM", "ANYTIME FITNESS", "YOGA", "PHYSIOTHERAPY",
            "AMBULANCE", "BLOOD BANK", "HEALTH", "MEDPLUS", "TATA 1MG",
            "TRUEMEDS", "DAVAINDIA",
        ],
        "patterns": _compile([
            r"(?:HOSPITAL|CLINIC|MEDICAL).*(?:BILL|CHARGE|PAY)",
            r"(?:APOLLO|FORTIS|MAX).*(?:HOSPITAL|PHARMACY)",
            r"(?:PHARMA|MEDICINE|DRUG)",
            r"(?:1MG|PHARMEASY|NETMEDS|MEDLIFE)",
        ]),
    },

    # ------------------------------------------------------------------ #
    # 10. Education
    # ------------------------------------------------------------------ #
    "Education": {
        "keywords": [
            "SCHOOL", "COLLEGE", "UNIVERSITY", "INSTITUTE", "ACADEMY",
            "TUITION", "COACHING", "CLASS", "COURSE", "UDEMY", "COURSERA",
            "UNACADEMY", "BYJU", "VEDANTU", "WHITEHAT", "TOPPR", "EXAM",
            "FEE", "ADMISSION", "EDUCATION", "STUDENT", "LIBRARY", "BOOK",
            "STATIONERY", "SCHOLARSHIP", "TRAINING", "CERTIFICATION",
            "UPGRAD", "SIMPLILEARN", "EDUREKA", "GREAT LEARNING", "SKILL",
            "WORKSHOP", "SEMINAR", "ALLEN", "FIITJEE", "AAKASH",
            "RESONANCE", "PHYSICS WALLAH",
        ],
        "patterns": _compile([
            r"(?:SCHOOL|COLLEGE|UNIVERSITY).*(?:FEE|TUITION)",
            r"(?:UDEMY|COURSERA|BYJU|UNACADEMY)",
            r"(?:EDUCATION|TUITION).*(?:FEE|PAY)",
            r"(?:UPGRAD|SIMPLILEARN|GREAT\s*LEARNING)",
        ]),
    },

    # ------------------------------------------------------------------ #
    # 11. Investments
    # ------------------------------------------------------------------ #
    "Investments": {
        "keywords": [
            "MUTUAL FUND", "SIP", "MF", "GROWW", "ZERODHA", "UPSTOX",
            "ANGEL", "MOTILAL", "HDFC AMC", "SBI MF", "ICICI PRU",
            "AXIS MF", "KOTAK MF", "NIPPON", "TATA MF", "ADITYA BIRLA",
            "UTI", "FRANKLIN", "DSP", "EDELWEISS", "MIRAE", "PPFAS",
            "QUANT MF", "DEMAT", "SHARE", "STOCK", "EQUITY", "NSE", "BSE",
            "TRADING", "BROKER", "FIXED DEPOSIT", "FD", "RD", "RECURRING",
            "NPS", "PPF", "EPF", "BOND", "DEBENTURE", "GOLD BOND", "SGB",
            "KFINTECH", "CAMS", "SMALLCASE", "COIN", "PAYTM MONEY",
        ],
        "patterns": _compile([
            r"(?:SIP|MUTUAL\s*FUND|MF).*(?:PURCHASE|INVEST)",
            r"(?:ZERODHA|GROWW|UPSTOX)",
            r"(?:FD|FIXED\s*DEPOSIT|RD)",
            r"(?:NPS|PPF|EPF).*(?:CONTRIBUTION|DEPOSIT)",
        ]),
    },

    # ------------------------------------------------------------------ #
    # 12. Insurance
    # ------------------------------------------------------------------ #
    "Insurance": {
        "keywords": [
            "LIC", "INSURANCE", "PREMIUM", "POLICY", "HEALTH INSURANCE",
            "LIFE INSURANCE", "MOTOR INSURANCE", "VEHICLE INSURANCE",
            "CAR INSURANCE", "BIKE INSURANCE", "TRAVEL INSURANCE",
            "HDFC LIFE", "ICICI LOMBARD", "BAJAJ ALLIANZ", "MAX LIFE",
            "SBI LIFE", "TATA AIA", "STAR HEALTH", "CARE HEALTH",
            "NIVA BUPA", "ACKO", "DIGIT", "GO DIGIT", "POLICYBAZAAR",
            "COVERFOX", "TERM PLAN", "ENDOWMENT", "ULIP", "MEDICLAIM",
            "GROUP INSURANCE", "HDFC ERGO", "NEW INDIA ASSURANCE",
            "ORIENTAL INSURANCE", "NATIONAL INSURANCE",
        ],
        "patterns": _compile([
            r"(?:LIC|INSURANCE).*(?:PREMIUM|POLICY|RENEWAL)",
            r"(?:HDFC|ICICI|BAJAJ|SBI).*(?:LIFE|INSURANCE)",
            r"PREMIUM.*(?:PAY|RENEW)",
            r"(?:STAR|CARE|NIVA).*HEALTH",
        ]),
    },

    # ------------------------------------------------------------------ #
    # 13. Cash Withdrawal
    # ------------------------------------------------------------------ #
    "Cash Withdrawal": {
        "keywords": [
            "ATM", "CASH", "WITHDRAWAL", "SELF", "ATM WDL", "CASH WDL",
            "NEFT SELF", "RTGS SELF", "CASH DEPOSIT", "CDM", "CHEQUE SELF",
            "SELF CHQ", "SELF CHEQUE", "BRANCH WITHDRAWAL", "COUNTER",
            "CASH COUNTER", "TELLER", "SELF TRANSFER", "OWN ACCOUNT",
            "ATM CASH", "CASH WITHDRAWAL", "SELF WITHDRAWAL",
        ],
        "patterns": _compile([
            r"ATM.*(?:WDL|WITHDRAWAL|CASH)",
            r"CASH.*(?:WDL|WITHDRAWAL)",
            r"SELF.*(?:WDL|TRANSFER|CHQ)",
            r"(?:BRANCH|COUNTER).*(?:WITHDRAWAL|CASH)",
        ]),
    },

    # ------------------------------------------------------------------ #
    # 14. UPI / Transfer
    # ------------------------------------------------------------------ #
    "UPI/Transfer": {
        "keywords": [
            "UPI", "PHONEPE", "PAYTM", "GPAY", "GOOGLEPAY", "GOOGLE PAY",
            "BHIM", "IMPS", "RTGS", "NEFT", "FUND TRANSFER",
            "BANK TRANSFER", "WIRE TRANSFER", "MONEY TRANSFER",
            "REMITTANCE", "NACH", "ECS", "MANDATE", "STANDING INSTRUCTION",
            "AUTO DEBIT", "DIRECT DEBIT", "BENEFICIARY", "PAYEE",
            "CREDIT TRANSFER", "MOBILE BANKING", "NET BANKING",
            "ONLINE TRANSFER", "THIRD PARTY", "IBT", "IFT",
            "WHATSAPP PAY", "CRED",
        ],
        "patterns": _compile([
            r"UPI.*(?:CR|DR|P2P|P2M)",
            r"(?:NEFT|RTGS|IMPS).*(?:CR|DR|TRANSFER)",
            r"(?:PHONEPE|PAYTM|GPAY|BHIM)",
            r"UPI[-/]\w+",
        ]),
    },

    # ------------------------------------------------------------------ #
    # 15. Rent
    # ------------------------------------------------------------------ #
    "Rent": {
        "keywords": [
            "RENT", "LEASE", "TENANT", "LANDLORD", "HOUSE RENT",
            "OFFICE RENT", "SHOP RENT", "COMMERCIAL RENT", "RENTAL", "PG",
            "PAYING GUEST", "HOSTEL", "ACCOMMODATION", "LODGE", "ROOM RENT",
            "FLAT RENT", "APARTMENT RENT", "PROPERTY", "REAL ESTATE",
            "BROKER", "BROKERAGE", "SECURITY DEPOSIT", "ADVANCE RENT",
            "MONTHLY RENT",
        ],
        "patterns": _compile([
            r"RENT.*(?:PAY|CREDIT|TRANSFER)",
            r"(?:HOUSE|FLAT|OFFICE).*RENT",
            r"(?:LANDLORD|TENANT)",
            r"(?:MONTHLY|ADVANCE)\s*RENT",
        ]),
    },

    # ------------------------------------------------------------------ #
    # 16. Other (default fallback)
    # ------------------------------------------------------------------ #
    "Other": {
        "keywords": [],
        "patterns": [],
    },
}

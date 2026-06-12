# 🏦 HDFC Bank Statement Analyzer

**A production-ready full-stack application for analyzing HDFC Bank statement PDFs.**

Built for **Correm Advisory** — automatically parses bank statements, categorizes transactions, generates analytics, and exports professional Excel reports.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Tech Stack](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python-green)
![Tech Stack](https://img.shields.io/badge/Database-SQLite-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Category Engine](#-category-engine)
- [Excel Output](#-excel-output)
- [Deployment Guide](#-deployment-guide)
- [Sample Test Data](#-sample-test-data)

---

## ✨ Features

### Core Functionality
- 📄 **PDF Parsing** — Extract transactions from text-based and scanned (OCR) HDFC bank statements
- 🏷️ **Smart Categorization** — Auto-categorize transactions across 16 categories using 500+ keywords
- 📊 **Advanced Analytics** — Monthly trends, salary/EMI detection, category summaries
- 📥 **Excel Export** — Professional 3-sheet Excel reports with formatted data
- 🔐 **Authentication** — Secure JWT-based signup/login with bcrypt password hashing
- 📜 **Analysis History** — Track and re-download all past analyses

### PDF Processing
- Text PDF extraction via `pdfplumber`
- Scanned PDF processing via `pytesseract` OCR pipeline
- Automatic PDF type detection using `PyMuPDF`
- Transaction validation (balance chain, zero-amount filtering)

### Analytics Engine
- Category-wise summary (debits, credits, transaction count)
- Monthly inflow/outflow analysis
- Top 5 largest transactions
- Recurring salary detection (monthly credits with similar amounts)
- Recurring EMI detection (monthly debits with similar amounts)
- Categorization coverage statistics

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| Tailwind CSS | Styling |
| Axios | HTTP client |
| Framer Motion | Animations |
| Lucide React | Icons |
| Context API | State management |
| JWT | Authentication |

### Backend
| Technology | Purpose |
|-----------|---------|
| Python 3.10+ | Runtime |
| FastAPI | Web framework |
| SQLAlchemy | ORM |
| SQLite | Database |
| python-jose | JWT tokens |
| passlib + bcrypt | Password hashing |
| pdfplumber | Text PDF parsing |
| PyMuPDF (fitz) | PDF type detection |
| pytesseract | OCR engine |
| pdf2image | PDF to image conversion |
| openpyxl | Excel generation |

---

## 📁 Project Structure

```
CORREM ADVISORY project/
├── client/                          # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalysisResult.jsx   # Analysis display component
│   │   │   ├── FileUpload.jsx       # Drag & drop upload
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── ProtectedRoute.jsx   # Auth route guard
│   │   │   └── StatsCard.jsx        # Reusable stat card
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication context
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   ├── History.jsx          # Analysis history
│   │   │   ├── Landing.jsx          # Landing page
│   │   │   ├── Login.jsx            # Login page
│   │   │   └── Signup.jsx           # Signup page
│   │   ├── routes/
│   │   │   └── AppRouter.jsx        # Route configuration
│   │   ├── services/
│   │   │   └── api.js               # Axios API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                          # Python Backend
│   ├── app/
│   │   ├── analytics/
│   │   │   └── analyzer.py          # Analytics engine
│   │   ├── auth/
│   │   │   ├── dependencies.py      # Auth dependencies
│   │   │   └── jwt_handler.py       # JWT utilities
│   │   ├── categorizer/
│   │   │   ├── category_rules.py    # 500+ categorization rules
│   │   │   └── engine.py            # Categorization engine
│   │   ├── database/
│   │   │   └── connection.py        # DB connection & session
│   │   ├── excel/
│   │   │   └── generator.py         # Excel report generator
│   │   ├── models/
│   │   │   ├── analysis.py          # Analysis model
│   │   │   └── user.py              # User model
│   │   ├── parsers/
│   │   │   ├── ocr_parser.py        # OCR PDF parser
│   │   │   ├── parser_factory.py    # Parser routing
│   │   │   ├── text_parser.py       # Text PDF parser
│   │   │   └── validators.py        # Transaction validators
│   │   ├── routes/
│   │   │   ├── auth.py              # Auth endpoints
│   │   │   ├── history.py           # History endpoints
│   │   │   └── upload.py            # Upload endpoint
│   │   └── schemas/
│   │       ├── analysis.py          # Analysis schemas
│   │       └── auth.py              # Auth schemas
│   ├── uploads/                     # Uploaded PDFs
│   ├── exports/                     # Generated Excel files
│   ├── main.py                      # FastAPI entry point
│   ├── .env                         # Environment variables
│   └── requirements.txt             # Python dependencies
│
└── README.md
```
## AI Tools Used

This project was developed with the assistance of AI tools:

- **ChatGPT** – Requirement analysis, project planning, and documentation.
- **Claude** – Architecture discussions and implementation guidance.
- **Antigravity** – Feature implementation, code generation, and debugging.
- **Codex** – Development assistance, code review, and issue resolution.

> AI tools were used as development assistants. Final integration, testing, deployment, and submission were completed by the author.
## 📁 Project Screensort

---

<img width="1866" height="857" alt="image" src="https://github.com/user-attachments/assets/220b7ea6-ef8b-4548-849e-4f90f88d5c9e" />

<img width="1748" height="810" alt="image" src="https://github.com/user-attachments/assets/dcb4107f-e25f-4531-bcd9-8144adc55800" />

<img width="1622" height="658" alt="image" src="https://github.com/user-attachments/assets/62bffb6d-5283-4b49-b6e6-99d3ac5f3a9e" />

<img width="1607" height="402" alt="image" src="https://github.com/user-attachments/assets/d842c838-81da-4b1b-982b-9461a64cbf82" />

<img width="1515" height="485" alt="image" src="https://github.com/user-attachments/assets/5fcd8887-3841-45c4-a7bc-2d8a592dab80" />

<img width="1517" height="666" alt="image" src="https://github.com/user-attachments/assets/3215eb95-8c34-461e-8a6f-f71f178c723f" />

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Tesseract OCR** (for scanned PDFs)
  - Windows: Download from [UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)
  - macOS: `brew install tesseract`
  - Linux: `sudo apt-get install tesseract-ocr`
- **Poppler** (for pdf2image)
  - Windows: Download from [poppler releases](https://github.com/ossamamehmood/Poppler/releases)
  - macOS: `brew install poppler`
  - Linux: `sudo apt-get install poppler-utils`

### Backend Setup

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing secret | `hdfc-bank-analyzer-secret-key-2024-correm-advisory` |
| `DATABASE_URL` | SQLite connection string | `sqlite:///./hdfc_analyzer.db` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry in minutes | `1440` (24 hours) |

### Frontend (`client/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` (uses Vite proxy in dev) |

---

## 📡 API Documentation

### Authentication

#### `POST /api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### `POST /api/auth/login`
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### `GET /api/profile`
Get current user profile. Requires Bearer token.

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-15T10:30:00"
}
```

### Statement Analysis

#### `POST /api/upload`
Upload and analyze a bank statement PDF. Requires Bearer token.

**Request:** `multipart/form-data` with `file` field (PDF)

**Response (200):**
```json
{
  "message": "Analysis completed successfully",
  "analysis_id": 1,
  "total_transactions": 45,
  "account_details": {
    "account_holder": "JOHN DOE",
    "account_number": "12345678901234",
    "bank_name": "HDFC BANK",
    "branch": "MUMBAI MAIN",
    "ifsc": "HDFC0001234",
    "statement_period": "01/04/2024 to 30/04/2024",
    "opening_balance": 50000.00,
    "closing_balance": 45000.00,
    "total_credits": 125000.00,
    "total_debits": 130000.00
  },
  "category_summary": [...],
  "monthly_analysis": [...],
  "top_transactions": [...],
  "salary_detection": [...],
  "emi_detection": [...],
  "categorization_stats": {
    "categorized_count": 42,
    "uncategorized_count": 3,
    "categorized_pct": 93.33,
    "uncategorized_pct": 6.67
  }
}
```

#### `GET /api/history`
Get analysis history for current user. Requires Bearer token.

**Response (200):**
```json
[
  {
    "id": 1,
    "original_pdf_name": "statement_april_2024.pdf",
    "upload_date": "2024-05-01T14:30:00",
    "total_transactions": 45,
    "excel_file_path": "exports/analysis_1_20240501.xlsx"
  }
]
```

#### `GET /api/download/{analysis_id}`
Download generated Excel file. Requires Bearer token.

**Response:** Excel file download (`.xlsx`)

---

## 🏷️ Category Engine

The categorization engine uses **500+ keywords** and **regex patterns** across **16 categories**:

| Category | Keywords | Description |
|----------|----------|-------------|
| Salary | 35+ | Employment income detection |
| EMI/Loan | 35+ | Loan installment detection |
| Food & Dining | 45+ | Restaurant, delivery, grocery |
| Travel | 45+ | Transport, fuel, hotels |
| Shopping | 40+ | E-commerce, retail stores |
| Utilities | 30+ | Electricity, water, gas |
| Telecom | 30+ | Mobile, internet, DTH |
| Entertainment | 35+ | OTT, movies, gaming |
| Healthcare | 35+ | Hospitals, pharmacy, fitness |
| Education | 35+ | Schools, online learning |
| Investments | 40+ | MF, SIP, stocks, FD |
| Insurance | 30+ | Life, health, vehicle |
| Cash Withdrawal | 20+ | ATM, self withdrawal |
| UPI/Transfer | 30+ | Digital payments, NEFT/RTGS |
| Rent | 25+ | Housing, PG, commercial |
| Other | — | Default fallback |

---

## 📊 Excel Output

The generated Excel file contains **3 professionally formatted sheets**:

### Sheet 1: Account Details
Key-value pairs of extracted account information with bold headers.

### Sheet 2: Transaction Ledger
Complete transaction table with columns: Date, Value Date, Description, Cheque/Ref No, Deposits (CR), Withdrawals (DR), Running Balance, Category.

### Sheet 3: Analytics
- Category Summary table
- Monthly Inflow/Outflow Analysis
- Top 5 Largest Transactions
- Salary Detection Results
- EMI Detection Results
- Categorization Statistics

---

## 🚢 Deployment Guide

### Backend Deployment (Render)

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a New Web Service:**
   - Connect your GitHub repository
   - Select the `server` directory as root
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables:**
   ```
   SECRET_KEY=your-production-secret-key-here
   DATABASE_URL=sqlite:///./hdfc_analyzer.db
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```

4. **Deploy** — Render will automatically build and deploy.

### Frontend Deployment (Vercel)

1. **Create a Vercel account** at [vercel.com](https://vercel.com)

2. **Import Project:**
   - Connect your GitHub repository
   - Set Root Directory to `client`
   - Framework Preset: Vite

3. **Set Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

4. **Deploy** — Vercel will build and deploy automatically.

5. **Update CORS:** In `server/main.py`, add your Vercel domain to the CORS allowed origins.

---

## 🧪 Sample Test Data

To test the application, you can:

1. **Use any HDFC Bank statement PDF** — The parser is designed to handle standard HDFC formats.

2. **Test flow:**
   - Sign up with a new account
   - Log in with your credentials
   - Upload an HDFC bank statement PDF
   - View the analysis results
   - Download the Excel report
   - Check analysis history

3. **Expected behavior:**
   - Text PDFs: Parsed instantly using pdfplumber
   - Scanned PDFs: Processed via OCR (requires Tesseract installed)
   - All transactions categorized automatically
   - Excel file generated with 3 formatted sheets

---

## 🔒 Security

- Passwords hashed using **bcrypt** (never stored in plain text)
- JWT tokens with configurable expiry
- Protected API routes require valid Bearer token
- File uploads restricted to PDF format
- User-specific data isolation (users can only access their own analyses)

---

## 📄 License

This project is built for **Correm Advisory** as an HDFC Bank Statement Analyzer assignment.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ by **krishnakant kushwaha**

"""
HDFC Bank Statement Analyzer – FastAPI application entry point.

- Configures CORS middleware (permissive for development)
- Registers auth, upload, and history routers
- Creates DB tables on startup
- Serves uploaded files and exported reports as static files
"""

import logging
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------------------------------
# Ensure the server directory is on sys.path so that `app.*` imports work
# regardless of how the server is started.
# ---------------------------------------------------------------------------
_SERVER_DIR = Path(__file__).resolve().parent
if str(_SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(_SERVER_DIR))

# Load environment variables
load_dotenv(dotenv_path=_SERVER_DIR / ".env")

# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Import DB and models (must come after sys.path adjustment)
# ---------------------------------------------------------------------------
from app.database.connection import Base, engine  # noqa: E402
from app.config import EXPORTS_DIR, UPLOADS_DIR, get_cors_origins  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.analysis import Analysis  # noqa: E402
from app.routes.auth import router as auth_router  # noqa: E402
from app.routes.upload import router as upload_router  # noqa: E402
from app.routes.history import router as history_router  # noqa: E402

# ---------------------------------------------------------------------------
# Create FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="HDFC Bank Statement Analyzer",
    description=(
        "Upload HDFC bank statement PDFs and receive categorized transaction "
        "analysis with downloadable Excel reports."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS middleware – allow all origins during development
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Include routers
# ---------------------------------------------------------------------------
app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(history_router)

# ---------------------------------------------------------------------------
# Directories for uploads and exports
# ---------------------------------------------------------------------------
# Startup event
# ---------------------------------------------------------------------------
@app.on_event("startup")
def on_startup() -> None:
    """Create DB tables and required directories on application start."""
    logger.info("Creating database tables …")
    Base.metadata.create_all(bind=engine)

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
    logger.info("uploads/ and exports/ directories ensured.")

    logger.info("HDFC Bank Statement Analyzer is ready 🚀")


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
def root():
    """Health-check / landing endpoint."""
    return {
        "application": "HDFC Bank Statement Analyzer",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


# ---------------------------------------------------------------------------
# Run with: python main.py  (for quick local dev)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )

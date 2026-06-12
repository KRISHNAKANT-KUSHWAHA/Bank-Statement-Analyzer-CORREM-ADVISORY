"""
Pydantic schemas for analysis / upload endpoints.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AnalysisResponse(BaseModel):
    """Schema returned when listing past analyses."""

    id: int
    original_pdf_name: str
    upload_date: datetime
    total_transactions: int
    excel_file_path: Optional[str] = None

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    """Comprehensive response returned after a successful PDF upload & analysis."""

    message: str = "Analysis completed successfully"
    analysis_id: int
    total_transactions: int
    account_details: Dict[str, Any] = Field(default_factory=dict)
    category_summary: List[Dict[str, Any]] = Field(default_factory=list)
    monthly_analysis: List[Dict[str, Any]] = Field(default_factory=list)
    top_transactions: List[Dict[str, Any]] = Field(default_factory=list)
    salary_detection: List[Dict[str, Any]] = Field(default_factory=list)
    emi_detection: List[Dict[str, Any]] = Field(default_factory=list)
    categorization_stats: Dict[str, Any] = Field(default_factory=dict)

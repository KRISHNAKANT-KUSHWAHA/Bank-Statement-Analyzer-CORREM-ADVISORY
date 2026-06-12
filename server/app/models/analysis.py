"""
Analysis ORM model.

Represents a single bank-statement analysis performed by a user.
Stores metadata about the uploaded PDF and generated Excel report.
"""

from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Analysis(Base):
    """Record of a single bank statement analysis."""

    __tablename__ = "analyses"

    id: int = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    original_pdf_name: str = Column(String(255), nullable=False)
    upload_date: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
    total_transactions: int = Column(Integer, default=0)
    excel_file_path: str = Column(String(500), nullable=True)

    # Many-to-one relationship with user
    user = relationship("User", back_populates="analyses")

    def __repr__(self) -> str:
        return (
            f"<Analysis id={self.id} pdf={self.original_pdf_name!r} "
            f"txns={self.total_transactions}>"
        )

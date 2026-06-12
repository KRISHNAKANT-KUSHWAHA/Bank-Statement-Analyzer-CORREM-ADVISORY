"""
User ORM model.

Represents an application user who can upload and analyse
HDFC bank statements.
"""

from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from app.database.connection import Base


class User(Base):
    """Application user account."""

    __tablename__ = "users"

    id: int = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name: str = Column(String(100), nullable=False)
    email: str = Column(String(255), unique=True, nullable=False, index=True)
    password_hash: str = Column(String(255), nullable=False)
    created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)

    # One-to-many relationship with analyses
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"

"""
Pydantic schemas for authentication endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserSignup(BaseModel):
    """Request body for user registration."""

    name: str = Field(..., min_length=1, max_length=100, examples=["Rahul Sharma"])
    email: EmailStr = Field(..., examples=["rahul@example.com"])
    password: str = Field(..., min_length=6, max_length=128, examples=["securePass123"])


class UserLogin(BaseModel):
    """Request body for user login."""

    email: EmailStr = Field(..., examples=["rahul@example.com"])
    password: str = Field(..., min_length=1, examples=["securePass123"])


class TokenResponse(BaseModel):
    """JWT token returned after successful auth."""

    access_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    """Public user profile information."""

    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

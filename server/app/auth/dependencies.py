"""
FastAPI security dependencies.

Provides ``get_current_user`` which extracts, verifies the Bearer token
and returns the authenticated User ORM object.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.auth.jwt_handler import verify_token
from app.database.connection import get_db
from app.models.user import User

# Use HTTPBearer so Swagger UI shows a lock icon / token input
_bearer_scheme = HTTPBearer(auto_error=True)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency that authenticates the current request.

    Extracts the Bearer token from the Authorization header, verifies it,
    looks up the user in the database and returns the User object.

    Raises:
        HTTPException 401 if the token is missing, invalid, or the user
        no longer exists.
    """
    token = credentials.credentials

    try:
        payload = verify_token(token)
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token – missing subject",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found – account may have been deleted",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

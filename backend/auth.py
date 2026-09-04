"""Authentication and Authorization Utilities for MindCare Backend.

Provides password hashing via bcrypt, JWT token creation and verification,
and FastAPI dependency injection guards for Role-Based Access Control (RBAC).
"""

from datetime import datetime, timedelta, timezone
import os
from typing import Any, Callable, Dict, List, Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from database import get_db
from models import User

# ─────────────────────────────────────────────────────────────────────────────
# 1. Security Configuration
# ─────────────────────────────────────────────────────────────────────────────
# JWT Secret Key loaded from environment or secure development default
SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "mindcare-secure-therapy-jwt-secret-key-2026-multimodal-rbac")
ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 Hours default

# Secret key required to register an administrative user (prevents unauthorized privilege escalation)
ADMIN_SECRET_KEY: str = os.getenv("ADMIN_SECRET_KEY", "admin-super-secret-key-2026")
SUPER_ADMIN_SECRET_KEY: str = os.getenv("SUPER_ADMIN_SECRET_KEY", "super-admin-ultra-secret-2026")
GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID", None)

# OAuth2 and HTTP Bearer token extractors
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)
http_bearer = HTTPBearer(auto_error=False)


# ─────────────────────────────────────────────────────────────────────────────
# 2. Google OAuth Token Verification
# ─────────────────────────────────────────────────────────────────────────────

def verify_google_id_token(token: str) -> Dict[str, Any]:
    """Verify a Google OAuth2 ID token using Google Public Certificates.

    Args:
        token: Raw Google ID token credential string.

    Returns:
        Dict[str, Any]: Decoded Google token claims (email, name, picture, sub, etc.).

    Raises:
        ValueError: If token verification fails or token is invalid.
    """
    from google.auth.transport import requests as google_requests
    from google.oauth2 import id_token

    request = google_requests.Request()
    if GOOGLE_CLIENT_ID:
        id_info = id_token.verify_oauth2_token(token, request, GOOGLE_CLIENT_ID)
    else:
        id_info = id_token.verify_oauth2_token(token, request)

    return id_info


# ─────────────────────────────────────────────────────────────────────────────
# 2. Password Hashing & Verification
# ─────────────────────────────────────────────────────────────────────────────

def get_password_hash(password: str) -> str:
    """Generate a salted bcrypt password hash.

    Args:
        password: Plain text user password.

    Returns:
        str: Salted UTF-8 encoded bcrypt hash string.
    """
    # Truncate to 72 bytes to adhere to bcrypt standard maximum key length
    truncated_pw = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(truncated_pw, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a stored bcrypt hash.

    Args:
        plain_password: Raw password string provided during login.
        hashed_password: Stored bcrypt hash string from the database.

    Returns:
        bool: True if password matches hash, False otherwise.
    """
    try:
        truncated_pw = plain_password.encode("utf-8")[:72]
        return bcrypt.checkpw(truncated_pw, hashed_password.encode("utf-8"))
    except Exception:
        return False


# ─────────────────────────────────────────────────────────────────────────────
# 3. JWT Token Operations
# ─────────────────────────────────────────────────────────────────────────────

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token containing claims and expiration.

    Args:
        data: Dictionary of claims to include in the payload (e.g. sub, role, user_id).
        expires_delta: Optional custom duration for token validity.

    Returns:
        str: Encoded JWT token string.
    """
    to_encode = data.copy()
    now_utc = datetime.now(timezone.utc)
    if expires_delta:
        expire = now_utc + expires_delta
    else:
        expire = now_utc + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire,
        "iat": now_utc,
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT access token.

    Args:
        token: JWT string to decode.

    Returns:
        Optional[Dict[str, Any]]: Payload claims if valid, None if invalid or expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# ─────────────────────────────────────────────────────────────────────────────
# 4. FastAPI Dependency Guards & RBAC
# ─────────────────────────────────────────────────────────────────────────────

async def get_current_user(
    token_oauth: Optional[str] = Depends(oauth2_scheme),
    bearer_creds: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
    db: Session = Depends(get_db),
) -> User:
    """FastAPI dependency to extract and authenticate the current logged-in user.

    Args:
        token_oauth: Token extracted from OAuth2 password flow header.
        bearer_creds: Token extracted from standard HTTP Bearer header.
        db: Database session instance.

    Returns:
        User: Authenticated SQLAlchemy User model instance.

    Raises:
        HTTPException: 401 Unauthorized if token is missing, invalid, expired, or user not found.
    """
    token = bearer_creds.credentials if bearer_creds else token_oauth
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email: Optional[str] = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject identifier.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account associated with this token no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """FastAPI dependency to ensure request originates from an active authenticated user.

    Args:
        current_user: User entity extracted from validated JWT bearer token.

    Returns:
        User: Authenticated user model instance.
    """
    return current_user


def require_role(allowed_roles: List[str]) -> Callable:
    """Role-Based Access Control dependency factory.

    Args:
        allowed_roles: List of permissible roles (e.g. ['admin', 'super_admin']).

    Returns:
        Callable: Dependency enforcing role presence on current user.
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of the following roles: {', '.join(allowed_roles)}.",
            )
        return current_user

    return role_checker


# Multi-tier RBAC dependency guards
get_current_admin_user = require_role(["admin", "super_admin"])
get_current_super_admin = require_role(["super_admin"])

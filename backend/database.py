"""SQLite Database Configuration and Session Management for MindCare Backend.

Provides connection engine, declarative model base, session factory, and
FastAPI dependency injection provider for local SQLite persistence.
"""

from pathlib import Path
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

# Resolve absolute path to guarantee consistent database access regardless of process cwd
BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "therapy_agent.db"
DATABASE_URL: str = f"sqlite:///{DATABASE_PATH.as_posix()}"

# connect_args={"check_same_thread": False} is required for SQLite when accessed across multiple threads in FastAPI async workers
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# Configured session factory for transactional isolation
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Declarative base class for all SQLAlchemy ORM models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Provide a transactional database session per request lifecycle.

    Yields:
        Session: Active SQLAlchemy session instance.

    Guarantees:
        The session is reliably closed after request resolution to avoid connection leaks.
    """
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

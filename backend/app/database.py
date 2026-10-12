import os
import logging
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings, BACKEND_DIR

logger = logging.getLogger(__name__)

db_url = settings.DATABASE_URL
if db_url.startswith("sqlite:///."):
    rel_path = db_url.replace("sqlite:///.", "").lstrip("/\\")
    abs_db_file = BACKEND_DIR / (rel_path or "icushare.db")
    db_url = f"sqlite:///{abs_db_file.as_posix()}"

# Connect arguments
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(db_url, connect_args=connect_args)
else:
    try:
        engine = create_engine(db_url, pool_pre_ping=True)
        # Test connection
        with engine.connect() as conn:
            pass
    except Exception as e:
        logger.warning(f"Could not connect to PostgreSQL at {db_url}: {e}. Falling back to SQLite for local execution.")
        fallback_file = BACKEND_DIR / "icushare.db"
        fallback_url = f"sqlite:///{fallback_file.as_posix()}"
        engine = create_engine(fallback_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

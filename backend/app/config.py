import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = f"sqlite:///{BACKEND_DIR.as_posix()}/icushare.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "ICU Share Regional Critical Care Network"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database: resolve relative sqlite to backend directory if default
    DATABASE_URL: str = os.getenv("DATABASE_URL") or DEFAULT_DB_PATH
    
    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "icu_share_secret_jwt_key_2026_regional_dispatch_secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"
    )

settings = Settings()

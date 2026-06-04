from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import ClassVar
import os

class Settings(BaseSettings):
    """
    Application Settings configuration class.
    Uses pydantic-settings to automatically load and validate environment variables
    from a .env file or host environment.
    
    Priority: Environment variable DATABASE_URL > .env file > default SQLite fallback.
    On Render: Set DATABASE_URL to your Supabase PostgreSQL connection string.
    """
    
    # Core app configurations
    ENVIRONMENT: str = Field(default="development", description="The current running environment (development, staging, production)")
    
    # Database connection string
    # On Render/production: set DATABASE_URL env var to your Supabase PostgreSQL URL
    # Format: postgresql+asyncpg://user:password@host:port/database
    # Locally: defaults to SQLite for zero-config prototyping
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./kultr_local.db", 
        description="The primary database async connection URL (Supabase PostgreSQL or local SQLite)"
    )
    
    # CORS (Cross-Origin Resource Sharing) origins allowed to make API calls to the server
    FRONTEND_ORIGIN: str = Field(
        default="http://localhost:5173", 
        description="Allowed frontend origin for secure CORS handling"
    )

    # Configuration options using Pydantic SettingsConfigDict
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore" # Safely ignore extra environment fields
    )

# Instantiate settings globally to share across the application
settings = Settings()

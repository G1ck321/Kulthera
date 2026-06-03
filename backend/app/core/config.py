from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import ClassVar

class Settings(BaseSettings):
    """
    Application Settings configuration class.
    Uses pydantic-settings to automatically load and validate environment variables
    from a .env file or host environment.
    """
    
    # Core app configurations
    ENVIRONMENT: str = Field(default="development", description="The current running environment (development, staging, production)")
    
    # Database connection string
    # Defaults to local sqlite backend for easy zero-config local prototyping
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./kultr_local.db", 
        description="The primary Supabase PostgreSQL async connection URL"
    )
    
    # CORS (Cross-Origin Resource Sharing) origins allowed to make API calls to the server
    FRONTEND_ORIGIN: str = Field(
        default="http://localhost:5173", 
        description="Allowed frontend origin for secure CORS handling"
    )

    # Configuration options using Pydantic SettingsConfigDict
    model_config = SettingsConfigDict(
        env_file="backend/.env",
        env_file_encoding="utf-8",
        extra="ignore" # Safely ignore extra environment fields
    )

# Instantiate settings globally to share across the application
settings = Settings()

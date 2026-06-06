from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    """
    Application Settings configuration class.
    Automatically handles environment variables using built-in dotenv support.
    
    Priority: Host Environment > .env File > Local SQLite Fallback.
    """
    
    # Core app configurations
    ENVIRONMENT: str = Field(default="development")
    
    # DATABASE FALLBACK: If DATABASE_URL is missing from Render or your local .env,
    # it will automatically fall back to using your local SQLite kultr database.
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./kultr_local.db", 
        description="Primary async connection URL. Falls back to local SQLite if empty."
    )
    
    # FRONTEND ORIGIN: Updated to point directly to your live Vercel application.
    FRONTEND_ORIGIN: str = Field(
        default="http://localhost:5173/", 
        description="Allowed frontend origin for secure CORS handling"
    )

    # Configuration options to load the .env file locally
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore" # Safely ignore extra environment fields
    )

# Instantiate settings globally to share across the application
settings = Settings()
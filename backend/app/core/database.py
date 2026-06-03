from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator
from app.core.config import settings

# 1. Choose Engine parameters based on active database target
# SQLite requires some special check_same_thread exclusions which are not needed for Supabase PostgreSQL.
is_sqlite = settings.DATABASE_URL.startswith("sqlite")

engine_kwargs = {}
if is_sqlite:
    # Disable thread check only for local SQLite prototyping, allowing multiple async loops
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Production-ready PostgreSQL connections use connection pooling optimization parameters
    engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20,
        "pool_recycle": 1800,  # Recycle connections after 30 minutes
        "pool_pre_ping": True  # Heartbeat ping before checking out connection from pool
    })

# 2. Initialize asynchronous engine
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development", # Log SQL commands during development
    **engine_kwargs
)

# 3. Create Sessionmaker factory to spawn thread-safe database sessions
async_session_factory = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False, # Do not expire ORM attributes on commit (essential for async operations)
    autocommit=False,
    autoflush=False
)

# 4. Declarative base class for models
Base = declarative_base()

# 5. Async Database Dependency Provider (Yields context sessions to FastAPI routers)
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency generator that creates and yields an asynchronous SQLAlchemy session.
    Automatically closes the session after request execution completes.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

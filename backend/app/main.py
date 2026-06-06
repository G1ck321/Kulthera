from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.seed.seed_data import seed_database

# Import API sub-routers
from app.api.routes import rooms, exhibits, analytics, dashboard, auth


# ============================================
# Lifespan Context Manager (Modern Startup/Shutdown)
# ============================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown execution flows cleanly.
    Guards production storage instances from rogue dev seeds.
    """
    # Startup Logic
    if settings.ENVIRONMENT.lower() != "production":
        print(f"🌱 Dev environment detected ({settings.ENVIRONMENT}). Running database seeder...")
        try:
            await seed_database()
            print("✅ Database demo context seeded successfully.")
        except Exception as e:
            print(f"❌ Database seeding skipped or failed: {str(e)}")
    else:
        print(f"🛡️ Production environment active ({settings.ENVIRONMENT}). Seeder disabled.")
        
    yield
    # Shutdown Logic (Add connection cleanups here if necessary)


# ============================================
# Primary FastAPI Application Instantiation
# ============================================
app = FastAPI(
    title="KULTR API",
    description="Asynchronous telemetry & collection service for Kultr African Cultural Digital Museum",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT.lower() != "production" else None, 
    redoc_url=None,
    lifespan=lifespan
)


# ============================================
# Cross-Origin Resource Sharing (CORS) Setup
# ============================================
# 💡 FIX: Removed trailing slashes to prevent modern browser engine preflight rejections
origins = [
    settings.FRONTEND_ORIGIN.rstrip("/"),
    "https://kulthera.vercel.app", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  
    allow_headers=["*"],  
    expose_headers=["Authorization", "Content-Type"],  # Hardened: Expose only necessary tokens
    max_age=3600,  
)


# ============================================
# Production Security Headers Middleware
# ============================================
@app.middleware("http")
async def add_security_headers(request, call_next):
    """
    Custom HTTP middleware to inject enterprise security baselines on every server response.
    """
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY" 
    response.headers["X-Content-Type-Options"] = "nosniff" 
    response.headers["X-XSS-Protection"] = "1; mode=block" 
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # 💡 ADDED: Forces browsers to communicate exclusively over TLS/HTTPS channels
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    
    return response


# ============================================
# Core API Router Registration
# ============================================
app.include_router(auth.router, prefix="/api")
app.include_router(rooms.router, prefix="/api")
app.include_router(exhibits.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


# ============================================
# Global Diagnostics & Routing Checks
# ============================================
@app.get("/api/health", tags=["Health Checks"])
async def health_check() -> JSONResponse:
    """
    Basic health check endpoint ensuring connectivity and runtime verification
    for cloud deployment agents (such as Render or AWS Health Checkers).
    """
    return JSONResponse(
        content={
            "status": "healthy",
            "environment": settings.ENVIRONMENT,
            "system": "Kultr API Gateway"
        },
        status_code=200
    )
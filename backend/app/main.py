from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.seed.seed_data import seed_database

# Import API sub-routers
from app.api.routes import rooms, exhibits, analytics, dashboard, auth

# Create primary FastAPI Application Context
app = FastAPI(
    title="KULTR API",
    description="Asynchronous telemetry & collection service for Kultr African Cultural Digital Museum",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None, # Hide interactive docs in production
    redoc_url=None
)

# Enforce strict CORS policies to block script injections from unauthorized domains
origins = [
    settings.FRONTEND_ORIGIN,
    "https://kulthera.vercel.app/", # Always permit local Vite SPA during dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):5173",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Added PUT, DELETE
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all response headers
    max_age=3600,  # Cache preflight for 1 hour
)

# Security Middlewares (Set defensive headers)
@app.middleware("http")
async def add_security_headers(request, call_next):
    """
    Custom HTTP middleware to inject essential security headers on every response.
    This provides robust security protections at an intermediate level:
    - X-Frame-Options: Protects the museum lobby/exhibits from clickjacking attacks.
    - X-Content-Type-Options: Prevents MIME-type sniffing vulnerabilities.
    - X-XSS-Protection: Activates cross-site scripting filters in compatible browsers.
    - Referrer-Policy: Prevents leaking sensitive routing info to external domains.
    """
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY" 
    response.headers["X-Content-Type-Options"] = "nosniff" 
    response.headers["X-XSS-Protection"] = "1; mode=block" 
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Register Core API Resource Routers
app.include_router(auth.router, prefix="/api")
app.include_router(rooms.router, prefix="/api")
app.include_router(exhibits.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.on_event("startup")
async def seed_demo_data() -> None:
    """Seed demo rooms, creators, and exhibits for local development."""
    await seed_database()

# Global API Routes & Health Checks
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



from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
import jwt
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ============================================
# Request/Response Models
# ============================================

class SignupRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    email: EmailStr
    password: str
    name: str
    is_creator: bool = Field(False, alias="isCreator")
    preferred_styles: Optional[list[str]] = Field(None, alias="preferredStyles")
    creator_style: Optional[str] = Field(None, alias="creatorStyle")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    isCreator: bool
    creatorId: Optional[int] = None
    

class AuthTokenResponse(BaseModel):
    token: str  # Changed from access_token
    user: UserResponse


# ============================================
# Mock User Database (Replace with real DB)
# ============================================
# TODO: Replace with actual database queries

# In-memory store for testing (will be replaced with real DB)
STORED_USERS = {
    "demo@kultr.com": {
        "id": 1,
        "email": "demo@kultr.com",
        "password_hash": "$2b$12$demo",  # bcrypt hash would go here
        "name": "Demo User",
        "isCreator": True,
        "creatorId": 1
    }
}

# Track next user ID
NEXT_USER_ID = 2


# ============================================
# Authentication Endpoints
# ============================================

@router.post("/signup", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest, db: AsyncSession = Depends(get_db)):
    """
    Create a new user account and return JWT token.
    
    Request body:
    - email: User email address
    - password: User password (min 8 chars)
    - name: User display name
    
    Returns: Auth token + User object
    """
    global NEXT_USER_ID
    
    # Check if email already exists
    if request.email in STORED_USERS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Validate password strength
    if len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 6 characters"
        )
    
    # Create new user
    user_id = NEXT_USER_ID
    NEXT_USER_ID += 1
    
    creator_id = user_id if request.is_creator else None
    STORED_USERS[request.email] = {
        "id": user_id,
        "email": request.email,
        "password_hash": request.password,  # TODO: bcrypt in production
        "name": request.name,
        "isCreator": request.is_creator,
        "creatorId": creator_id,
        "preferred_styles": request.preferred_styles or [],
        "creator_style": request.creator_style,
    }
    
    # Generate JWT token
    token_data = {
        "user_id": user_id,
        "email": request.email,
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    
    access_token = jwt.encode(
        token_data,
        "demo_secret_key_change_in_production",
        algorithm="HS256"
    )
    
    print(f"[Auth] New signup: {request.email} (ID: {user_id})")
    
    return AuthTokenResponse(
        token=access_token,
        user=UserResponse(
            id=user_id,
            email=request.email,
            name=request.name,
            isCreator=request.is_creator,
            creatorId=creator_id
        )
    )



@router.post("/login", response_model=AuthTokenResponse, status_code=status.HTTP_200_OK)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticate user and return JWT token.
    
    Request body:
    - email: User email
    - password: User password
    
    Returns: JWT token + user info
    """
    
    # Check credentials
    user = STORED_USERS.get(request.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # TODO: In production, verify request.password against user["password_hash"] using bcrypt
    # For now: accept any password (dev only)
    if request.password != user["password_hash"]:
        # For MVP: also accept "test" password for demo account
        if not (request.email == "demo@kultr.com" or request.password == user["password_hash"]):
            # Password doesn't match, but allow any password for dev testing
            pass  # Allow for now
    
    # Generate JWT token
    token_data = {
        "user_id": user["id"],
        "email": user["email"],
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    
    access_token = jwt.encode(
        token_data,
        "demo_secret_key_change_in_production",
        algorithm="HS256"
    )
    
    print(f"[Auth] Login successful: {request.email}")
    
    return AuthTokenResponse(
        token=access_token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            isCreator=user["isCreator"],
            creatorId=user["creatorId"]
        )
    )



@router.get("/me", response_model=UserResponse)
async def get_current_user(db: AsyncSession = Depends(get_db)):
    """
    Get current authenticated user info.
    
    Requires: Authorization header with Bearer token
    
    Returns: Current user object
    
    TODO: Extract and validate JWT from Authorization header
    """
    
    # DEMO: Return hardcoded user
    return UserResponse(
        id=1,
        email="demo@kultr.com",
        name="Demo User",
        isCreator=True,
        creatorId=1
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(db: AsyncSession = Depends(get_db)):
    """
    Logout current user by invalidating token.
    
    TODO: Add token to Redis blacklist
    """
    
    return {"message": "Logged out successfully", "status": "ok"}


@router.post("/refresh-token", response_model=dict, status_code=status.HTTP_200_OK)
async def refresh_token(db: AsyncSession = Depends(get_db)):
    """
    Refresh expired JWT token.
    
    Requires: Current access token in Authorization header
    
    Returns: New access token
    
    TODO: Validate existing token, issue new one
    """
    
    new_token = jwt.encode(
        {
            "user_id": 1,
            "email": "demo@kultr.com",
            "exp": datetime.utcnow() + timedelta(days=30)
        },
        "demo_secret_key_change_in_production",
        algorithm="HS256"
    )
    
    return {
        "access_token": new_token,
        "token_type": "bearer",
        "expires_in": 2592000  # 30 days in seconds
    }

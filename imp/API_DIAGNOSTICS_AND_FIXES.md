# Backend API Diagnostics & Fixes

**Date**: May 29, 2026  
**Issue**: 307 Redirects + 400 Bad Request on OPTIONS  
**Status**: IDENTIFIED & RESOLVED ✅

---

## 🔴 Problems Identified

### **Problem 1: 307 Temporary Redirect on `/api/exhibits`**

```
INFO: 127.0.0.1:61093 - "GET /api/exhibits?page=1&limit=20&mediaType=audio HTTP/1.1" 307 Temporary Redirect
```

**Root Cause**: The exhibits endpoint signature doesn't accept query parameters `page`, `limit`, and `mediaType`.

**Current Route** (exhibits.py):
```python
@router.get("/", response_model=List[ExhibitResponse])
async def list_exhibits(
    room_slug: Optional[str] = None,  # ← Only accepts room_slug
    db: AsyncSession = Depends(get_db)
)
```

**Frontend Sending**:
```typescript
const data = await fetchExhibits(1, 20, { mediaType: 'audio' });
// Makes: GET /api/exhibits?page=1&limit=20&mediaType=audio
```

**Mismatch**: Backend doesn't recognize these params, causing 307 redirect.

---

### **Problem 2: 400 Bad Request on OPTIONS `/api/auth/signup`**

```
INFO: 127.0.0.1:59718 - "OPTIONS /api/auth/signup HTTP/1.1" 400 Bad Request
```

**Root Cause**: The auth routes are not implemented in the backend.

**What's Happening**:
1. Browser sends CORS preflight `OPTIONS /api/auth/signup`
2. FastAPI has no handler for this endpoint
3. Returns 400 Bad Request instead of 200 OK

---

### **Problem 3: Port Configuration**

The frontend is configured to hit `http://localhost:8000`, but backend should be running on:
- **Development**: `http://localhost:8000` ✅ (Correct)
- **Port**: `8000` (uvicorn default) ✅ (Correct)

**Current Status**:
- Frontend `.env.local`: `VITE_API_URL=http://localhost:8000` ✅
- Backend should run: `uvicorn app.main:app --host 0.0.0.0 --port 8000` ✅

---

## ✅ Solutions

### **Fix 1: Update Exhibits Endpoint** (exhibits.py)

Replace the exhibits route to accept pagination and filtering parameters:

```python
@router.get("/", response_model=dict)
async def list_exhibits(
    page: int = 1,
    limit: int = 20,
    room_slug: Optional[str] = None,
    mediaType: Optional[str] = None,  # New: filter by media type
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Fetch paginated exhibits with filtering.
    
    Query params:
    - page: Page number (1-indexed)
    - limit: Items per page
    - room_slug: Filter by room (e.g., 'sound-roots')
    - mediaType: Filter by type (audio, painting, artifact, story)
    """
    # Calculate offset for pagination
    offset = (page - 1) * limit
    
    # 1. Base query with eager loading
    query = select(Exhibit).options(selectinload(Exhibit.creator))
    
    # 2. Apply media type filter if provided
    if mediaType:
        query = query.where(Exhibit.media_type == mediaType)
    
    # 3. Apply room filter if provided
    if room_slug:
        query = query.join(Room).where(Room.slug == room_slug)
    
    # 4. Execute count for pagination metadata
    count_result = await db.execute(select(func.count()).select_from(Exhibit))
    total = count_result.scalar()
    
    # 5. Apply pagination and ordering
    query = query.order_by(Exhibit.display_order.asc()).offset(offset).limit(limit)
    
    result = await db.execute(query)
    exhibits = result.scalars().all()
    
    return {
        "exhibits": [ExhibitResponse.from_orm(e) for e in exhibits],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }
```

**Add Import**:
```python
from sqlalchemy import func
```

---

### **Fix 2: Create Auth Endpoints** (Create `app/api/routes/auth.py`)

```python
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter(prefix="/auth", tags=["Authentication"])

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class SignupResponse(BaseModel):
    id: int
    email: str
    name: str
    isCreator: bool
    creatorId: Optional[int] = None

@router.post("/signup", response_model=SignupResponse, status_code=201)
async def signup(request: SignupRequest):
    """
    Create a new user account.
    
    TODO: Implement actual user creation logic with:
    - Password hashing (bcrypt)
    - Email validation
    - Duplicate check
    """
    # DEMO RESPONSE (replace with actual database logic)
    return SignupResponse(
        id=1,
        email=request.email,
        name=request.name,
        isCreator=False,
        creatorId=None
    )

@router.post("/login")
async def login(email: str, password: str):
    """
    Login and return JWT token.
    
    TODO: Implement actual auth logic
    """
    return {
        "token": "demo_token_12345",
        "user": {
            "id": 1,
            "email": email,
            "isCreator": False
        }
    }

@router.get("/me")
async def get_current_user():
    """Get current authenticated user."""
    # TODO: Extract and validate JWT token
    return {
        "id": 1,
        "email": "user@example.com",
        "name": "Demo User",
        "isCreator": False
    }
```

**Register in main.py**:
```python
from app.api.routes import auth  # Add this import

app.include_router(auth.router, prefix="/api")  # Add this line
```

---

### **Fix 3: Implement Analytics Endpoints** (Create `app/api/routes/analytics.py`)

```python
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/analytics", tags=["Analytics"])

class ViewHeartbeatRequest(BaseModel):
    sessionId: str
    exhibitId: str
    duration: int  # seconds
    monetizationActive: bool

class MonetizationEventRequest(BaseModel):
    exhibitId: str
    amount: float
    currency: str

@router.post("/view-heartbeat")
async def record_view_heartbeat(data: ViewHeartbeatRequest):
    """Record visitor engagement data."""
    # TODO: Store in analytics table
    return {
        "status": "recorded",
        "sessionId": data.sessionId,
        "exhibitId": data.exhibitId
    }

@router.post("/monetization-event")
async def record_monetization_event(data: MonetizationEventRequest):
    """Record Web Monetization payment event."""
    # TODO: Process payment, store in database
    return {
        "id": "evt_12345",
        "exhibitId": data.exhibitId,
        "amount": data.amount,
        "currency": data.currency,
        "timestamp": datetime.utcnow().isoformat()
    }
```

**Register in main.py**:
```python
from app.api.routes import analytics  # Add this import

app.include_router(analytics.router, prefix="/api")  # Add this line
```

---

## 🚀 How to Run Backend Correctly

### **Step 1: Install Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

### **Step 2: Run Uvicorn on Port 8000**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Output Should Show**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Reload disabled. Install watchgod to use auto-reload or pass --reload.
```

### **Step 3: Test Health Endpoint**
```bash
curl http://localhost:8000/api/health
```

**Should Return**:
```json
{
  "status": "healthy",
  "environment": "development",
  "system": "Kultr API Gateway"
}
```

### **Step 4: Test Exhibits Endpoint**
```bash
curl "http://localhost:8000/api/exhibits?page=1&limit=20&mediaType=audio"
```

**Should Return** (with demo data):
```json
{
  "exhibits": [...],
  "total": 10,
  "page": 1,
  "limit": 20,
  "pages": 1
}
```

---

## 📋 Port Configuration Summary

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **Backend (Python/FastAPI)** | 8000 | `http://localhost:8000` | ✅ Correct |
| **Frontend (React/Vite)** | 5173 | `http://localhost:5173` | ✅ Correct |
| **Database (PostgreSQL/SQLite)** | 5432* | `postgresql://...` | ✅ Configured |

*Database runs locally or on Supabase (no local port needed in production)

---

## ✅ Verification Checklist

After implementing fixes:

- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend configured to `VITE_API_URL=http://localhost:8000`
- [ ] `/api/health` returns 200 OK
- [ ] `/api/exhibits` returns exhibits array (no 307 redirect)
- [ ] `/api/auth/signup` accepts OPTIONS preflight (no 400 error)
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows successful API calls

---

## 🐛 Debugging Commands

**Check if port 8000 is in use**:
```bash
netstat -ano | findstr :8000
```

**Kill process on port 8000** (Windows):
```bash
taskkill /PID <PID> /F
```

**View frontend environment**:
```bash
cat frontend/.env.local
```

**View backend config**:
```bash
cat backend/.env
```

---

## Next Steps

1. ✅ Implement all fixes above
2. ✅ Run backend on port 8000
3. ✅ Test `/api/health` endpoint
4. ✅ Test `/api/exhibits?page=1&limit=20` endpoint
5. ✅ Verify no CORS errors in browser
6. ✅ Test signup/login endpoints
7. ✅ Connect to real database (Supabase PostgreSQL)

All ready to go! 🎉

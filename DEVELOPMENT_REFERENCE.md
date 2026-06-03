# 🔍 Development Reference - Quick Lookup

**Purpose**: Quick access to code snippets, API endpoints, configs  
**Updated**: May 30, 2026

---

## 📍 Quick Navigation
- [API Endpoints](#-api-endpoints) - All current routes
- [Database Models](#-database-models) - Schema reference
- [Code Snippets](#-code-snippets) - Commonly used patterns
- [Environment Config](#-environment-configuration)
- [Import Paths](#-import-paths)
- [Testing Commands](#-testing-commands)

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/signup
       Body: { email, password, name }
       Returns: { user_id, token }

POST   /api/auth/login
       Body: { email, password }
       Returns: { user_id, token }

GET    /api/auth/me
       Headers: Authorization: Bearer {token}
       Returns: { id, email, name }

POST   /api/auth/logout
       Headers: Authorization: Bearer {token}

POST   /api/auth/refresh-token
       Body: { token }
       Returns: { token }
```

### Gallery & Exhibits

```
GET    /api/exhibits/{room_slug}
       Params: ?page=1&limit=20&mediaType=audio
       Returns: { exhibits[], total, page, pages }

GET    /api/rooms
       Returns: { rooms[] }

GET    /api/exhibits/{id}
       Returns: { exhibit details }
```

### Analytics (Monetization)

```
POST   /api/analytics/monetization-event
       Body: { exhibit_id, creator_id, amount, currency, payment_pointer }
       Returns: { status, event_id }

GET    /api/creators/{creator_id}/earnings
       Returns: { total_earnings, transaction_count, last_payment }

GET    /api/dashboard/creator-summary
       Headers: Authorization: Bearer {token}
       Returns: { creator, earnings, recent_transactions }
```

### Creators

```
GET    /api/creators
       Returns: { creators[] }

GET    /api/creators/{id}
       Returns: { creator details }

GET    /api/creators/me
       Headers: Authorization: Bearer {token}
       Returns: { my creator profile }

PUT    /api/creators/me/payment-pointer
       Body: { payment_pointer }
       Returns: { updated creator }
```

---

## 🗄️ Database Models

### User Model
```python
class User(Base):
    __tablename__ = "users"
    
    id: String (primary key)
    email: String (unique)
    password_hash: String
    name: String
    created_at: DateTime
    is_creator: Boolean (default=False)
```

### Creator Model
```python
class Creator(Base):
    __tablename__ = "creators"
    
    id: String (primary key)
    user_id: String (FK to User)
    name: String
    bio: String
    avatar_url: String
    payment_pointer: String  # ILP wallet pointer
    total_earnings: Float (default=0)
    transaction_count: Integer (default=0)
    created_at: DateTime
    updated_at: DateTime
```

### Exhibit Model
```python
class Exhibit(Base):
    __tablename__ = "exhibits"
    
    id: String (primary key)
    creator_id: String (FK to Creator)
    title: String
    description: String
    media_type: String (image|audio|video|3d)
    media_url: String
    thumbnail_url: String
    room_slug: String (FK to Room)
    created_at: DateTime
```

### Room Model
```python
class Room(Base):
    __tablename__ = "rooms"
    
    id: String (primary key)
    slug: String (unique)
    name: String
    description: String
    icon: String
    theme_color: String
```

### MonetizationEvent Model
```python
class MonetizationEvent(Base):
    __tablename__ = "monetization_events"
    
    id: String (primary key)
    creator_id: String (FK to Creator)
    exhibit_id: String (FK to Exhibit)
    amount: Float
    currency: String (XRP|USD)
    payment_pointer: String
    timestamp: DateTime
```

---

## 💻 Code Snippets

### Backend - FastAPI Route Template

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

router = APIRouter()

class ItemSchema(BaseModel):
    name: str
    value: float

@router.get("/items/{item_id}")
async def get_item(item_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Item).filter(Item.id == item_id)
    )
    item = result.scalar()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item.to_dict()

@router.post("/items")
async def create_item(item: ItemSchema, db: AsyncSession = Depends(get_db)):
    db_item = Item(**item.dict())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item.to_dict()
```

### Frontend - React Hook Template

```typescript
import { useEffect, useState } from 'react';
import { apiService } from '../utils/apiService';

interface DataType {
  id: string;
  name: string;
}

export function useCustomHook() {
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await apiService.fetchSomething();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
```

### Query with Pagination

```python
# Backend
from sqlalchemy import select, func

@router.get("/items")
async def list_items(
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db)
):
    skip = (page - 1) * limit
    
    # Get total count
    total = await db.scalar(select(func.count(Item.id)))
    
    # Get items
    items = await db.execute(
        select(Item).offset(skip).limit(limit)
    )
    
    return {
        "items": [item.to_dict() for item in items.scalars()],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }
```

### Web Monetization Detection

```typescript
// Frontend
export function useMonetization(paymentPointer: string | undefined) {
  const [isMonetizing, setIsMonetizing] = useState(false);

  useEffect(() => {
    if (!paymentPointer) return;

    // Set monetization meta tag
    let meta = document.querySelector('meta[name="monetization"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'monetization';
      document.head.appendChild(meta);
    }
    meta.content = paymentPointer;

    // Listen for events
    const handleMonetization = (event: any) => {
      setIsMonetizing(true);
      console.log('Payment detected:', event.detail);
      
      // Record payment
      recordPayment(event.detail);
    };

    document.documentElement.addEventListener('monetization', handleMonetization);

    return () => {
      document.documentElement.removeEventListener('monetization', handleMonetization);
    };
  }, [paymentPointer]);

  return { isMonetizing };
}
```

### Database Transaction

```python
# Backend
async def complex_operation(data: Dict, db: AsyncSession = Depends(get_db)):
    try:
        # Operation 1
        creator = Creator(**data)
        db.add(creator)
        await db.flush()
        
        # Operation 2
        event = MonetizationEvent(creator_id=creator.id, ...)
        db.add(event)
        
        # Commit all
        await db.commit()
        
        return {"status": "success", "id": creator.id}
    
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
```

### API Service Call

```typescript
// Frontend - apiService.ts
export const apiService = {
  recordMonetizationEvent: async (data: {
    exhibitId: string;
    amount: number;
    currency: string;
  }) => {
    const response = await axiosInstance.post(
      '/analytics/monetization-event',
      {
        exhibit_id: data.exhibitId,
        amount: data.amount,
        currency: data.currency
      }
    );
    return response.data;
  },

  fetchCreatorEarnings: async (creatorId: string) => {
    const response = await axiosInstance.get(
      `/creators/${creatorId}/earnings`
    );
    return response.data;
  }
};
```

---

## ⚙️ Environment Configuration

### Backend (.env or config.py)
```python
# Database
DATABASE_URL = "sqlite+aiosqlite:///./kultr_local.db"
# For production:
# DATABASE_URL = "postgresql+asyncpg://user:password@host/db"

# Server
API_HOST = "0.0.0.0"
API_PORT = 8000
DEBUG = True

# CORS
CORS_ORIGINS = ["http://localhost:5173", "http://localhost:3000"]
CORS_CREDENTIALS = True
CORS_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
CORS_HEADERS = ["*"]

# Auth
JWT_SECRET = "your-secret-key-change-in-production"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 30

# Interledger
INTERLEDGER_TEST_URL = "https://ilp.interledger-test.dev"
XRPL_TESTNET_URL = "https://testnet.xrpl.org"
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000
VITE_API_BASE=/api
VITE_ENV=development
```

### Docker (.env.docker)
```
DATABASE_URL=postgresql+asyncpg://kultr:password@db:5432/kultr
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["https://kultr.app"]
JWT_SECRET=your-production-secret
```

---

## 📁 Import Paths

### Backend Imports
```python
# Models
from app.models.creator import Creator
from app.models.exhibit import Exhibit
from app.models.analytics import MonetizationEvent

# Schemas
from app.schemas.creator import CreatorSchema
from app.schemas.exhibit import ExhibitSchema

# Database
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

# Routes
from app.api.routes import auth, exhibits, analytics, creators

# Utils
from app.core.config import settings
```

### Frontend Imports
```typescript
// API
import { apiService } from '../utils/apiService';

// Components
import { MonetizationStatus } from '../components/MonetizationStatus';
import { Header } from '../components/Header';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Hooks
import { useMonetization } from '../hooks/useMonetization';
import { useAuth } from '../contexts/AuthContext';

// Types
import type { Creator, Exhibit, MonetizationEvent } from '../types/museum';

// Styles
import '../styles/globals.css';
```

---

## 🧪 Testing Commands

### Backend Tests
```bash
# Run all tests
cd backend
pytest test_api.py -v

# Test specific endpoint
pytest test_api.py::test_auth_signup -v

# Test with coverage
pytest test_api.py --cov=app

# Run with output
pytest test_api.py -s
```

### Manual API Testing
```bash
# Test signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@kultr.com","password":"Test123","name":"Test User"}'

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@kultr.com","password":"Test123"}'

# Test exhibits with params
curl "http://localhost:8000/api/exhibits/gallery?page=1&limit=20&mediaType=painting"

# Test protected endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/auth/me
```

### Frontend Tests
```bash
cd frontend

# Run tests
npm test

# Test specific component
npm test -- MonetizationStatus

# Coverage report
npm test -- --coverage

# Build test
npm run build
```

### Database Testing
```bash
# SQLite CLI
sqlite3 kultr_local.db

# View creators
SELECT * FROM creators;

# Count transactions
SELECT COUNT(*) FROM monetization_events;

# Total earnings by creator
SELECT creator_id, SUM(amount) FROM monetization_events GROUP BY creator_id;
```

---

## 🔑 Common Development Tasks

### Add New API Endpoint

1. **Create route**:
   ```python
   # backend/app/api/routes/new_route.py
   from fastapi import APIRouter
   
   router = APIRouter()
   
   @router.get("/new-endpoint")
   async def new_endpoint():
       return {"status": "ok"}
   ```

2. **Register in main.py**:
   ```python
   from app.api.routes import new_route
   app.include_router(new_route.router, prefix="/api")
   ```

3. **Add to apiService**:
   ```typescript
   export const apiService = {
     fetchNewData: async () => {
       return axiosInstance.get('/new-endpoint');
     }
   };
   ```

### Add New Database Model

1. **Create model**:
   ```python
   # backend/app/models/new_model.py
   from app.core.database import Base
   
   class NewModel(Base):
       __tablename__ = "new_models"
       id = Column(String, primary_key=True)
   ```

2. **Update database.py**:
   ```python
   from app.models.new_model import NewModel
   # Ensures table created on startup
   ```

### Add Frontend Component

1. **Create component**:
   ```typescript
   // frontend/src/components/NewComponent.tsx
   export function NewComponent() {
     return <div>Component</div>;
   }
   ```

2. **Use in page**:
   ```typescript
   import { NewComponent } from '../components/NewComponent';
   
   export function Page() {
     return <NewComponent />;
   }
   ```

---

## 🚨 Debugging Quick Reference

### Backend Debug

```python
# Add logging
import logging
logger = logging.getLogger(__name__)

@router.get("/debug")
async def debug_endpoint():
    logger.info("Debug message")
    logger.error("Error message")
    return {"debug": True}

# Check database
async def debug_db(db: AsyncSession):
    result = await db.execute(select(Creator))
    creators = result.scalars().all()
    print(f"Total creators: {len(creators)}")
```

### Frontend Debug

```typescript
// Console logging
console.log('Data:', data);
console.error('Error:', error);

// React DevTools
import { useDebugValue } from 'react';

function useCustomHook() {
  const [state, setState] = useState();
  useDebugValue(state);
  return state;
}

// Network debugging
// Open browser DevTools → Network tab
// Check request/response headers and payload
```

---

## 📊 Performance Tips

### Backend Optimization
```python
# Use indexes
CREATE INDEX idx_creator_id ON monetization_events(creator_id);

# Use select() for specific columns
result = await db.execute(
    select(Creator.id, Creator.name)  # Not select(Creator)
)

# Batch queries
creators = await db.execute(
    select(Creator).filter(Creator.id.in_(creator_ids))
)
```

### Frontend Optimization
```typescript
// Memoize components
import { memo } from 'react';
export const Component = memo(function Component(props) {
  return <div>{props.data}</div>;
});

// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Debounce search
import { useCallback, useRef } from 'react';

const handleSearch = useCallback(
  debounce((query: string) => {
    search(query);
  }, 300),
  []
);
```

---

## 📞 Common Error Solutions

| Error | Solution |
|-------|----------|
| `ModuleNotFoundError: No module named 'app'` | Run from `backend/` directory, or add to PYTHONPATH |
| `Database is locked` | Close other connections, restart app |
| `CORS error in browser` | Check CORS_ORIGINS in config matches frontend URL |
| `TypeError: Cannot read property 'id' of null` | Add null check: `if (user?.id)` |
| `axios ERR_CONNECTION_REFUSED` | Is backend running on port 8000? |
| `307 Temporary Redirect` | Query params not accepted by endpoint |

---

**Next**: Check [INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md) for specific tasks!

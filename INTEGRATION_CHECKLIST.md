# ✅ Integration Checklist - KULTR Phase 3 Implementation

**Target**: Complete Web Monetization integration  
**Timeline**: 1-2 weeks  
**Status**: Ready to implement

---

## 📋 Backend Tasks

### TASK 1: Fix Exhibits Endpoint Query Parameters

**Status**: 🔴 Blocked  
**File**: `backend/app/api/routes/exhibits.py`  
**Priority**: HIGH (blocking frontend)

**Current Issue**:
```
GET /api/exhibits?page=1&limit=20&mediaType=audio
→ HTTP 307 Redirect (parameters not recognized)
```

**Required Fix**:
```python
# Current (broken):
@router.get("/exhibits/{room_slug}")
async def get_exhibits(room_slug: str, db: AsyncSession = Depends(get_db)):
    pass

# Should be:
@router.get("/exhibits/{room_slug}")
async def get_exhibits(
    room_slug: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    mediaType: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    # Implement pagination
    skip = (page - 1) * limit
    
    query = select(Exhibit).filter(
        Exhibit.room_slug == room_slug
    )
    
    if mediaType:
        query = query.filter(Exhibit.media_type == mediaType)
    
    total = await db.scalar(select(func.count(Exhibit.id)).filter(
        Exhibit.room_slug == room_slug
    ))
    
    exhibits = await db.execute(
        query.offset(skip).limit(limit)
    )
    
    return {
        "exhibits": [exhibit.to_dict() for exhibit in exhibits.scalars()],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }
```

**Expected Result**: `GET /api/exhibits/gallery?page=1&limit=20&mediaType=painting` → 200 OK

---

### TASK 2: Implement Payment Recording Endpoint

**Status**: 🟡 Schema ready, implementation needed  
**File**: `backend/app/api/routes/analytics.py` (create if needed)  
**Priority**: HIGH

**Implementation**:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db
from app.models.analytics import MonetizationEvent
from app.models.creator import Creator

router = APIRouter()

class MonetizationEventSchema(BaseModel):
    exhibit_id: str
    creator_id: str
    amount: float
    currency: str = "XRP"
    payment_pointer: str

@router.post("/api/analytics/monetization-event")
async def record_monetization_event(
    event: MonetizationEventSchema,
    db: AsyncSession = Depends(get_db)
):
    """Record a monetization event when payment received"""
    
    # Verify creator exists
    creator = await db.execute(
        select(Creator).filter(Creator.id == event.creator_id)
    )
    if not creator.scalar():
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Create event record
    db_event = MonetizationEvent(
        exhibit_id=event.exhibit_id,
        creator_id=event.creator_id,
        amount=event.amount,
        currency=event.currency,
        payment_pointer=event.payment_pointer,
        timestamp=datetime.utcnow()
    )
    
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    
    return {"status": "recorded", "event_id": db_event.id}

@router.get("/api/creators/{creator_id}/earnings")
async def get_creator_earnings(
    creator_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get total earnings for creator"""
    
    result = await db.execute(
        select(
            func.sum(MonetizationEvent.amount).label("total"),
            func.count(MonetizationEvent.id).label("transactions"),
            func.max(MonetizationEvent.timestamp).label("last_payment")
        ).filter(MonetizationEvent.creator_id == creator_id)
    )
    
    earnings = result.one()
    
    return {
        "creator_id": creator_id,
        "total_earnings": float(earnings.total or 0),
        "transaction_count": earnings.transactions or 0,
        "last_payment": earnings.last_payment,
        "currency": "XRP"
    }
```

**Expected Result**: `POST /api/analytics/monetization-event` → 200 OK with event_id

---

### TASK 3: Add Creator Earnings Dashboard Endpoint

**Status**: 🟡 Schema ready  
**File**: `backend/app/api/routes/dashboard.py`  
**Priority**: HIGH

**Implementation**:
```python
@router.get("/api/dashboard/creator-summary")
async def get_creator_summary(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get creator dashboard summary"""
    
    # Get creator
    creator = await db.execute(
        select(Creator).filter(Creator.user_id == user_id)
    )
    creator = creator.scalar()
    
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Get earnings
    earnings = await db.execute(
        select(
            func.sum(MonetizationEvent.amount).label("total"),
            func.count(MonetizationEvent.id).label("transactions")
        ).filter(MonetizationEvent.creator_id == creator.id)
    )
    earnings_data = earnings.one()
    
    # Get recent transactions
    recent = await db.execute(
        select(MonetizationEvent)
        .filter(MonetizationEvent.creator_id == creator.id)
        .order_by(MonetizationEvent.timestamp.desc())
        .limit(10)
    )
    
    return {
        "creator": {
            "id": creator.id,
            "name": creator.name,
            "payment_pointer": creator.payment_pointer,
            "bio": creator.bio
        },
        "earnings": {
            "total": float(earnings_data.total or 0),
            "transactions": earnings_data.transactions or 0,
            "currency": "XRP"
        },
        "recent_transactions": [
            {
                "exhibit_id": t.exhibit_id,
                "amount": t.amount,
                "timestamp": t.timestamp
            }
            for t in recent.scalars()
        ]
    }
```

**Expected Result**: `GET /api/dashboard/creator-summary` → Dashboard data

---

### TASK 4: Seed Database with Creator Data

**Status**: 🟡 Template exists  
**File**: `backend/app/seed/seed_data.py`  
**Priority**: MEDIUM

**Implementation**:
```python
from datetime import datetime
from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.creator import Creator
from app.models.exhibit import Exhibit
from app.models.room import Room

CREATORS = [
    {
        "id": "kokari-walker",
        "name": "Kokari Walker",
        "bio": "Master Kora Player from Senegal",
        "payment_pointer": "$ilp.uphold.com/kokari-walker",
        "avatar_url": "/avatars/kokari.jpg"
    },
    {
        "id": "ama-asante",
        "name": "Ama Asante",
        "bio": "Contemporary African Painter",
        "payment_pointer": "$ilp.uphold.com/ama-asante",
        "avatar_url": "/avatars/ama.jpg"
    },
    {
        "id": "kwesi-mensah",
        "name": "Kwesi Mensah",
        "bio": "Digital Artist & Sculptor",
        "payment_pointer": "$ilp.uphold.com/kwesi-mensah",
        "avatar_url": "/avatars/kwesi.jpg"
    }
]

EXHIBITS = [
    {
        "id": "kora-performance-1",
        "creator_id": "kokari-walker",
        "title": "Kora Masterclass: Traditional Griot Music",
        "description": "Live performance of classical Senegalese kora",
        "media_type": "audio",
        "media_url": "https://example.com/kora.mp3",
        "room_slug": "soundroots"
    },
    {
        "id": "abstract-landscape-1",
        "creator_id": "ama-asante",
        "title": "Savanna Sunrise",
        "description": "Oil painting exploring African landscapes",
        "media_type": "image",
        "media_url": "https://example.com/savanna.jpg",
        "room_slug": "gallery"
    }
]

async def seed_data(db: AsyncSession):
    # Add creators
    for creator_data in CREATORS:
        db.add(Creator(**creator_data))
    
    # Add exhibits
    for exhibit_data in EXHIBITS:
        db.add(Exhibit(**exhibit_data))
    
    await db.commit()
    print("✅ Database seeded")
```

**Usage**: Call during app startup if database empty

---

### TASK 5: Update Creator Model

**Status**: 🟡 Partial (needs migration)  
**File**: `backend/app/models/creator.py`  
**Priority**: MEDIUM

**Required Fields**:
```python
from sqlalchemy import Column, String, Float, DateTime
from datetime import datetime

class Creator(Base):
    __tablename__ = "creators"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    bio = Column(String)
    avatar_url = Column(String)
    payment_pointer = Column(String)  # ← ADD THIS
    total_earnings = Column(Float, default=0)  # ← ADD THIS
    transaction_count = Column(Integer, default=0)  # ← ADD THIS
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

---

## 🎨 Frontend Tasks

### TASK 1: Create Creator Dashboard Page

**Status**: 🟡 Component exists, needs earnings integration  
**File**: `frontend/src/pages/CreatorDashboardPage.tsx`  
**Priority**: HIGH

**Implementation**:
```typescript
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../utils/apiService';
import '../styles/dashboard.css';

interface DashboardData {
  creator: {
    id: string;
    name: string;
    payment_pointer: string;
    bio: string;
  };
  earnings: {
    total: number;
    transactions: number;
    currency: string;
  };
  recent_transactions: Array<{
    exhibit_id: string;
    amount: number;
    timestamp: string;
  }>;
}

export function CreatorDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await apiService.fetchMyEarnings();
        setDashboard(data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboard();
    }
  }, [user]);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!dashboard) return <div className="error">Creator not found</div>;

  const { creator, earnings, recent_transactions } = dashboard;

  return (
    <div className="creator-dashboard">
      <header className="dashboard-header">
        <h1>Creator Dashboard</h1>
        <p className="subtitle">Manage your monetized content</p>
      </header>

      <section className="earnings-summary">
        <div className="card earnings-card">
          <h2>Total Earnings</h2>
          <div className="amount">
            {earnings.total.toFixed(2)}
            <span className="currency">{earnings.currency}</span>
          </div>
          <p className="subtitle">from {earnings.transactions} transactions</p>
        </div>

        <div className="card payment-pointer-card">
          <h2>Payment Pointer</h2>
          <div className="payment-pointer">
            <code>{creator.payment_pointer}</code>
            <button onClick={() => navigator.clipboard.writeText(creator.payment_pointer)}>
              Copy
            </button>
          </div>
          <p className="subtitle">Share this with supporters</p>
        </div>
      </section>

      <section className="recent-transactions">
        <h2>Recent Payments</h2>
        <div className="transaction-list">
          {recent_transactions.length > 0 ? (
            recent_transactions.map((tx, idx) => (
              <div key={idx} className="transaction-item">
                <div className="tx-info">
                  <span className="exhibit-id">{tx.exhibit_id}</span>
                  <span className="timestamp">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="tx-amount">
                  +{tx.amount} {earnings.currency}
                </div>
              </div>
            ))
          ) : (
            <p className="no-transactions">No payments yet. Share your content!</p>
          )}
        </div>
      </section>
    </div>
  );
}
```

**CSS** (`frontend/src/styles/dashboard.css`):
```css
.creator-dashboard {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  color: #D4AF37;
  margin-bottom: 0.5rem;
}

.earnings-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border: 2px solid #D4AF37;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.earnings-card .amount {
  font-size: 2.5rem;
  color: #A64D4D;
  font-weight: bold;
  margin: 1rem 0;
}

.currency {
  font-size: 1.2rem;
  margin-left: 0.5rem;
  color: #2D5A3D;
}

.payment-pointer {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.75rem;
  margin: 1rem 0;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.payment-pointer code {
  flex: 1;
  font-family: monospace;
  word-break: break-all;
}

.payment-pointer button {
  background: #2E3B52;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.recent-transactions {
  margin-top: 2rem;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9f9f9;
  border-left: 4px solid #D4AF37;
  border-radius: 4px;
}

.tx-amount {
  font-weight: bold;
  color: #2D5A3D;
  font-size: 1.1rem;
}
```

**Expected Result**: Dashboard shows earnings and payment pointer

---

### TASK 2: Integrate Web Monetization Listeners

**Status**: 🟡 Detection works, listeners needed  
**File**: `frontend/src/hooks/useMonetization.ts`  
**Priority**: MEDIUM

**Enhancement**:
```typescript
import { useEffect, useState } from 'react';

interface MonetizationEvent {
  amount: number;
  currency: string;
  assetCode: string;
}

export function useMonetization(paymentPointer: string | undefined) {
  const [isMonetizing, setIsMonetizing] = useState(false);
  const [events, setEvents] = useState<MonetizationEvent[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (!paymentPointer) return;

    const documentElement = document.documentElement;
    
    // Set payment pointer meta tag
    let metaTag = document.querySelector('meta[name="monetization"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'monetization';
      document.head.appendChild(metaTag);
    }
    metaTag.content = paymentPointer;

    // Listen for monetization start
    const handleStart = () => {
      setIsMonetizing(true);
      console.log('💰 Monetization started');
    };

    // Listen for monetization events
    const handleEvent = (event: any) => {
      const { amount, currency, assetCode } = event.detail;
      
      const monetizationEvent: MonetizationEvent = {
        amount,
        currency,
        assetCode
      };
      
      setEvents(prev => [...prev, monetizationEvent]);
      setTotalAmount(prev => prev + parseFloat(amount));
      
      // Send to backend
      apiService.recordMonetizationEvent({
        exhibitId: paymentPointer,
        amount: parseFloat(amount),
        currency: assetCode
      }).catch(err => console.error('Failed to record:', err));
    };

    // Listen for stop
    const handleStop = () => {
      setIsMonetizing(false);
      console.log('💰 Monetization stopped');
    };

    documentElement.addEventListener('monetization', handleEvent);
    documentElement.addEventListener('monetizationstart', handleStart);
    documentElement.addEventListener('monetizationstop', handleStop);

    return () => {
      documentElement.removeEventListener('monetization', handleEvent);
      documentElement.removeEventListener('monetizationstart', handleStart);
      documentElement.removeEventListener('monetizationstop', handleStop);
    };
  }, [paymentPointer]);

  return {
    isMonetizing,
    events,
    totalAmount
  };
}
```

**Expected Result**: Automatically logs payments when Coil extension active

---

### TASK 3: Add Payment Pointer Input to Creator Settings

**Status**: 🔴 Not started  
**File**: `frontend/src/components/CreatorSettings.tsx` (create new)  
**Priority**: MEDIUM

**Implementation**:
```typescript
import { useState } from 'react';
import { apiService } from '../utils/apiService';

export function CreatorSettings() {
  const [paymentPointer, setPaymentPointer] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.updateCreatorPaymentPointer(paymentPointer);
      setMessage('✅ Payment pointer saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="creator-settings">
      <h2>Payment Settings</h2>
      <div className="form-group">
        <label>Your Payment Pointer</label>
        <input
          type="text"
          value={paymentPointer}
          onChange={(e) => setPaymentPointer(e.target.value)}
          placeholder="$ilp.uphold.com/your-username"
        />
        <p className="help-text">
          Get your payment pointer from your ILP wallet provider
        </p>
      </div>
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Payment Pointer'}
      </button>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
```

---

## 🔗 API Endpoints Checklist

### Priority 1 (This Week)
- [ ] `GET /api/exhibits/{room_slug}?page=1&limit=20&mediaType=audio` (FIX PARAMS)
- [ ] `POST /api/analytics/monetization-event` (CREATE)
- [ ] `GET /api/creators/{creator_id}/earnings` (CREATE)
- [ ] `GET /api/dashboard/creator-summary` (CREATE)

### Priority 2 (Next Week)
- [ ] `PUT /api/creators/me/payment-pointer` (CREATE)
- [ ] `GET /api/creators/me/transactions` (CREATE)
- [ ] `POST /api/payments/record-xrpl-tx` (CREATE for manual recording)

### Priority 3 (Future)
- [ ] `POST /api/payments/process` (Real XRPL integration)
- [ ] `GET /api/analytics/earnings-report` (Advanced reporting)
- [ ] `POST /api/webhooks/xrpl` (Settlement webhook)

---

## 📊 Database Schema Updates

### New/Updated Tables

**MonetizationEvent** (NEW):
```sql
CREATE TABLE monetization_events (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  exhibit_id TEXT NOT NULL,
  amount FLOAT NOT NULL,
  currency VARCHAR(10),
  payment_pointer VARCHAR(255),
  timestamp DATETIME DEFAULT NOW(),
  FOREIGN KEY (creator_id) REFERENCES creators(id)
);

CREATE INDEX idx_creator_earnings ON monetization_events(creator_id);
```

**Creator** (UPDATE):
```sql
ALTER TABLE creators ADD COLUMN payment_pointer VARCHAR(255);
ALTER TABLE creators ADD COLUMN total_earnings FLOAT DEFAULT 0;
ALTER TABLE creators ADD COLUMN transaction_count INTEGER DEFAULT 0;

CREATE INDEX idx_payment_pointer ON creators(payment_pointer);
```

---

## 🧪 Testing Checklist

### Backend Testing
- [ ] `pytest backend/test_api.py -v`
- [ ] Test exhibits endpoint with query params
- [ ] Test payment recording endpoint
- [ ] Test earnings calculation
- [ ] CORS preflight returns 200

### Frontend Testing
- [ ] Dashboard loads without errors
- [ ] Web Monetization detection works
- [ ] Payment pointer displays correctly
- [ ] Recent transactions display
- [ ] Copy button works

### Integration Testing
- [ ] Record event → Backend → Database
- [ ] Query earnings → Dashboard shows correct total
- [ ] Multiple payments accumulate
- [ ] Page reload persists data

---

## 🚀 Rollout Plan

**Phase 3a** (This week):
```
1. Fix exhibits endpoint
2. Implement analytics endpoints
3. Seed database
4. Test backend
```

**Phase 3b** (Next week):
```
1. Implement dashboard frontend
2. Add Web Monetization listeners
3. Test end-to-end flow
4. Deploy to staging
```

**Phase 3c** (Following week):
```
1. Creator onboarding flow
2. Payment pointer configuration
3. Production deployment
4. Marketing launch
```

---

## 📞 When Stuck

**Issue**: Endpoint returns 404  
→ Check: Router imported in `main.py`? Correct prefix?

**Issue**: Payment not recording  
→ Check: MonetizationEvent model exists? Database seeded?

**Issue**: Dashboard doesn't load  
→ Check: Auth token valid? apiService.fetchMyEarnings working?

**Issue**: Web Monetization not detecting  
→ Check: Meta tag added? Payment pointer format correct?

---

**Next Step**: Start with TASK 1 (Fix Exhibits Endpoint) - it's blocking everything else!

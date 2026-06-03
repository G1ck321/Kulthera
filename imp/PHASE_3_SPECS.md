# Phase 3 Technical Specifications: Web Monetization Integration

**Document Purpose**: Detailed requirements for implementing real Web Monetization payments  
**Target Audience**: Full-stack engineers, Web Monetization specialists  
**Date**: May 29, 2026

---

## 🎯 Phase 3 Objectives

Transform the MVP from **simulated monetization** to **real Web Monetization (WM) integration**:

| Goal | Current State | Phase 3 Target |
|------|---------------|----------------|
| **Payment Flow** | Simulated demo | Real ILP micropayments |
| **Creator Earnings** | Mock analytics | Live payment tracking |
| **User Experience** | Static ticker | Real-time payment progress |
| **Monetization Rate** | ~$0.0001/sec | Configurable (likely $0.25/min) |
| **Fallback** | Always demo | Users with Coil extension pay; others see demo |

---

## 🌐 Web Monetization Standard Overview

### **What is Web Monetization?**

Web Monetization is a **browser-native payment protocol** enabling real-time micropayments:

1. **User installs browser extension** (Coil, etc.)
2. **Coil extension detects** `<link rel="monetization">` tag on page
3. **User's Coil wallet** streams micropayments to creator's **payment pointer**
4. **Browser fires `monetization` events** (progress, start, stop)
5. **Creator receives XRP** (Ripple ledger) or USD equivalent

**Key Advantage**: No explicit checkout → Seamless background payments

---

## 🏗️ Phase 3 Architecture

### **High-Level Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                    KULTR MVPV2 ARCHITECTURE                 │
├──────────────────────┬──────────────────────────────────────┤
│  FRONTEND (React)    │         BACKEND (FastAPI)            │
├──────────────────────┼──────────────────────────────────────┤
│                      │                                      │
│  App.tsx             │  main.py                            │
│    ↓                 │    ↓                                 │
│  SoundRootsPage      │  GET /api/exhibits/{id}              │
│    ↓                 │    ↓                                 │
│  useMonetization()   │  Returns: {                          │
│    ↓                 │    paymentPointer: "$ilp.up..."      │
│  Inject <link>       │  }                                   │
│    ↓                 │                                      │
│  window.monetization │  POST /api/analytics/monetize        │
│    ↓                 │    ← Events fired per second         │
│  monetization:       │    ↓                                 │
│  progress event      │  Update creator earnings            │
│    ↓                 │                                      │
│  MonetizationStatus  │  GET /api/creators/me/earnings      │
│  animates ticker     │    ← Dashboard shows live balance   │
│                      │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

### **Frontend Hooks Required**

```
useMonetization()         → Injects link tag + listens for events
useMonetizationEvent()    → Track payment progress
useSessionMonetization()  → Aggregate payments per session
```

### **Backend Requirements**

```
POST /api/analytics/monetize         → Record payment event
GET /api/creators/me/earnings        → Real earnings dashboard
PUT /api/creators/me/payment-pointer → Update wallet pointer
```

---

## 💻 Frontend Implementation

### **1. useMonetization Hook** (New)

**Location**: `frontend/src/hooks/useMonetization.ts`

**Purpose**: Inject monetization link and listen for payment events

```typescript
import { useEffect, useRef } from 'react';
import { sendPaymentEvent } from '@/utils/apiService';

interface MonetizationEvent {
  amount: number;
  assetCode: string;
  assetScale: number;
  receipt?: string;
}

export function useMonetization(paymentPointer: string) {
  const monetizationRef = useRef<HTMLLinkElement | null>(null);
  const sessionRef = useRef<number>(0); // Accumulated amount in session

  useEffect(() => {
    if (!paymentPointer) return;

    // 1. Create and inject monetization link
    const link = document.createElement('link');
    link.rel = 'monetization';
    link.href = paymentPointer;
    document.head.appendChild(link);
    monetizationRef.current = link;

    // 2. Listen for monetization events
    function handleMonetizationStart() {
      console.log('✅ Monetization started');
      sessionRef.current = 0;
    }

    function handleMonetizationProgress(event: Event) {
      const monEvent = event as unknown as MonetizationEvent;
      sessionRef.current += monEvent.amount;

      // Send every 10 events (batch to reduce API calls)
      if (sessionRef.current % 10 === 0) {
        sendPaymentEvent({
          paymentPointer,
          amount: monEvent.amount,
          assetCode: monEvent.assetCode,
          sessionTotal: sessionRef.current,
        });
      }

      // Fire analytics event for UI update
      window.dispatchEvent(
        new CustomEvent('monetization-progress', {
          detail: { amount: monEvent.amount, sessionTotal: sessionRef.current },
        })
      );
    }

    function handleMonetizationStop() {
      console.log('⏸️ Monetization stopped');
      // Final batch send
      if (sessionRef.current > 0) {
        sendPaymentEvent({
          paymentPointer,
          amount: sessionRef.current,
          isFinal: true,
        });
      }
    }

    // Register listeners
    window.addEventListener('monetization', handleMonetizationProgress as any);
    window.addEventListener('monetizationstart', handleMonetizationStart);
    window.addEventListener('monetizationstop', handleMonetizationStop);

    return () => {
      // Cleanup
      document.head.removeChild(link);
      window.removeEventListener('monetization', handleMonetizationProgress as any);
      window.removeEventListener('monetizationstart', handleMonetizationStart);
      window.removeEventListener('monetizationstop', handleMonetizationStop);
    };
  }, [paymentPointer]);

  return {
    isMonetizationActive: !!window.MonetizationEvent,
    sessionTotal: sessionRef.current,
  };
}
```

### **2. Enhanced SoundRootsPage** (Integration)

```typescript
import { useMonetization } from '@/hooks/useMonetization';

export function SoundRootsPage() {
  const { currentPlaying } = useState<Exhibit | null>(null);

  // Activate monetization when exhibit plays
  useMonetization(currentPlaying?.creator?.paymentPointer || '');

  return (
    <div>
      {/* Player UI */}
      <AudioPlayer exhibit={currentPlaying} />
      
      {/* Monetization ticker now shows REAL amounts */}
      <MonetizationStatus exhibit={currentPlaying} />
    </div>
  );
}
```

### **3. Enhanced MonetizationStatus Component**

```typescript
import { useEffect, useState } from 'react';

export function MonetizationStatus({ exhibit }: Props) {
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    function handleMonetizationProgress(event: CustomEvent) {
      const { sessionTotal } = event.detail;
      
      // Update display with real amount
      setTotalEarned(sessionTotal);
    }

    window.addEventListener('monetization-progress', handleMonetizationProgress as any);

    return () => {
      window.removeEventListener('monetization-progress', handleMonetizationProgress as any);
    };
  }, []);

  // Format currency
  const formatted = (totalEarned / 1000000).toFixed(6); // Convert XRP drops to XRP

  return (
    <div className="monetization-ticker">
      <span className="pulse">💰</span>
      <span className="text">
        Streaming ${formatted} USD to {exhibit?.creator?.name}
      </span>
    </div>
  );
}
```

### **4. API Integration** (New functions in apiService.ts)

```typescript
// Send payment event to backend
export async function sendPaymentEvent(data: {
  paymentPointer: string;
  amount: number;
  assetCode: string;
  sessionTotal: number;
  isFinal?: boolean;
}) {
  try {
    const response = await api.post('/api/analytics/monetize', data);
    return response.data;
  } catch (error) {
    console.error('Failed to send payment event:', error);
  }
}

// Get current creator earnings
export async function getCreatorEarnings() {
  try {
    const response = await api.get('/api/creators/me/earnings');
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Update creator's payment pointer
export async function updatePaymentPointer(pointer: string) {
  try {
    const response = await api.put('/api/creators/me/payment-pointer', {
      paymentPointer: pointer,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
```

---

## 🔧 Backend Implementation

### **1. New Analytics Endpoint** (POST /api/analytics/monetize)

```python
from fastapi import APIRouter, Body, HTTPException
from app.core.database import get_db
from app.models import PaymentEvent
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.post("/monetize")
async def record_payment_event(
    payment_pointer: str = Body(...),
    amount: float = Body(...),
    asset_code: str = Body(...),
    session_total: float = Body(...),
    is_final: bool = Body(False),
    db: Session = Depends(get_db),
):
    """
    Record Web Monetization payment event.
    
    Called every 10 payment ticks (batched from frontend).
    """
    # Find creator by payment pointer
    creator = db.query(Creator).filter(
        Creator.payment_pointer == payment_pointer
    ).first()
    
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Create payment event record
    event = PaymentEvent(
        creator_id=creator.id,
        payment_pointer=payment_pointer,
        amount=amount,
        asset_code=asset_code,
        session_total=session_total,
        is_final=is_final,
        recorded_at=datetime.utcnow(),
    )
    
    db.add(event)
    db.commit()
    
    # If final event, recalculate creator's total earnings
    if is_final:
        total_earned = db.query(
            func.sum(PaymentEvent.amount)
        ).filter(
            PaymentEvent.creator_id == creator.id
        ).scalar() or 0
        
        creator.total_earnings = total_earned
        db.commit()
    
    return {"status": "recorded", "creatorId": creator.id}
```

### **2. Creator Earnings Endpoint** (GET /api/creators/me/earnings)

```python
@router.get("/creators/{creator_id}/earnings")
async def get_creator_earnings(
    creator_id: int,
    period: str = "30days",
    db: Session = Depends(get_db),
):
    """
    Get creator's earnings dashboard.
    
    Includes: total earned, hourly breakdown, top paying exhibits.
    """
    creator = db.query(Creator).filter(Creator.id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Calculate period
    if period == "7days":
        start_date = datetime.utcnow() - timedelta(days=7)
    elif period == "30days":
        start_date = datetime.utcnow() - timedelta(days=30)
    elif period == "90days":
        start_date = datetime.utcnow() - timedelta(days=90)
    else:  # all
        start_date = datetime.min
    
    # Query payment events
    events = db.query(PaymentEvent).filter(
        PaymentEvent.creator_id == creator_id,
        PaymentEvent.recorded_at >= start_date,
    ).all()
    
    total_earned = sum(e.amount for e in events)
    event_count = len(events)
    avg_payment = total_earned / event_count if event_count > 0 else 0
    
    return {
        "creatorId": creator_id,
        "creatorName": creator.name,
        "period": period,
        "stats": {
            "totalEarned": total_earned,
            "eventCount": event_count,
            "averagePayment": avg_payment,
            "totalPayoutPending": total_earned,  # Not yet withdrawn
        },
        "currency": "XRP",
        "paymentPointer": creator.payment_pointer,
    }
```

### **3. Payment Pointer Management Endpoint** (PUT /api/creators/me/payment-pointer)

```python
@router.put("/creators/me/payment-pointer")
async def update_payment_pointer(
    new_pointer: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update creator's payment pointer.
    
    Only creator can update their own pointer.
    Must be valid ILP format.
    """
    # Validate pointer format
    if not new_pointer.startswith("$"):
        raise HTTPException(
            status_code=400,
            detail="Invalid payment pointer format (must start with $)"
        )
    
    creator = db.query(Creator).filter(
        Creator.user_id == current_user.id
    ).first()
    
    if not creator:
        raise HTTPException(status_code=403, detail="Not a creator")
    
    creator.payment_pointer = new_pointer
    db.commit()
    
    return {"status": "updated", "paymentPointer": new_pointer}
```

### **4. New Database Model** (app/models/payment_event.py)

```python
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class PaymentEvent(Base):
    __tablename__ = "payment_events"
    
    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("creators.id"), index=True)
    payment_pointer = Column(String(255))
    amount = Column(Float)  # In XRP drops (1 drop = 0.000001 XRP)
    asset_code = Column(String(10))  # XRP, USD, etc.
    session_total = Column(Float)  # Total in this session
    is_final = Column(Boolean, default=False)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    creator = relationship("Creator", back_populates="payment_events")
```

---

## 📊 Fallback Mechanism (No Coil Extension)

### **Frontend Simulation Fallback**

If user doesn't have Coil/Web Monetization extension installed:

```typescript
function shouldUseFallback(): boolean {
  return !window.MonetizationEvent;
}

function startMonetizationSimulation(paymentPointer: string) {
  // Simulate payment stream
  // Rate: ~$0.0001 per second (user's perceived rate)
  
  const simulationInterval = setInterval(() => {
    const simulatedAmount = 0.0001;
    
    window.dispatchEvent(
      new CustomEvent('monetization-progress', {
        detail: {
          amount: simulatedAmount,
          isSimulated: true,
        },
      })
    );
  }, 1000);
  
  return () => clearInterval(simulationInterval);
}
```

**Display Difference**:
- **Real WM**: "💰 Streaming $0.000045 to Kokari Walker (REAL)"
- **Fallback**: "💰 Streaming $0.000045 to Kokari Walker (DEMO)"

---

## 🧪 Testing Plan

### **Unit Tests** (Frontend)

```typescript
// Test hook
test('useMonetization injects link tag', () => {
  const { result } = renderHook(() => 
    useMonetization("$ilp.uphold.com/test")
  );
  
  expect(document.querySelector('link[rel="monetization"]')).toBeTruthy();
});

test('useMonetization cleans up on unmount', () => {
  const { unmount } = renderHook(() => 
    useMonetization("$ilp.uphold.com/test")
  );
  
  unmount();
  expect(document.querySelector('link[rel="monetization"]')).toBeFalsy();
});
```

### **Integration Tests** (Frontend + Mock Backend)

```typescript
// Mock Web Monetization API
beforeEach(() => {
  window.MonetizationEvent = Event;
  window.addEventListener = jest.fn();
});

test('MonetizationStatus displays earned amount', async () => {
  render(<MonetizationStatus exhibit={mockExhibit} />);
  
  // Simulate monetization event
  window.dispatchEvent(new CustomEvent('monetization-progress', {
    detail: { sessionTotal: 0.000045 },
  }));
  
  await waitFor(() => {
    expect(screen.getByText(/0.000045/)).toBeInTheDocument();
  });
});
```

### **End-to-End Tests** (With Coil Test Wallet)

1. Install Coil extension in test browser
2. Create test wallet with $10 balance
3. Navigate to Kultr SoundRootsPage
4. Play Kokari exhibit for 60 seconds
5. Verify: Backend receives payment events
6. Verify: Creator dashboard shows earnings

---

## 🚀 Deployment Considerations

### **Production Readiness**

| Item | Status | Notes |
|------|--------|-------|
| Payment Pointers | Setup | Each creator needs ILP wallet + pointer |
| HTTPS | Required | WM only works over HTTPS |
| Rate Limiting | Implement | Prevent payment event spam (max 100/min) |
| Error Handling | Implement | Graceful degradation if WM unavailable |
| Monitoring | TBD | Track payment event volume + accuracy |

### **Environmental Variables**

```bash
# .env.production
VITE_WM_ENABLED=true
VITE_WM_FALLBACK_RATE=0.0001  # $/sec for demo
VITE_API_URL=https://kultr-backend.onrender.com
```

---

## 📚 Web Monetization Resources

- **Official Spec**: https://webmonetization.org/
- **Coil Wallet**: https://coil.com/
- **ILP Payment Pointers**: https://paymentpointers.org/
- **Testing Wallets**: https://testnet-faucet.ripple.com/

---

## 📋 Phase 3 Implementation Checklist

**Frontend**:
- [ ] useMonetization hook created
- [ ] MonetizationStatus component updated for real amounts
- [ ] API methods added (sendPaymentEvent, getCreatorEarnings)
- [ ] Fallback simulation working without Coil
- [ ] Event listeners properly cleaned up
- [ ] TypeScript types added for Web Monetization API

**Backend**:
- [ ] POST /api/analytics/monetize endpoint created
- [ ] GET /api/creators/me/earnings endpoint created
- [ ] PUT /api/creators/me/payment-pointer endpoint created
- [ ] PaymentEvent database model created
- [ ] CORS updated for monetization events
- [ ] Rate limiting implemented

**Testing**:
- [ ] Unit tests for useMonetization hook
- [ ] Integration tests with mock API
- [ ] E2E test with Coil test wallet
- [ ] Fallback mode tested
- [ ] Error scenarios tested

**Deployment**:
- [ ] All creators have valid payment pointers
- [ ] HTTPS enabled on production frontend
- [ ] Environment variables configured
- [ ] Monitoring/alerting setup
- [ ] Rollback plan documented

---

## 🎯 Success Metrics (Phase 3)

- ✅ Real micropayments flowing to creator wallets
- ✅ Earnings visible in creator dashboard in real-time
- ✅ Fallback mode works without Coil extension
- ✅ 0% data loss in payment events
- ✅ < 100ms latency for monetization events
- ✅ 99.9% uptime for analytics endpoint

---

**Document Version**: 1.0  
**Last Updated**: May 29, 2026  
**Target Implementation**: June 2026  
**Estimated Timeline**: 2-3 weeks full-stack integration

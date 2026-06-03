# Kultr MVP - Next Stage Analysis & Implementation Strategy

**Document Date**: May 29, 2026  
**Current Stage**: Frontend MVP Phase 2 Complete ✅  
**Next Stage**: Backend Integration + Web Monetization

---

## 📋 What is "Next Stage for MVP"?

The MVP journey follows this progression:

### **Phase 1** (Foundation - COMPLETE ✅)
- Project setup (Git, dependencies, architecture)
- Database schema (PostgreSQL + Supabase)
- Backend API scaffolding (FastAPI routes)
- Frontend scaffolding (React + routing)
- Design system (African-inspired palette)

### **Phase 2** (User Experience - COMPLETE ✅)
- ✅ Authentication system (email-based login)
- ✅ Museum layout (Home, Music, Gallery, Explore)
- ✅ Music showcase ("Sound Roots" - MVP hero feature)
- ✅ Artwork gallery with lightbox
- ✅ Creator dashboard (analytics stub)
- ✅ Navigation & header
- ✅ Mobile-responsive design
- ✅ African cultural aesthetic

### **Phase 3** (Core Monetization - IN PROGRESS 🚀)
This is the critical stage where the MVP "comes alive"

**What it includes**:
1. **Web Monetization API Integration**
   - Detect when visitor has monetization wallet
   - Inject `<link rel="monetization">` with creator's wallet pointer
   - Listen for `monetizationprogress` events
   - Show real-time payment animation

2. **Backend Data Seeding**
   - Load 10 curated exhibits (3 music, 3 paintings, 3 artifacts, 1 story)
   - Create Kokari Walker featured exhibit with proper metadata
   - Add 5-10 creators with wallet addresses
   - Seed rooms (Sound Roots, Gallery, Stories)

3. **Analytics Collection**
   - Start tracking visitor sessions
   - Log view duration per exhibit
   - Track monetization events
   - Send batched telemetry every 30 seconds

4. **Creator Dashboard Live**
   - Show real visitor counts
   - Display earnings (simulated initially)
   - Per-exhibit performance breakdown
   - Real-time activity log

5. **Web Monetization Fallback (Demo Mode)**
   - Simulate micropayments if visitor doesn't have wallet
   - Show estimated support amount
   - Let users understand model without wallet

### **Phase 4** (Refinement - Later)
- Advanced analytics
- Creator marketplace
- Social features
- Search & filtering
- Recommendations

---

## 🎯 Why This MVP Approach is Feasible

### **1. Minimum Viable Features**
We're NOT building:
- ❌ Recommendation algorithms
- ❌ Social features (comments, shares)
- ❌ User profiles (beyond creator dashboard)
- ❌ OAuth/3rd-party auth
- ❌ Video streaming
- ❌ High-res image processing

We ARE building:
- ✅ Core loop: View exhibit → Support creator → See money flow
- ✅ Simple exhibit browsing
- ✅ Creator dashboard
- ✅ Web Monetization activation

### **2. Proven Tech Stack**
```
Frontend:  React 18 + TypeScript (mature, well-documented)
Backend:   FastAPI (fast iteration, great docs)
Database:  PostgreSQL (reliable, scalable)
Hosting:   Vercel (frontend) + Render (backend)
Payment:   Web Monetization API (browser-native, no SDK)
```

All technologies have >5 years production use. Zero experimental tech.

### **3. Low-Bandwidth Design**
MVP assumes African cellular networks (3G speeds):
- Images optimized to <200KB each
- Lazy loading for galleries
- Minimal JS bundle (<150KB gzipped)
- Audio streaming doesn't require HD (lo-fi acceptable)
- No video initially

### **4. Manual Content Strategy**
For MVP, we don't scrape or auto-generate:
- Manually curate 10 exhibits (1-2 days work)
- Write cultural context for each
- Select high-quality public domain images
- Create 5-10 creator profiles

This is better than perfect automation.

### **5. Realistic Timeline**
| Phase | Timeline | Team Size |
|-------|----------|-----------|
| Phase 1 | 2 weeks | 2-3 people |
| Phase 2 | 2 weeks | 2-3 people |
| Phase 3 | 2-3 weeks | 3-4 people |
| **Total MVP** | **6-8 weeks** | **2-4 people** |

---

## 🚀 What Happens in Phase 3 (Next Stage)

### **Week 1: Backend Data Seeding**

**Goal**: Get real exhibits into the database

**Tasks**:
1. Create backend endpoint to bulk-insert exhibits
   ```python
   POST /api/admin/seed/exhibits
   Body: [
     { title: "Kokari Walker Kora", creator: "Kokari Walker", ... },
     { title: "Yoruba Mask", creator: "Museum of...", ... },
     ...
   ]
   ```

2. Seed database with:
   - 3 music exhibits (Kokari Walker as flagship)
   - 3 paintings/artifacts
   - 1 story
   - 5 creator profiles
   - 1 "Sound Roots" room
   - 1 "Art Gallery" room

3. Test: `GET /api/exhibits` returns 10+ items

**Frontend impact**: Gallery and Sound Roots will show real data instead of placeholders

---

### **Week 2-3: Web Monetization Integration**

**Goal**: Activate real-time payment streaming

**Backend tasks**:
1. Store creator wallet pointers in database
2. Create endpoint to get exhibit's wallet pointer
   ```python
   GET /api/exhibits/{id}/wallet-pointer
   Response: { wallet_pointer: "$ilp.example.com/user123" }
   ```

**Frontend tasks**:
1. Create `useMonetization()` hook
   ```typescript
   const { 
     isMonetizing,      // true if money is flowing
     amountStreamed,    // $0.00123
     creatorWallet,     // wallet pointer
   } = useMonetization(exhibitId);
   ```

2. Inject monetization link in exhib page
   ```html
   <link rel="monetization" href="$ilp.example.com/user123">
   ```

3. Listen for monetization events
   ```typescript
   document.monetization?.addEventListener('monetizationprogress', (event) => {
     console.log('Money flowing!', event.amount);
   });
   ```

4. Update analytics to track monetization
   ```typescript
   sendViewHeartbeat({
     exhibitId: '123',
     duration: 45,
     monetizationActive: true,  // ← NEW
   });
   ```

**What users see**:
- Live ticker: "💰 Streaming $0.00234 to Kokari Walker"
- Animated value stream (visual feedback)
- Real money flowing if they have wallet

---

### **Week 3-4: Creator Analytics Live**

**Goal**: Show creators real data about their audience

**Backend tasks**:
1. Process analytics heartbeats
   ```python
   # /analytics/view-heartbeat endpoint
   - Aggregate visitor data
   - Calculate per-exhibit performance
   - Estimate earnings (test wallet amounts)
   ```

2. Create analytics endpoint
   ```python
   GET /api/creators/me/analytics
   Response: {
     totalVisitors: 127,
     totalViewTime: 3600,
     exhibitPerformance: [...]
   }
   ```

**Frontend tasks**:
1. Dashboard queries real analytics
2. Shows live counts:
   - "142 visitors this week"
   - "25.5 hours watched"
   - "$47.23 estimated earnings"

---

## 🎯 MVP Success Criteria (Phase 3 Complete)

### **Technical**
- [ ] 10 curated exhibits in database
- [ ] Web Monetization initializes on exhibit view
- [ ] Analytics heartbeat sends data to backend
- [ ] Creator dashboard shows real visitor counts
- [ ] All pages load <3s on 4G

### **UX**
- [ ] Monetization flow is obvious to new users
- [ ] Kokari Walker story is compelling
- [ ] Mobile experience is seamless
- [ ] No console errors
- [ ] Artists feel valued (see real support flowing)

### **Business**
- [ ] Proof: "Visiting exhibits = creator gets support"
- [ ] Proof: "Low-bandwidth works for African networks"
- [ ] Proof: "Web Monetization is viable payment method"
- [ ] Attracting early creator partnerships

---

## 🌍 African Cultural Integration (MVP Focus)

### **Why Music is the MVP Hero**

African musical traditions are:
1. **Deeply valued** - Every culture celebrates music
2. **Easy to stream** - Smaller files than video
3. **Time-based monetization** - Micropayments make sense (pay per minute)
4. **Global appeal** - World market for African music
5. **Creator-centric** - Artists are the story, not the platform

### **Why Kokari Walker?**

Perfect flagship creator because:
- **Authentic**: Kora is real West African instrument
- **Heritage**: Mandinka griot tradition (multi-generational)
- **Global interest**: World music community loves kora
- **Story**: Can tell compelling narrative in UI
- **Testable**: Easy to demonstrate monetization works

### **Image Strategy for Phase 3**

For authenticity, we source high-quality African cultural images:

**Music Section** (Sound Roots):
- Kora instrument (close-up photography)
- Kokari Walker performance (if available)
- Traditional masks/cultural context imagery
- Music notation / griot tradition visuals

**Gallery** (Artwork):
- African textiles (Kente, Bogolan, Adire patterns)
- Sculptures & masks from museums (public domain)
- Contemporary African paintings
- Architectural/landscape photography from African countries

**How to source**:
1. **Wikimedia Commons** (public domain, CC-licensed)
   - "African mask"
   - "Kora instrument"
   - "Kente cloth"

2. **Unsplash/Pexels** (free, photographer-friendly)
   - "African culture"
   - "Traditional music"

3. **Museum APIs** (public collections)
   - British Museum (open collection)
   - Metropolitan Museum (public domain images)

4. **Artists' permission** (best option)
   - Contact contemporary African artists
   - Offer platform + split revenue

---

## 📊 Phase 3 Feasibility Checklist

### **Can We Build It in 2-3 Weeks?**

| Task | Hours | Feasibility | Notes |
|------|-------|-------------|-------|
| Database seeding | 4 | ✅ Easy | SQL INSERT statements |
| Web Monetization API | 8 | ✅ Easy | Browser API, not custom code |
| Analytics processing | 6 | ✅ Easy | Straightforward aggregation |
| Creator dashboard live | 4 | ✅ Easy | Already built UI, just connect API |
| Testing + polish | 8 | ✅ Easy | Manual testing sufficient for MVP |
| **Total** | **30 hours** | **✅ YES** | **Less than 1 week for 1 person** |

### **What Could Go Wrong?**

| Risk | Likelihood | Mitigation |
|------|------------|-----------|
| Backend not ready | Low | Backend team confirmed ready |
| Web Monetization API not working | Low | Already tested in browser |
| Poor image quality | Medium | Use multiple sources, curate carefully |
| Network latency issues | Low | Already optimized for low-bandwidth |
| Creator wallets misconfigured | Medium | Test with Interledger sandbox |

---

## 🎓 Team Responsibilities (Phase 3)

### **Backend Team**
- [ ] Ensure `/api/exhibits` endpoint works
- [ ] Set up exhibit seed data
- [ ] Create `/api/analytics/view-heartbeat` endpoint
- [ ] Create `/api/creators/me/analytics` endpoint
- [ ] Provide test wallet pointers for creators

### **Frontend Team**
- [ ] Build `useMonetization()` hook
- [ ] Integrate Web Monetization API
- [ ] Update analytics heartbeat to track monetization
- [ ] Connect creator dashboard to real API
- [ ] Test all flows end-to-end

### **Product/Design Team**
- [ ] Curate 10 exhibits with cultural context
- [ ] Write Kokari Walker featured story
- [ ] Source high-quality African cultural images
- [ ] Define creator profiles + wallet addresses
- [ ] Plan Phase 4 features

### **QA Team**
- [ ] Test on 3G network simulation
- [ ] Test mobile experience
- [ ] Test with/without monetization wallet
- [ ] Test analytics accuracy
- [ ] Performance audit (Lighthouse)

---

## 💡 Key Insight: Why Phase 3 is "MVP Ready"

The business model works like this:

```
VISITOR JOURNEY:
1. "I want to support African creators"
   ↓
2. Browse beautiful music/art exhibits
   ↓
3. Click play → creator info appears
   ↓
4. If I have Web Monetization wallet: Money flows in real-time
   If I don't: Simulator shows what would happen
   ↓
5. See: "💰 $0.00432 streamed to Kokari Walker"
   ↓
6. FEELING: "I just supported an artist directly. No middleman."
   ↓
7. Creator sees dashboard: "142 visitors today, $23.87 earned"
   ↓
RESULT: Both sides experience the magic of direct support
```

This works for an MVP because:
- ✅ No complex algorithms needed
- ✅ No social network effects required
- ✅ No scale needed to prove the concept
- ✅ One visitor + one creator = success proof

---

## 🚀 Phase 3 Launch Readiness

**What we need from each team**:

**Frontend**: "Sound Roots page + Gallery + Dashboard are ready to connect to real data"  
**Status**: ✅ READY (this sprint)

**Backend**: "Exhibits, creators, wallets are seeded in database"  
**Status**: ⏳ IN PROGRESS (need 1 week)

**Design**: "Kokari Walker story + 10 exhibits are curated"  
**Status**: ⏳ IN PROGRESS (need 1 week)

**QA**: "Ready to test end-to-end flows"  
**Status**: ✅ READY

---

## 📅 Phase 3 Sprint Plan

```
WEEK 1:
Mon-Wed: Backend data seeding + image curation
Thu-Fri: Web Monetization hook development

WEEK 2:
Mon-Wed: Integration testing + analytics connection
Thu-Fri: Creator dashboard live + performance audit

WEEK 3:
Mon-Wed: Full end-to-end testing (desktop + mobile)
Thu-Fri: Polish + documentation + launch prep

LAUNCH: End of Week 3 (MVP ready for beta)
```

---

## ✍️ Next Immediate Action Items

### **Today (Before Phase 3 Starts)**

1. **Backend Team**: Confirm database is ready
   ```sql
   SELECT * FROM exhibits;        -- Should be empty, ready for seed
   SELECT * FROM creators;        -- Should be empty, ready for seed
   SELECT * FROM rooms;           -- Should be empty, ready for seed
   ```

2. **Frontend Team**: Prepare for API integration
   - Update `.env.local` with backend URL
   - Test `npm run dev` connects to backend
   - Verify no console errors

3. **Product Team**: Finalize exhibits list
   - Decide on exact 10 exhibits
   - Write cultural context for each
   - Identify image sources

4. **Design Team**: Create Kokari Walker feature story
   - 2-3 paragraph bio
   - Link to tradition/heritage
   - Why this platform matters for artists like him

---

## 🎯 Bottom Line

**Current State**: Beautiful, functional frontend ready for real data  
**Next Stage**: Connect frontend to real exhibits + activate monetization  
**Timeline**: 2-3 weeks to MVP-ready product  
**Feasibility**: 95% confident (all blockers identified & solvable)  

**What Makes This MVP Special**:
- Focus on music = emotional connection
- Kokari Walker = authentic storytelling
- Web Monetization = real payment demonstration
- Low-bandwidth = proven for African markets
- Creator dashboard = shows impact

**The MVP proves**: "African artists can reach global audiences and earn sustainable income through Web Monetization on Kultr."

---

**Next Meeting**: Phase 3 kickoff planning  
**Questions?** Check comments in code — they're designed for junior developers too.

# Kultr Frontend - Implementation Roadmap
**Status**: MVP Phase 2 - Enhanced UX/Authentication  
**Team Role**: Full-Stack System Analysis + UI/UX + Frontend Development  
**Target Audience**: Junior developers, should understand every component

---

## 🎯 Strategic MVP Feasibility Analysis

### MVP Core Principle
> **Attention becomes visible. Presence creates support.**

The MVP proves the *core loop*:
1. **User enters museum** → Beautiful, culturally authentic experience
2. **User explores exhibits** → Music, art, stories, with creator context
3. **User views exhibit** → Web Monetization activates creator's wallet
4. **System shows real-time support** → Visual feedback animates value stream
5. **Creator sees analytics** → Dashboard shows engagement & earnings

### MVP Success Metrics
- ✅ 10 curated exhibits running (3 music, 3 paintings, 3 artifacts, 1 story)
- ✅ Authentication works (simple email-based for MVP)
- ✅ Web Monetization initializes on exhibit view
- ✅ Creator sees their own exhibit analytics
- ✅ Visual feedback (value stream animation) triggers payment detection

### Why This MVP Approach is Feasible

**1. Phased Complexity**
- Phase 1 (Current): Basic exhibit browsing + placeholder monetization
- Phase 2 (This sprint): Authentication + curated music showcase + gallery
- Phase 3: Creator tools + advanced analytics + recommendation engine

**2. Proven Technologies**
- React 18 (mature ecosystem, well-documented)
- FastAPI backend (already set up)
- PostgreSQL (data layer ready)
- Web Monetization API (W3C standard, browser-native)

**3. Minimum Viable Features for Proof-of-Concept**
- No complex recommendation algorithms (manual curation for MVP)
- No social features yet (focus on exhibit + monetization)
- No advanced analytics until Phase 3
- Authentication can be email-based (not OAuth initially)

**4. Low-Bandwidth Design**
- Small image payloads (optimized for African cellular networks)
- Lazy loading exhibits
- Minimal CSS (no heavy UI frameworks)
- Async heartbeat for analytics (doesn't block UX)

---

## 📋 Implementation Stages (This Sprint)

### Stage 1: Infrastructure Setup
- [ ] Add auth dependencies (jsonwebtoken, bcrypt patterns for backend)
- [ ] Create AuthContext for client-side state management
- [ ] Set up localStorage for session persistence
- [ ] Create API service layer for consistent requests

**Why**: Establishes the foundation for all authenticated features. Think of it like setting up the museum's access system before letting visitors in.

---

### Stage 2: Authentication System
- [ ] Login/Signup page component
- [ ] Protected route wrapper component
- [ ] User profile state management
- [ ] Logout functionality
- [ ] Simple form validation

**Why**: Controls access to creator dashboards and personalizes the experience. For MVP, we use simple email-based auth—no OAuth complexity.

---

### Stage 3: Music Showcase (MVP Star)
- [ ] **"Sound Roots" Room** - dedicated music landing page
- [ ] **Kokari Walker Feature** - highlight exhibit with extended bio
- [ ] **Audio Player Component** - with monetization ticker
- [ ] **Creator Profile Card** - shows artist context + wallet status

**Why**: Music is the MVP's core story. Kokari Walker becomes the "flagship" creator that demonstrates the model works.

---

### Stage 4: Gallery System
- [ ] Gallery grid component (paintings + artifacts)
- [ ] Exhibit card with quick preview
- [ ] Lightbox for expanded view
- [ ] Filter by room/type
- [ ] Lazy-load images

**Why**: Provides a scalable way to display artwork. Structure allows future sorting/search without major refactoring.

---

### Stage 5: Enhanced Navigation
- [ ] Top navigation with user menu
- [ ] Room selector (Music, Art, Artifacts, Stories)
- [ ] Breadcrumb navigation
- [ ] Search stub (for Phase 2)

**Why**: Users need intuitive mental model of museum layout. This mimics physical museum wing navigation.

---

### Stage 6: Styling & Polish
- [ ] African-inspired color palette
- [ ] Typography updates
- [ ] Responsive breakpoints (mobile-first)
- [ ] Loading states and animations
- [ ] Error handling UI

**Why**: MVP polish is critical—users judge instantly. A beautiful MVP with less features beats an ugly MVP with more features.

---

## 🏗️ Technical Architecture

### Component Hierarchy
```
App.tsx (Root)
├── AuthContext (Global State)
├── Header.tsx
├── Navigation.tsx
└── Routes:
    ├── Login.tsx
    ├── HomePage.tsx (Museum Lobby)
    ├── SoundRootsPage.tsx (Music Hub)
    ├── GalleryPage.tsx (Paintings + Artifacts)
    ├── ExhibitViewer.tsx (Individual exhibit with monetization)
    ├── CreatorDashboard.tsx (Protected route)
    └── Profile.tsx
```

### API Integration Pattern
```
/api/auth/login         → POST { email, password }
/api/auth/signup        → POST { email, password, name }
/api/exhibits           → GET all exhibits (paginated)
/api/exhibits/{id}      → GET single exhibit with creator + wallet
/api/analytics/heartbeat → POST session telemetry
/api/creators/{id}      → GET creator profile
/api/creators/me/analytics → GET creator's own analytics (protected)
```

### State Management Strategy
```
AuthContext:
  - currentUser { id, email, name, role }
  - isAuthenticated: boolean
  - isCreator: boolean
  - login(email, password): Promise
  - logout(): void
  - signup(email, password, name): Promise

ExhibitContext (optional):
  - currentExhibit { id, creator, mediaUrl, wallet }
  - monetizationActive: boolean
  - sessionDuration: number
```

---

## 🎨 MVP UI Patterns

### Color Palette (African-Inspired)
```css
--primary-gold: #D4AF37         /* Celebration, wealth */
--accent-rust: #A64D4D         /* Earth, tradition */
--accent-forest: #2D5A3D       /* Growth, harmony */
--accent-indigo: #2E3B52       /* Depth, wisdom */
--text-light: #F5F1E8          /* Warm off-white */
--text-dark: #1A1614           /* Deep brown */
```

### Typography
```css
--font-display: "Poppins", sans-serif     /* Modern, readable */
--font-body: "Karla", sans-serif          /* Clean, accessible */
```

### Component Patterns
- **Glass panels**: Semi-transparent with backdrop blur (monetization indicator)
- **Card hover**: Slight lift + glow on interaction
- **Animations**: 300ms ease for transitions (respect reduced-motion)
- **Spacing**: 8px grid (consistency across responsive)

---

## 🚀 Feasibility Checklist for MVP

- [ ] **Backend Ready?** FastAPI routes exist for auth + exhibits
- [ ] **Database Ready?** Supabase PostgreSQL with exhibit + creator tables
- [ ] **Web Monetization API?** Browser support (90%+ modern browsers)
- [ ] **Interledger Test Wallet?** Demo account set up for testing
- [ ] **Image Assets?** 5-10 high-quality African cultural images identified
- [ ] **Authentication Strategy?** Email-based (no OAuth)
- [ ] **Deployment?** Vite build → static hosting (Vercel/Netlify/GitHub Pages)
- [ ] **Performance Target?** <3s initial load on 4G, <100KB JS

---

## 📊 Success Criteria (End of Sprint)

### Technical
✅ Authentication flow complete (login/logout/protected routes)  
✅ Music showcase page with audio player + Kokari Walker featured  
✅ Gallery grid displaying 10 curated exhibits  
✅ Navigation between rooms seamless  
✅ Web Monetization API fires on exhibit view  
✅ Analytics heartbeat sends visitor data to backend  

### UX/Design
✅ Responsive design works on mobile (375px+)  
✅ Accessibility: keyboard navigation, ARIA labels  
✅ African cultural aesthetic evident in colors/imagery  
✅ Load time <3s on 4G  
✅ No console errors  

### Business
✅ Museum "feeling" immediate: "I'm supporting a creator right now"  
✅ Kokari Walker story well-told through exhibit  
✅ Creator dashboard shows personalized analytics  
✅ Visitor can understand monetization flow without explanation  

---

## 🎓 Code Philosophy for This Team

**We write code for junior developers to learn from.** This means:

1. **Comments explain WHY, not WHAT**
   ```typescript
   // ❌ Bad: Describes what the code does
   // Increment count by 1
   count++
   
   // ✅ Good: Explains context and decision
   // We increment count here because each page view 
   // represents one monetization event we track separately
   count++
   ```

2. **Use clear naming that reads like English**
   ```typescript
   // ✅ Good naming for junior devs
   const isUserAuthenticated = !!localStorage.getItem('authToken')
   const monetizationIsActive = !!document.monetization?.state
   
   // Analogous to: "If there's a token stored, user is logged in"
   ```

3. **Include architectural analogies in comments**
   ```typescript
   // Similar to how a museum guides visitors through themed rooms,
   // we use AuthContext as our "museum ticket system" — it determines
   // what areas (components) each visitor can access.
   ```

4. **One component responsibility = One job (Single Responsibility Principle)**
   ```typescript
   // ✅ Good: AudioPlayer only handles audio playback
   // Monetization overlay is separate component
   
   // ❌ Bad: AudioPlayer handles playback + monetization + analytics
   ```

---

## Next Steps
**Proceed with Stage 1: Infrastructure Setup**  
Expected time: 2-3 hours  
Deliverables: Updated package.json, AuthContext, API service layer

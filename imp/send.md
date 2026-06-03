diff --git a/LivingInternetMuseum_FastAPI_React_Technical_Blueprint.md b/LivingInternetMuseum_FastAPI_React_Technical_Blueprint.md
new file mode 100644
--- /dev/null
+++ b/LivingInternetMuseum_FastAPI_React_Technical_Blueprint.md
@@ -0,0 +1,1338 @@
+# Living Internet Museum
+
+## High-Level To Technical Build Blueprint
+
+This document explains the Living Internet Museum from concept to implementation, using a React.js frontend and a FastAPI backend. It is written so that a developer or another AI system can recreate the product, understand the architecture, make feasibility decisions, and extend the MVP into a stronger production-grade application.
+
+## 1. Product Idea
+
+The Living Internet Museum is a digital museum for internet-native creative work.
+
+Instead of physical paintings in a building, the museum contains digital exhibits:
+
+- Generative art
+- Music
+- Short films
+- Essays
+- Digital poetry
+- Mini games
+- Interactive web experiments
+- Code-based artwork
+
+The key innovation is that each exhibit is connected to a creator wallet. When a visitor spends time viewing an exhibit, the app activates Web Monetization for that exhibit's creator.
+
+In plain English:
+
+```txt
+Visitor attention becomes direct creator support.
+```
+
+When a visitor opens Ada's artwork, the app streams support to Ada. When the visitor switches to Yemi's music, the support destination switches to Yemi.
+
+## 2. One-Sentence Pitch
+
+The Living Internet Museum is an online gallery where visitors explore digital exhibits and creators receive tiny streamed payments through Web Monetization while people spend time with their work.
+
+## 3. Core User Experience
+
+The product should feel like entering a premium digital gallery.
+
+The first screen is not a marketing landing page. It is the museum itself.
+
+The basic user journey is:
+
+```txt
+Visitor opens the museum
+↓
+Visitor sees themed rooms
+↓
+Visitor enters a room
+↓
+Visitor selects an exhibit
+↓
+Exhibit opens in focused viewer
+↓
+App activates the creator wallet for that exhibit
+↓
+Monetization indicator shows current state
+↓
+Value stream animation appears
+↓
+Timer tracks time spent
+↓
+Analytics are sent to backend
+↓
+Creator dashboard shows attention and support metrics
+```
+
+The emotional product moment is:
+
+```txt
+Streaming support to Ada Chen
+```
+
+That line, combined with a glowing value stream animation, is the main demonstration of Web Monetization.
+
+## 4. Why This Product Matters
+
+Most platforms monetize creators through indirect systems:
+
+- Ads
+- Subscriptions
+- Manual tips
+- Platform-controlled revenue sharing
+- Algorithmic distribution
+
+These models separate attention from payment.
+
+The Living Internet Museum connects them directly:
+
+```txt
+If someone spends meaningful time with a creator's work, value can flow to that creator.
+```
+
+This makes creator support feel direct, visible, and emotionally understandable.
+
+## 5. Target Users
+
+### 5.1 Visitors
+
+Visitors are curious internet users who want to discover digital creative work.
+
+They want:
+
+- Beautiful discovery
+- Low friction
+- No forced payment wall
+- A feeling that their attention matters
+- A simple way to support creators
+
+They should be able to browse even without a wallet.
+
+### 5.2 Creators
+
+Creators are artists, musicians, writers, filmmakers, game makers, poets, and web experimenters.
+
+They want:
+
+- A gallery page for their work
+- A wallet address connected to each exhibit
+- Analytics on who viewed their work
+- Time-spent data
+- Monetized attention data
+- Test or real earnings estimates
+
+### 5.3 Curators/Admins
+
+Curators manage museum quality.
+
+They want:
+
+- Room management
+- Exhibit approval
+- Featured exhibit controls
+- Moderation tools
+- Analytics across the museum
+
+For the MVP, admin tools can be minimal or handled through database seed data.
+
+## 6. MVP Scope
+
+The MVP should be simple but impressive.
+
+Required MVP features:
+
+- Home screen with museum rooms
+- 4 themed rooms
+- 10 sample exhibits
+- Exhibit viewer
+- Creator profile per exhibit
+- Creator wallet address per exhibit
+- Web Monetization test integration
+- Active monetization indicator
+- Basic visitor timer
+- Live animated value stream effect
+- Creator dashboard with mock or real analytics
+- Wallet setup guide
+
+Recommended MVP rooms:
+
+- Generative Dreams
+- Sound Garden
+- Indie Web Arcade
+- Digital Poetry
+
+Recommended MVP exhibit types:
+
+- Image
+- Audio
+- Video
+- Essay
+- Game or interactive embed
+
+## 7. Out Of Scope For MVP
+
+Do not include these in the first build unless specifically required:
+
+- Full creator upload portal
+- Real-money production settlement
+- Multi-creator revenue splitting
+- Full admin CMS
+- Full 3D museum world
+- NFT ownership
+- Complex social networking
+- Recommendation algorithm
+- Native mobile app
+- Advanced moderation queue
+
+These can be added after the core concept is proven.
+
+## 8. Technology Stack
+
+### 8.1 Frontend
+
+Use:
+
+- React.js
+- TypeScript
+- Vite
+- React Router
+- TanStack Query or SWR
+- CSS Modules, Tailwind CSS, or vanilla CSS
+- Canvas API or Framer Motion for the value stream animation
+
+Recommended frontend setup:
+
+```txt
+React + TypeScript + Vite
+```
+
+Vite is a strong fit because it provides a fast development server and production build flow. The Vite docs describe production deployment around building static assets with `vite build`.
+
+Reference: https://vite.dev/guide/build
+
+### 8.2 Backend
+
+Use:
+
+- FastAPI
+- Python 3.11+
+- Pydantic
+- SQLAlchemy or SQLModel
+- Alembic for migrations
+- PostgreSQL for production
+- SQLite for local development
+- Uvicorn for local ASGI serving
+
+FastAPI is a good fit because it gives:
+
+- Fast API development
+- Type-driven validation through Pydantic
+- Auto-generated OpenAPI docs
+- Clean async support
+- Easy local development
+
+Reference: https://fastapi.tiangolo.com
+
+### 8.3 Payments And Monetization
+
+Use:
+
+- Web Monetization
+- Interledger Test Wallet for MVP/testing
+- Creator wallet addresses stored per creator and exhibit
+
+Web Monetization lets a page declare a monetization destination through a monetization link element. The official docs describe Web Monetization as a way for site/content owners to receive payments as an alternative or complement to other revenue models.
+
+Reference: https://webmonetization.org/docs
+
+### 8.4 Database
+
+Use PostgreSQL in production.
+
+Use SQLite locally if you want fast setup.
+
+Recommended:
+
+```txt
+Local: SQLite
+Production: PostgreSQL
+```
+
+### 8.5 Deployment
+
+Recommended simple deployment:
+
+- Frontend: Vercel, Netlify, Cloudflare Pages, or static hosting
+- Backend: Render, Railway, Fly.io, DigitalOcean App Platform, or FastAPI Cloud
+- Database: Supabase Postgres, Neon, Render Postgres, Railway Postgres, or managed PostgreSQL
+
+## 9. First Principles: How Web Monetization Works
+
+Web Monetization is easiest to understand by comparing traditional payments to streaming.
+
+Traditional payment:
+
+```txt
+User pays $10 once.
+Creator receives $10.
+```
+
+Web Monetization:
+
+```txt
+User views content.
+Tiny amounts of value flow over time.
+Creator receives value while attention continues.
+```
+
+Analogy:
+
+```txt
+Traditional payment = handing over a bucket of water.
+Web Monetization = opening a tap.
+```
+
+If a visitor stays for 10 seconds, a small amount flows.
+
+If the visitor stays for 10 minutes, more flows.
+
+If the visitor leaves, the tap closes.
+
+## 10. Payment Stream Model
+
+The product should treat every exhibit view as a session.
+
+Each session has:
+
+- Visitor session ID
+- Exhibit ID
+- Creator ID
+- Wallet address
+- Started time
+- Ended time
+- Total duration
+- Monetization active duration
+- Monetization state changes
+
+Conceptually:
+
+```txt
+Exhibit view session = attention window
+Wallet address = payment destination
+Web Monetization state = whether value is flowing
+Timer = how long attention lasted
+Analytics event = record of what happened
+```
+
+## 11. Frontend Architecture
+
+Recommended frontend folder structure:
+
+```txt
+frontend/
+  index.html
+  package.json
+  vite.config.ts
+  tsconfig.json
+  src/
+    main.tsx
+    App.tsx
+    routes/
+      HomePage.tsx
+      RoomPage.tsx
+      ExhibitPage.tsx
+      DashboardPage.tsx
+      WalletGuidePage.tsx
+    components/
+      Layout.tsx
+      Header.tsx
+      RoomCard.tsx
+      ExhibitCard.tsx
+      ExhibitViewer.tsx
+      MonetizationIndicator.tsx
+      ValueStreamCanvas.tsx
+      CreatorPanel.tsx
+      MetricCard.tsx
+    hooks/
+      useMonetization.ts
+      useExhibitTimer.ts
+      useSessionId.ts
+      useApi.ts
+    api/
+      client.ts
+      rooms.ts
+      exhibits.ts
+      analytics.ts
+      creators.ts
+    types/
+      museum.ts
+    styles/
+      globals.css
+      theme.css
+```
+
+### 11.1 `main.tsx`
+
+Entry point for the React app.
+
+Responsibilities:
+
+- Mount React into the DOM
+- Configure router
+- Configure query provider
+- Import global styles
+
+### 11.2 `App.tsx`
+
+Top-level app shell.
+
+Responsibilities:
+
+- Define application routes
+- Provide layout
+- Keep global providers
+- Handle app-level fallback UI
+
+### 11.3 `HomePage.tsx`
+
+Museum lobby.
+
+Responsibilities:
+
+- Fetch rooms
+- Display room cards
+- Show high-level museum message
+- Link visitors into room pages
+
+### 11.4 `RoomPage.tsx`
+
+Room detail page.
+
+Responsibilities:
+
+- Fetch room by slug or ID
+- Fetch exhibits in that room
+- Display exhibit grid
+- Support sorting by curator order, views, support, newest
+
+### 11.5 `ExhibitPage.tsx`
+
+Core product page.
+
+Responsibilities:
+
+- Fetch exhibit detail
+- Display media
+- Display creator info
+- Activate Web Monetization destination
+- Track timer
+- Send analytics events
+- Render value stream animation
+
+### 11.6 `DashboardPage.tsx`
+
+Creator dashboard.
+
+Responsibilities:
+
+- Fetch creator metrics
+- Show views
+- Show time spent
+- Show monetized time
+- Show estimated test support
+- Show exhibit-level performance
+
+For MVP, dashboard can be open/demo-only. For production, protect it with auth.
+
+### 11.7 `WalletGuidePage.tsx`
+
+Explains how users can set up a Web Monetization-compatible wallet or test wallet.
+
+Responsibilities:
+
+- Explain test wallet setup
+- Explain browser extension/payment agent setup
+- Explain what the monetization states mean
+
+## 12. Key Frontend Hooks
+
+### 12.1 `useMonetization`
+
+Purpose:
+
+Handles Web Monetization tag insertion, removal, and state tracking.
+
+Inputs:
+
+- `walletAddress`
+- `creatorName`
+- `enabled`
+
+Outputs:
+
+- `state`
+- `isActive`
+- `isPending`
+- `isPaused`
+- `lastProgressEvent`
+
+Behavior:
+
+```txt
+On exhibit mount:
+  Remove old monetization link/meta tags
+  Insert new monetization tag for active exhibit wallet
+  Listen for monetization events
+
+On exhibit change:
+  Remove old tag
+  Insert new tag
+
+On unmount:
+  Remove current tag
+  Remove event listeners
+```
+
+Example simplified implementation:
+
+```ts
+useEffect(() => {
+  if (!walletAddress) return;
+
+  const link = document.createElement("link");
+  link.rel = "monetization";
+  link.href = walletAddress;
+  document.head.appendChild(link);
+
+  return () => {
+    link.remove();
+  };
+}, [walletAddress]);
+```
+
+### 12.2 `useExhibitTimer`
+
+Purpose:
+
+Tracks how long a visitor spends on an exhibit.
+
+Behavior:
+
+- Start when exhibit page mounts
+- Pause when document becomes hidden
+- Resume when document becomes visible
+- Track total seconds
+- Track monetized seconds only when monetization is active
+- Send final analytics event on unmount
+
+### 12.3 `useSessionId`
+
+Purpose:
+
+Creates or retrieves an anonymous visitor session ID.
+
+Storage:
+
+- `localStorage` for browser
+
+No personally identifiable information should be required for visitors.
+
+## 13. Backend Architecture
+
+Recommended backend folder structure:
+
+```txt
+backend/
+  pyproject.toml
+  requirements.txt
+  alembic.ini
+  app/
+    main.py
+    core/
+      config.py
+      database.py
+      security.py
+    models/
+      room.py
+      creator.py
+      exhibit.py
+      analytics.py
+      visitor.py
+    schemas/
+      room.py
+      creator.py
+      exhibit.py
+      analytics.py
+      dashboard.py
+    api/
+      routes/
+        rooms.py
+        exhibits.py
+        creators.py
+        analytics.py
+        dashboard.py
+        health.py
+    services/
+      analytics_service.py
+      dashboard_service.py
+      monetization_service.py
+    seed/
+      seed_data.py
+    tests/
+      test_rooms.py
+      test_exhibits.py
+      test_analytics.py
+```
+
+### 13.1 `app/main.py`
+
+FastAPI entry point.
+
+Responsibilities:
+
+- Create FastAPI app
+- Register routers
+- Configure CORS
+- Register middleware
+- Expose health endpoint
+
+### 13.2 `core/config.py`
+
+Configuration file.
+
+Responsibilities:
+
+- Load environment variables
+- Define database URL
+- Define CORS origins
+- Define environment mode
+
+Example variables:
+
+```txt
+DATABASE_URL=postgresql+psycopg://user:password@host:5432/living_museum
+FRONTEND_ORIGIN=http://localhost:5173
+ENVIRONMENT=development
+```
+
+### 13.3 `core/database.py`
+
+Database setup.
+
+Responsibilities:
+
+- Create SQLAlchemy engine
+- Create session dependency
+- Provide `get_db`
+
+### 13.4 `models/`
+
+Database models.
+
+Each model maps to a database table.
+
+### 13.5 `schemas/`
+
+Pydantic request/response schemas.
+
+These define what the API accepts and returns.
+
+### 13.6 `api/routes/`
+
+API route modules.
+
+Each file owns one resource area:
+
+- Rooms
+- Exhibits
+- Creators
+- Analytics
+- Dashboard
+- Health
+
+### 13.7 `services/`
+
+Business logic.
+
+Do not put heavy business logic inside route functions.
+
+Example:
+
+- Analytics aggregation belongs in `analytics_service.py`
+- Dashboard metrics belong in `dashboard_service.py`
+
+## 14. Database Schema
+
+### 14.1 Rooms
+
+Table: `rooms`
+
+Fields:
+
+```txt
+id UUID primary key
+slug text unique
+name text
+tagline text
+description text
+image_url text
+display_order integer
+created_at timestamp
+updated_at timestamp
+```
+
+### 14.2 Creators
+
+Table: `creators`
+
+Fields:
+
+```txt
+id UUID primary key
+name text
+role text
+bio text
+avatar_url text
+wallet_address text
+email text nullable
+created_at timestamp
+updated_at timestamp
+```
+
+### 14.3 Exhibits
+
+Table: `exhibits`
+
+Fields:
+
+```txt
+id UUID primary key
+room_id UUID foreign key rooms.id
+creator_id UUID foreign key creators.id
+title text
+description text
+story text
+media_type text
+media_url text
+preview_url text
+wallet_address text
+tags jsonb
+created_at timestamp
+updated_at timestamp
+published_at timestamp nullable
+display_order integer
+```
+
+### 14.4 Visitor Sessions
+
+Table: `visitor_sessions`
+
+Fields:
+
+```txt
+id UUID primary key
+session_token text unique
+created_at timestamp
+last_seen_at timestamp
+```
+
+### 14.5 Exhibit View Sessions
+
+Table: `exhibit_view_sessions`
+
+Fields:
+
+```txt
+id UUID primary key
+visitor_session_id UUID foreign key visitor_sessions.id
+exhibit_id UUID foreign key exhibits.id
+creator_id UUID foreign key creators.id
+wallet_address text
+started_at timestamp
+ended_at timestamp nullable
+duration_seconds integer default 0
+monetized_seconds integer default 0
+last_monetization_state text
+created_at timestamp
+```
+
+### 14.6 Monetization Events
+
+Table: `monetization_events`
+
+Fields:
+
+```txt
+id UUID primary key
+exhibit_view_session_id UUID foreign key exhibit_view_sessions.id
+event_type text
+state text
+amount text nullable
+asset_code text nullable
+asset_scale integer nullable
+raw_event jsonb nullable
+created_at timestamp
+```
+
+## 15. API Design
+
+Base URL:
+
+```txt
+/api
+```
+
+### 15.1 Health
+
+```txt
+GET /api/health
+```
+
+Response:
+
+```json
+{
+  "status": "ok"
+}
+```
+
+### 15.2 Rooms
+
+```txt
+GET /api/rooms
+GET /api/rooms/{room_slug}
+```
+
+### 15.3 Exhibits
+
+```txt
+GET /api/exhibits
+GET /api/exhibits/{exhibit_id}
+GET /api/rooms/{room_slug}/exhibits
+```
+
+### 15.4 Creators
+
+```txt
+GET /api/creators/{creator_id}
+GET /api/creators/{creator_id}/exhibits
+```
+
+### 15.5 Analytics
+
+```txt
+POST /api/analytics/view-start
+POST /api/analytics/view-heartbeat
+POST /api/analytics/view-end
+POST /api/analytics/monetization-event
+```
+
+### 15.6 Dashboard
+
+```txt
+GET /api/dashboard/summary
+GET /api/dashboard/creators/{creator_id}
+GET /api/dashboard/exhibits/{exhibit_id}
+```
+
+## 16. Analytics Flow
+
+When an exhibit opens:
+
+```txt
+Frontend calls POST /api/analytics/view-start
+Backend creates exhibit_view_session
+Backend returns view_session_id
+```
+
+Every 15 to 30 seconds:
+
+```txt
+Frontend calls POST /api/analytics/view-heartbeat
+Backend updates duration_seconds and monetized_seconds
+```
+
+When exhibit closes:
+
+```txt
+Frontend calls POST /api/analytics/view-end
+Backend stores ended_at and final durations
+```
+
+When monetization state changes:
+
+```txt
+Frontend calls POST /api/analytics/monetization-event
+Backend stores event
+```
+
+This heartbeat approach is better than relying only on `beforeunload`, because browser unload events can be unreliable.
+
+## 17. Web Monetization Frontend Flow
+
+On exhibit page:
+
+```txt
+Load exhibit
+↓
+Get wallet_address
+↓
+Inject <link rel="monetization" href="{wallet_address}">
+↓
+Listen for monetization events if supported
+↓
+Update UI state
+↓
+Animate value stream if active
+↓
+Remove link when leaving exhibit
+```
+
+Important:
+
+The app should not store private keys or ask for wallet passwords.
+
+The wallet/payment agent handles payment authorization.
+
+## 18. Value Stream Animation Concept
+
+The value stream animation is the visual metaphor for payment.
+
+It should represent:
+
+```txt
+Visitor attention → value movement → creator support
+```
+
+Recommended implementation:
+
+- Use Canvas API for particles
+- Render within `ValueStreamCanvas.tsx`
+- Activate when monetization state is `active`
+- Pause when state is `paused` or `inactive`
+- Increase intensity slowly based on time spent
+
+Canvas particle model:
+
+```txt
+Particle has:
+  x
+  y
+  velocity
+  opacity
+  size
+  color
+
+Animation loop:
+  clear canvas
+  update particles
+  draw particles
+  request next frame
+```
+
+Fallback:
+
+- If reduced motion is enabled, show a static glowing indicator.
+
+## 19. Feasibility Study
+
+### 19.1 Technical Feasibility
+
+The MVP is technically feasible.
+
+Why:
+
+- React can handle the museum UI.
+- Vite can build the frontend as static assets.
+- FastAPI can serve analytics and content APIs.
+- PostgreSQL can store exhibits, creators, sessions, and analytics.
+- Web Monetization can be integrated through document head tags and browser/payment-agent events.
+- The Interledger Test Wallet allows safe payment testing without real money.
+
+Main technical risks:
+
+- Web Monetization browser support may depend on compatible extensions/payment agents.
+- Wallet behavior may vary.
+- Real payment events and receipts may require deeper Open Payments integration later.
+- Analytics can be inaccurate if users close tabs abruptly.
+- Third-party media embeds can create security and performance risks.
+
+Mitigation:
+
+- Provide demo stream fallback.
+- Use heartbeat analytics.
+- Clearly label test wallet mode.
+- Avoid arbitrary user-provided scripts in MVP.
+- Start with curated exhibits.
+
+### 19.2 Product Feasibility
+
+The MVP is feasible as a demoable product.
+
+Strengths:
+
+- Strong emotional concept.
+- Easy to explain visually.
+- Clear creator economy angle.
+- Web Monetization is native to the product, not bolted on.
+- Can be built with seeded content first.
+
+Weaknesses:
+
+- Requires enough high-quality sample exhibits to feel real.
+- Users without wallets may not experience real payments.
+- Creators may need education on wallet setup.
+
+Mitigation:
+
+- Build a strong wallet guide.
+- Use preview mode.
+- Make the museum valuable even without payment.
+- Use beautiful curated samples.
+
+### 19.3 Business Feasibility
+
+Possible business models:
+
+- Platform fee on streamed payments
+- Premium creator analytics
+- Featured room placements
+- Institutional digital exhibitions
+- Sponsored curated rooms
+- Paid live online openings
+- White-label museum deployments
+
+MVP should not over-focus on monetizing the platform. It should prove engagement and creator support first.
+
+### 19.4 Operational Feasibility
+
+The MVP can be operated by a small team.
+
+Needed roles:
+
+- Frontend developer
+- Backend developer
+- Product/designer
+- Curator/content lead
+
+For a hackathon or student project, one full-stack developer can build the MVP with seeded data.
+
+## 20. Feature Improvement Roadmap
+
+### Phase 1: MVP
+
+- Seeded rooms
+- Seeded exhibits
+- Web Monetization tag switching
+- Timer
+- Basic analytics
+- Dashboard
+- Wallet guide
+
+### Phase 2: Creator Onboarding
+
+- Creator signup
+- Creator profile editing
+- Exhibit submission form
+- Wallet address validation
+- Upload media files
+
+### Phase 3: Better Monetization
+
+- Real Open Payments integration
+- Payment receipt tracking
+- Wallet balance/error states
+- Better event handling
+- Optional user spending controls
+
+### Phase 4: Social And Discovery
+
+- Visitor passport
+- Favorites
+- Shareable exhibit links
+- Curated paths
+- Trending exhibits
+- Room-level activity
+
+### Phase 5: Curator/Admin System
+
+- Admin dashboard
+- Approve/reject submissions
+- Feature exhibits
+- Moderate content
+- Manage rooms
+
+### Phase 6: Advanced Experience
+
+- 3D rooms
+- Live events
+- Ghost mode replay
+- Attention heatmaps
+- Multi-user presence
+- Revenue splitting among collaborators
+
+## 21. Security Considerations
+
+### 21.1 Visitor Privacy
+
+Do not collect sensitive visitor data.
+
+Use anonymous session IDs.
+
+Avoid storing:
+
+- Wallet private keys
+- Wallet passwords
+- Personal browsing identity
+- Payment credentials
+
+### 21.2 Creator Wallet Data
+
+Wallet addresses are public payment destinations, but still validate and sanitize them.
+
+### 21.3 Media Embeds
+
+Avoid arbitrary iframe/script embeds in MVP.
+
+If iframe support is needed:
+
+- Use allowlist domains
+- Use sandboxed iframes
+- Disable unsafe permissions
+
+### 21.4 API Security
+
+For MVP:
+
+- CORS restricted to frontend origin
+- Input validation with Pydantic
+- Rate limiting on analytics endpoints
+
+For production:
+
+- Creator auth
+- Admin auth
+- API rate limiting
+- Audit logs
+- Monitoring
+
+## 22. Accessibility Requirements
+
+The app should support:
+
+- Keyboard navigation
+- Visible focus states
+- Alt text for exhibit images
+- Captions/transcripts for audio/video where possible
+- WCAG AA color contrast
+- Reduced motion mode
+- Screen-reader-friendly labels
+
+The value stream animation must not be the only way to know monetization is active. Always include text state.
+
+## 23. Performance Requirements
+
+Target:
+
+- Home page loads in under 2 seconds
+- Exhibit page loads in under 1.5 seconds after initial app load
+- Value stream runs smoothly
+- Images are optimized
+- API responses under 300ms for normal reads
+
+Frontend performance actions:
+
+- Lazy-load exhibit media
+- Compress images
+- Use responsive image sizes
+- Keep animation lightweight
+- Code split dashboard if needed
+
+Backend performance actions:
+
+- Add database indexes
+- Aggregate dashboard metrics efficiently
+- Cache read-heavy room/exhibit data
+
+Recommended indexes:
+
+```txt
+exhibits.room_id
+exhibits.creator_id
+exhibit_view_sessions.exhibit_id
+exhibit_view_sessions.creator_id
+exhibit_view_sessions.started_at
+monetization_events.exhibit_view_session_id
+```
+
+## 24. Local Development Setup
+
+Recommended repository structure:
+
+```txt
+living-internet-museum/
+  README.md
+  docs/
+    LivingInternetMuseum_FastAPI_React_Technical_Blueprint.md
+  frontend/
+    package.json
+    vite.config.ts
+    src/
+  backend/
+    requirements.txt
+    app/
+  docker-compose.yml
+  .env.example
+```
+
+### 24.1 Backend Setup
+
+```bash
+cd backend
+python -m venv .venv
+source .venv/bin/activate
+pip install -r requirements.txt
+uvicorn app.main:app --reload --port 8000
+```
+
+Windows PowerShell:
+
+```powershell
+cd backend
+python -m venv .venv
+.\.venv\Scripts\Activate.ps1
+pip install -r requirements.txt
+uvicorn app.main:app --reload --port 8000
+```
+
+Backend runs at:
+
+```txt
+http://localhost:8000
+```
+
+FastAPI docs:
+
+```txt
+http://localhost:8000/docs
+```
+
+### 24.2 Frontend Setup
+
+```bash
+cd frontend
+npm install
+npm run dev
+```
+
+Frontend runs at:
+
+```txt
+http://localhost:5173
+```
+
+### 24.3 Environment Variables
+
+Frontend `.env`:
+
+```txt
+VITE_API_BASE_URL=http://localhost:8000/api
+```
+
+Backend `.env`:
+
+```txt
+DATABASE_URL=sqlite:///./living_museum.db
+FRONTEND_ORIGIN=http://localhost:5173
+ENVIRONMENT=development
+```
+
+## 25. Deployment Plan
+
+### 25.1 Frontend Deployment
+
+Build:
+
+```bash
+cd frontend
+npm run build
+```
+
+Output:
+
+```txt
+frontend/dist/
+```
+
+Deploy `dist/` to:
+
+- Vercel
+- Netlify
+- Cloudflare Pages
+- Static hosting
+
+Set:
+
+```txt
+VITE_API_BASE_URL=https://your-backend-domain.com/api
+```
+
+### 25.2 Backend Deployment
+
+Run production FastAPI with an ASGI server.
+
+Example:
+
+```bash
+uvicorn app.main:app --host 0.0.0.0 --port 8000
+```
+
+For production, use a platform that manages processes, HTTPS, environment variables, and logs.
+
+Recommended:
+
+- Render
+- Railway
+- Fly.io
+- DigitalOcean App Platform
+- FastAPI Cloud
+
+Set production environment variables:
+
+```txt
+DATABASE_URL=postgresql+psycopg://...
+FRONTEND_ORIGIN=https://your-frontend-domain.com
+ENVIRONMENT=production
+```
+
+### 25.3 Database Deployment
+
+Use managed PostgreSQL.
+
+Options:
+
+- Supabase
+- Neon
+- Render Postgres
+- Railway Postgres
+- DigitalOcean Managed Postgres
+
+Run migrations:
+
+```bash
+alembic upgrade head
+```
+
+Seed initial museum data:
+
+```bash
+python -m app.seed.seed_data
+```
+
+## 26. Testing Strategy
+
+### 26.1 Frontend Tests
+
+Use:
+

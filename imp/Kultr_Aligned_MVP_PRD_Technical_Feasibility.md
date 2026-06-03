# Kultr Aligned MVP PRD And Technical Feasibility

## 1. Product Summary

Kultr is the African culture-focused evolution of the Living Internet Museum.

It is an interactive digital museum where visitors explore curated African music, paintings, artifact artwork, stories, and digital exhibits. Every exhibit is connected to a creator, artist, museum, community, or cultural custodian. When a visitor spends time with an exhibit, Web Monetization activates that exhibit's wallet address and streams test value through the Interledger test wallet flow.

The original Living Internet Museum idea remains the core:

```txt
Attention becomes visible.
Presence creates support.
The payment destination follows the exhibit being viewed.
```

Kultr adds a sharper cultural focus:

```txt
African culture, language, location, ownership, access, and monetization.
```

## 2. North Star

The MVP is not just a feature list. It is a feeling.

The goal is for a visitor to open an exhibit and immediately understand:

```txt
I am experiencing this creator's work, and support is flowing to them right now.
```

The product moment should look like:

```txt
Streaming support to Amaka Okoro
```

with a soft animated value stream moving toward the exhibit.

## 3. MVP Goal

Build the smallest version of Kultr that proves:

- Visitors can enter a beautiful digital museum.
- Visitors can browse African cultural rooms.
- Visitors can open music, painting, and artifact artwork exhibits.
- Each exhibit has a creator/custodian wallet address.
- Web Monetization can activate the current exhibit wallet.
- Interledger test wallet addresses can simulate payment streaming.
- The app tracks attention time and monetized time.
- Creators/custodians can see basic engagement analytics.
- The app supports multilingual and low-bandwidth thinking from day one.

## 4. MVP Scope

### Must Have

- Museum home screen with themed rooms
- 10 curated sample exhibits
- At least 3 music exhibits
- At least 3 painting exhibits
- At least 3 artifact artwork exhibits
- Exhibit viewer
- Creator/custodian profile per exhibit
- Wallet address per exhibit
- Web Monetization integration
- Interledger test wallet mode
- Active monetization indicator
- Basic visitor timer
- Value stream animation
- Creator/custodian dashboard
- Wallet setup guide
- Low-data mode
- Multilingual-ready content model
- Copyright/license metadata

### Should Have

- Search by room, country, language, and exhibit type
- Shareable exhibit links
- Basic favorites/passport stored locally
- Audio narration field for artifact/painting descriptions
- More visible low-bandwidth toggle

### Not MVP

- Full VR/AR museum
- Public creator uploads
- Real-money production payouts
- Revenue splitting
- Full admin CMS
- NFT/digital collectibles
- Complex AI guide
- Live tours
- Native mobile apps
- Full 3D artifact rendering

## 5. MVP Rooms

The original Living Internet Museum rooms were:

- Generative Dreams
- Sound Garden
- Indie Web Arcade
- Digital Poetry

For Kultr, align the rooms to African cultural content while keeping the same immersive room concept.

Recommended MVP rooms:

### 5.1 Sound Roots

For music, oral performance, folk songs, spoken word, field recordings, and modern African sound.

Example exhibits:

- Yoruba talking drum performance
- Highlife guitar archive
- Hausa praise poetry recording

### 5.2 Painted Memory

For paintings, illustrations, murals, textile-inspired visuals, and contemporary visual art.

Example exhibits:

- Market day painting
- Adire-inspired digital canvas
- Sahel color study

### 5.3 Artifact House

For cultural objects, masks, carvings, textiles, pottery, tools, instruments, sculptures, and ceremonial items.

Example exhibits:

- Bronze head study
- Woven textile archive
- Carved mask documentation

### 5.4 Living Stories

For essays, poems, short films, cultural notes, interactive storytelling, and community histories.

Example exhibits:

- Migration poem
- Food memory essay
- Festival story archive

## 6. Core User Flows

### 6.1 Visitor Flow

```txt
Visitor opens Kultr
v
Visitor sees themed rooms
v
Visitor enters Sound Roots
v
Visitor opens a music exhibit
v
App activates that exhibit's wallet address
v
Indicator shows monetization state
v
Value stream animation starts
v
Timer tracks attention
v
Visitor switches to a painting
v
Old wallet stops, new wallet activates
```

### 6.2 Creator/Custodian Flow For MVP

```txt
Creator/custodian is represented in seeded data
v
Their exhibit has a wallet address
v
Visitors view the exhibit
v
Dashboard shows views, total time, monetized time, and estimated test support
```

Full creator upload can come later.

### 6.3 No-Wallet Visitor Flow

```txt
Visitor opens exhibit
v
No compatible wallet detected
v
App shows "Connect wallet to support creators"
v
Demo stream preview explains the concept
v
Visitor can still browse freely
```

## 7. Core Features From The Original PRD, Aligned To Kultr

### F-01 Museum Home Screen

Purpose:

The first impression. It must feel like entering a real digital museum, not a boring list of content.

Requirements:

- Full-screen or strong first-viewport museum lobby
- 3-4 room cards
- Room name
- Room visual
- Short tagline
- Exhibit count
- Optional live visitor count
- Responsive layout

Acceptance:

- Loads quickly
- Room cards are visually distinct
- Clicking a room opens room view

### F-02 Room View

Purpose:

Shows exhibits inside a selected cultural room.

Requirements:

- Room title and description
- Exhibit grid
- Exhibit thumbnail
- Creator/custodian name
- Media type icon
- Country/language tags
- Sorting: curator order, most viewed, most supported, newest

Acceptance:

- All 10 MVP exhibits render correctly
- Sorting works
- Clicking exhibit opens focused viewer

### F-03 Exhibit Viewer

Purpose:

The core experience where attention becomes active.

Supported MVP media:

- Image/painting
- Audio/music
- Artifact artwork image gallery
- Essay/story
- Optional video/short film

Requirements:

- Main exhibit content area
- Creator/custodian profile
- Cultural context
- Country/region/language
- Wallet address
- Monetization indicator
- Timer
- Value stream overlay
- License/copyright note

Acceptance:

- Music, painting, and artifact exhibits render properly
- Visitor can understand cultural context
- Wallet address activates when exhibit opens

### F-04 Web Monetization And Creator Wallet

Purpose:

This is the technical heart of Kultr.

Requirements:

- Every exhibit has `wallet_address`
- Frontend injects monetization link/meta when exhibit opens
- Old wallet is removed when visitor leaves/switches exhibit
- New wallet activates for the new exhibit
- Test wallet mode is clearly labelled

Preferred implementation:

```html
<link rel="monetization" href="{wallet_address}" />
```

Fallback:

If real Web Monetization support is unavailable, show demo stream state and explain wallet setup.

Acceptance:

- Active exhibit wallet appears in document head
- Switching exhibits changes wallet destination
- UI state updates correctly

### F-05 Live Monetization Indicator

Purpose:

Make the invisible payment layer visible.

States:

- Inactive: Connect wallet to support creators
- Pending: Connecting
- Active: Streaming support to [Creator]
- Paused: Support paused

Acceptance:

- Visible on exhibit page
- Creator/custodian name updates dynamically
- Works with no-wallet fallback

### F-06 Value Stream Animation

Purpose:

The showpiece. It explains Web Monetization visually.

Requirements:

- Soft particles or light stream
- Activates when monetization is active or demo preview is enabled
- Pauses when inactive
- Does not cover the artwork
- Respects reduced motion

Acceptance:

- Starts quickly
- Does not block content
- Communicates "value flowing"

### F-07 Visitor Timer

Purpose:

Measure meaningful attention.

Requirements:

- Starts when exhibit opens
- Pauses when tab is hidden
- Resumes when visible
- Tracks total viewing time
- Tracks monetized time separately
- Sends analytics to backend

Acceptance:

- Dashboard reflects session data
- Timer does not count hidden-tab time

### F-08 Creator/Custodian Dashboard

Purpose:

Show creators and cultural custodians that their work is being seen and supported.

MVP metrics:

- Total views
- Total attention time
- Monetized active time
- Estimated test support
- Top exhibits

Acceptance:

- Dashboard displays aggregate metrics
- Test earnings are clearly labelled as simulated

## 8. React + FastAPI Architecture

The original PRD suggested Next.js/Supabase for speed. Kultr can still use that, but based on current direction, the aligned technical stack is:

```txt
Frontend: React.js + TypeScript + Vite
Backend: FastAPI + Python
Database: SQLite for local MVP, PostgreSQL for production
Storage: Cloudinary/Supabase Storage/S3/R2
Deployment: Vercel/Netlify/Cloudflare Pages + Render/Railway/Fly.io
```

Why this aligns:

- React delivers the museum UI.
- FastAPI handles APIs, analytics, content, and future AI features.
- Python gives a strong path to translation, recommendation, tagging, and AI guide features.
- The backend can later serve mobile apps, admin tools, partner APIs, and institution dashboards.

## 9. Next.js vs React + FastAPI

### Next.js

Best for:

- Fast full-stack React MVP
- SEO-heavy content pages
- Single deployment on Vercel
- Small backend needs

Limitations for Kultr:

- Python AI features need a separate service later
- Long-running media/AI/analytics tasks are not ideal inside route handlers
- Backend can become coupled to frontend

### React + FastAPI

Best for:

- API-first platform
- Future AI features
- Analytics and dashboards
- Multilingual content processing
- Separate scaling of frontend/backend
- Mobile/admin/partner API expansion

Limitations:

- More setup
- Two deployments
- Needs CORS/config management

Recommendation:

```txt
Use React + FastAPI for Kultr.
```

It fits the long-term direction better.

## 10. Database Model

Minimum tables:

### rooms

```txt
id
slug
name
tagline
description
image_url
display_order
```

### creators

```txt
id
name
role
bio
avatar_url
wallet_address
country
language
email nullable
```

### exhibits

```txt
id
room_id
creator_id
title
description
cultural_context
media_type
media_url
preview_url
wallet_address
country
region
language_code
tags
license_id
display_order
```

### licenses

```txt
id
copyright_owner
license_type
usage_permissions
commercial_use_allowed
attribution_required
takedown_contact
visibility_level
cultural_restriction_notes
```

### visitor_sessions

```txt
id
session_token
created_at
last_seen_at
```

### exhibit_view_sessions

```txt
id
visitor_session_id
exhibit_id
creator_id
started_at
ended_at
duration_seconds
monetized_seconds
last_monetization_state
```

### monetization_events

```txt
id
exhibit_view_session_id
event_type
state
amount nullable
asset_code nullable
raw_event nullable
created_at
```

## 11. MVP API Endpoints

```txt
GET /api/health
GET /api/rooms
GET /api/rooms/{room_slug}
GET /api/rooms/{room_slug}/exhibits
GET /api/exhibits/{exhibit_id}
GET /api/creators/{creator_id}
POST /api/analytics/view-start
POST /api/analytics/view-heartbeat
POST /api/analytics/view-end
POST /api/analytics/monetization-event
GET /api/dashboard/summary
GET /api/dashboard/creators/{creator_id}
```

## 12. How Streaming Works In The MVP

Core idea:

```txt
Visitor attention opens the stream.
The active exhibit decides the wallet destination.
Web Monetization handles the browser-level payment signal.
Interledger test wallet simulates payment receiving.
Kultr records attention and monetization state.
```

Step-by-step:

```txt
Visitor opens exhibit
v
Frontend fetches exhibit.wallet_address
v
Frontend injects monetization link
v
Compatible wallet/payment agent detects it
v
Monetization state becomes pending/active
v
Kultr indicator shows "Streaming support to [Creator]"
v
Timer counts total time and monetized time
v
Analytics sent to FastAPI
v
Dashboard updates
```

For MVP:

- Use test wallet addresses
- Label all earnings as simulated/test
- Include demo preview if no wallet extension is available

## 13. Poor Internet And African Accessibility

Kultr must assume some users have slow, unstable, or expensive internet.

MVP requirements:

- Low-data mode
- Text metadata loads first
- Lazy-loaded images
- Compressed image formats
- Compressed audio
- No autoplay by default
- Disable heavy animation in low-data mode
- Reduced-motion support
- Optional lower-quality media

Future:

- PWA offline caching
- Downloadable exhibit packs for schools
- Audio-only tours
- SMS/USSD discovery is possible later but not MVP

## 14. Language And Location Inclusivity

Kultr should not treat Africa as one culture.

Every exhibit should support:

- Country
- Region
- City/town if relevant
- Cultural/ethnic group where appropriate
- Original language
- Translation fields
- Local title/name
- English/French/Arabic/Portuguese/Swahili expansion path
- Indigenous language support over time

MVP language fields:

```txt
language_code
title
description
cultural_context
translated_title nullable
translated_description nullable
audio_transcript nullable
```

## 15. Copyright And Cultural Protection

The MVP should use only curated/permissioned content.

Requirements:

- No public uploads in MVP
- License metadata per exhibit
- Copyright owner stored
- Creator/custodian attribution
- Takedown contact
- Watermark option for protected images
- Lower-resolution public previews
- Clear usage permissions

Important:

Kultr cannot fully prevent screenshots on the web. Do not claim it can.

Instead, use:

- Watermarking
- Rights metadata
- Signed URLs for protected files later
- Review workflows
- Community/custodian approval
- Cultural restriction levels

Visibility levels:

- Public
- Educational only
- Restricted
- Private/archive only

## 16. Feasibility Study

### 16.1 Technical Feasibility

Feasible today.

The team can build:

- React frontend
- FastAPI backend
- Seed database
- Exhibit viewer
- Music playback
- Painting image viewer
- Artifact image gallery
- Web Monetization link switching
- Test wallet mode
- Timer and analytics
- Dashboard
- Low-data mode

Harder features to delay:

- Real production payouts
- 3D artifacts
- AI guide
- Full CMS
- Live tours
- Complex rights enforcement

### 16.2 Economic Feasibility

MVP cost can stay low:

- Use open-source stack
- Use hosted sample media
- Use free/low-cost deployment tiers
- Use test wallet mode
- Use SQLite locally and managed Postgres later

Revenue later:

- Platform fee
- Museum subscriptions
- Educational licensing
- Sponsored rooms
- Paid virtual tours
- Grants
- Institution partnerships

### 16.3 Organizational Feasibility

A team of 5 is enough.

Roles:

- Product/project lead
- Frontend developer
- Backend developer
- Content/culture lead
- Design/QA/pitch lead

### 16.4 Operational Feasibility

The operational risk is content rights and authenticity, not code.

Mitigation:

- Start with permissioned content
- Track ownership
- Use cultural review
- Avoid sacred/restricted artifacts unless approved
- Partner with artists and communities first

### 16.5 Solution Feasibility

The solution is viable if the MVP stays focused.

Success depends on:

- Strong curated exhibits
- Clear monetization demonstration
- Fast low-data experience
- Trustworthy rights handling
- Inclusive language/location model

## 17. What A Group Of 5 Can Start Today

### Product Lead

- Freeze MVP scope
- Confirm name: Kultr
- Define 10 exhibit list
- Create project board
- Prepare demo narrative

### Frontend Developer

- Set up React + Vite + TypeScript
- Build home/room/exhibit pages
- Build music, painting, artifact components
- Build monetization indicator
- Build value stream animation

### Backend Developer

- Set up FastAPI
- Add database models
- Add seed data
- Add room/exhibit APIs
- Add analytics endpoints
- Add dashboard endpoints

### Content/Culture Lead

- Select 10 exhibits
- Confirm permissions
- Write cultural context
- Add language/location metadata
- Review copyright/cultural sensitivity

### Design/QA Lead

- Define Kultr theme/logo direction
- Build wireframes
- Test accessibility
- Test low-data mode
- Prepare pitch visuals

## 18. Progressive Build Plan

### Phase 1: Minimal MVP

- 4 rooms
- 10 exhibits
- Music, painting, artifact support
- Wallet per exhibit
- Web Monetization test flow
- Timer
- Analytics
- Dashboard
- Low-data mode

### Phase 2: Strong MVP

- Search/filter
- Wallet setup guide
- Better dashboard
- License display
- Multilingual text
- Share links

### Phase 3: Creator/Institution Platform

- Creator login
- Institution profiles
- Upload form
- Review workflow
- Rights management
- Media storage

### Phase 4: Intelligence And Immersion

- AI tour guide
- AI translation support
- Audio narration
- 3D artifact view
- Live tours
- Visitor passport

### Phase 5: Production Monetization

- Real payment integration
- Receipt tracking
- Creator payouts
- Platform fee logic
- Revenue split support

## 19. MVP Success Metrics

- Visitor understands the concept within 30 seconds
- 10 exhibits render correctly
- Music, painting, and artifact exhibits work
- Wallet destination switches between exhibits
- Timer tracks view time
- Dashboard shows attention metrics
- Low-data mode works
- At least 80% of test users understand "attention supports creators"
- Average exhibit engagement target: 60-90 seconds

## 20. Final Alignment Statement

Kultr should not drift away from the original Living Internet Museum MVP.

The original MVP's spine is still the product:

```txt
Rooms -> Exhibits -> Creator wallet -> Web Monetization -> Value stream -> Timer -> Dashboard
```

Kultr's focus adds:

```txt
African culture -> Music/Painting/Artifacts -> Languages/Locations -> Cultural rights -> Low-bandwidth access
```

The aligned MVP is therefore:

```txt
A culturally focused, African digital museum where visitors explore curated music, painting, and artifact exhibits, and Web Monetization test streaming makes attention visibly support creators and custodians.
```


# Audio listening & creator upload setup

## Audio listening (visitors)

### Where it works

| Page | Component | Source |
|------|-----------|--------|
| `/music` (Sound Roots) | `MusicExhibit.tsx` | Backend seed MP3 URLs (SoundHelix demos) or any HTTPS `.mp3` |
| Creator dashboard | Native `<audio controls>` | Preview uploaded audio via `blob:` URL from local storage |

### How playback works

1. **Sound Roots** loads exhibits with `mediaType: audio` from `GET /api/exhibits?mediaType=audio`.
2. `MusicExhibit` tries to fetch the file into a **blob URL** (optional hardening). If fetch fails (CORS), it **falls back to direct `src`** so playback still works in the demo.
3. When `currentTime > 0`, the page sets `currentPlaying` and shows **MonetizationStatus** (demo timer + $/sec).

### Add a new audio track (seed)

Edit `backend/app/seed/seed_data.py`:

```python
{
    "room_slug": "sound-roots",
    "creator_name": "Sani Kokari (The Kokari Walker)",
    "title": "Your Track Title",
    "media_type": "audio",
    "media_url": "https://your-cdn.com/track.mp3",  # must be HTTPS, CORS-friendly
    ...
}
```

Restart the API (seed runs on startup). Or host files under `frontend/public/audio/` and use `/audio/track.mp3`.

### Production audio checklist

- [ ] Host MP3 on CDN with `Access-Control-Allow-Origin` for your frontend origin
- [ ] Prefer ~128kbps MP3 for low bandwidth
- [ ] Set `Content-Type: audio/mpeg`
- [ ] Optional: HLS later — not required for MVP

---

## Creator upload (dashboard)

### Where

**`/dashboard`** → **Content Upload Pipeline** (only when signed in as **Creator**).

### Flow (MVP — local demo)

1. Sign up / sign in as **Creator** at `/auth`.
2. Open **Creator Workspace** (`/dashboard`).
3. Fill the upload form:
   - **Asset file** — image or audio (`image/*`, `audio/mpeg`, `audio/wav`, …)
   - **Title & timeline tag**
   - **Cultural narrative**
   - **Target room** — Sound Roots, Painted Memory, etc.
4. Click **Submit to admin review**.
5. Entry is saved in **`localStorage`** under `kultr_creator_uploads_{userId}`.
6. Row appears in **Your exhibits** with **Pending review** badge.
7. Audio uploads show an inline **`<audio controls>`** player using the blob URL.

### Code map

| File | Role |
|------|------|
| `frontend/src/types/creator.ts` | `CreatorProfile`, `CreatorWork`, `CreatorUploadDraft` |
| `frontend/src/data/mockCreators.ts` | Mock creators + analytics rows (Amaka, Kokari, LIM-style demos) |
| `frontend/src/services/creatorStorage.ts` | `localStorage` save/load for uploads & payment pointer |
| `frontend/src/components/creator/ContentUploadPipeline.tsx` | Upload form UI |
| `frontend/src/pages/CreatorDashboardPage.tsx` | Stats, pointer, upload, exhibit list |

### Mock creator data

Pre-built profiles in `MOCK_CREATOR_PROFILES`:

- **Amaka Okoro** — paintings  
- **Sani Kokari** — audio (with `mediaUrl` for playback)  
- **Noura Bello** — story  
- **Mina Alvarez / Yemi Okafor** — reference-style LIM analytics rows  

On login, `getMockCreatorForUser(email, name)` picks a profile by email or defaults to Amaka template.

Try: `creator@kulthera.africa` after signup, or match emails in `mockCreators.ts`.

### Next step: real uploads (backend)

1. `POST /api/creators/me/uploads` with `multipart/form-data`
2. Store in S3/R2/Supabase Storage
3. Create `Exhibit` row with `status=pending_review`
4. Admin approves → `status=live`
5. Replace `creatorStorage.ts` calls with API

---

## Responsiveness

Global breakpoints live in `frontend/src/styles/responsive.css`:

- **≤900px** — Sound Roots & exhibit split stack vertically  
- **≤768px** — Gallery lightbox stacks image + info  
- **≤640px** — Museum room grid → single column; dashboard exhibit rows reflow  

Import is in `main.tsx` (loaded app-wide).

---

## Quick test

```powershell
# API
cd backend
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm run dev
```

1. `/auth` → **Sign in as Creator** → any email/password (6+ chars)  
2. `/dashboard` → upload an MP3 → play inline in list  
3. `/music` → play Kokari track → confirm timer ticks  

# Kulthera Frontend - Development Guide

**Status**: MVP Phase 2 - Frontend Complete  
**Last Updated**: May 29, 2026  
**Team**: System Analysts, UI/UX Designers, Full-Stack Developers

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
# http://localhost:5173
```

### Environment Setup

Create `.env.local` in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
VITE_ANALYTICS_ENABLED=true
VITE_ENABLE_MONETIZATION_DEMO=true
```

---

## 📁 Project Structure

### **Organized by Feature**

```
src/
├── components/              # Reusable UI components
│   ├── Header.tsx          # Sticky navigation
│   ├── ProtectedRoute.tsx  # Auth enforcement
│   └── MonetizationStatus.tsx # Payment indicator
│
├── contexts/               # Global state management
│   └── AuthContext.tsx     # User auth state & session
│
├── pages/                  # Full page components (route-based)
│   ├── HomePage.tsx        # Museum lobby
│   ├── AuthPage.tsx        # Login/signup
│   ├── SoundRootsPage.tsx  # Music showcase (MVP star)
│   ├── GalleryPage.tsx     # Artwork gallery
│   ├── ExplorePage.tsx     # Regional filter (Phase 2)
│   └── CreatorDashboardPage.tsx # Analytics (protected)
│
├── hooks/                  # Custom React hooks
│   ├── useSessionId.ts     # Session tracking
│   └── useMonetization.ts  # Web Monetization API
│
├── styles/                 # CSS modules (organized per page)
│   ├── globals.css         # African-inspired design tokens
│   ├── header.css          # Navigation
│   ├── auth.css            # Login/signup forms
│   ├── home.css            # Home page
│   ├── soundRoots.css      # Music showcase
│   ├── gallery.css         # Artwork gallery
│   ├── dashboard.css       # Creator analytics
│   └── monetization.css    # Payment indicators
│
├── types/                  # TypeScript interfaces
│   └── museum.ts           # Exhibit, Creator, Room types
│
├── utils/                  # Utility functions & API
│   ├── api.ts              # Old axios instance (deprecated)
│   └── apiService.ts       # New API service layer (use this)
│
├── App.tsx                 # Root router & layout
└── main.tsx                # Entry point
```

---

## 🔑 Key Components Explained

### **AuthContext** 
Manages user authentication globally. Any component can call `useAuth()` to:
- Check if user is logged in
- Access user info (email, name, creator status)
- Call `login()`, `signup()`, `logout()`
- Access loading/error states

```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

**Why Context instead of Redux?** For MVP scope, Redux adds unnecessary complexity. Context is built-in and sufficient.

---

### **API Service Layer** (`apiService.ts`)
Centralized HTTP communication. All backend calls go through here.

**Pattern**:
1. One function per endpoint
2. Axios interceptor auto-injects auth token
3. Consistent error handling
4. Easy to mock for testing

```typescript
// Example: Fetch all exhibits
const exhibits = await fetchExhibits(page=1, limit=12);

// Example: Send analytics heartbeat
await sendViewHeartbeat({
  sessionId: 'xyz',
  exhibitId: '123',
  duration: 45,
  monetizationActive: true
});
```

---

### **ProtectedRoute** Component
Wrapper that enforces authentication. Used for creator-only pages.

```typescript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute requireCreator={true}>
      <CreatorDashboardPage />
    </ProtectedRoute>
  }
/>
```

If user isn't logged in → redirects to `/auth`  
If user isn't creator → shows "Access Denied"

---

## 🎨 Design System

### Color Palette (African-Inspired)

```css
--primary-gold: #D4AF37        /* Heritage, celebration */
--accent-rust: #A64D4D        /* Earth, authenticity */
--accent-forest: #2D5A3D      /* Growth, harmony */
--accent-indigo: #2E3B52      /* Wisdom, dignity */
```

### Typography

```css
--font-header: 'Poppins'       /* Display text */
--font-body: 'Karla'           /* Body text */
```

All components respect `prefers-reduced-motion` for accessibility.

---

## 🌊 Data Flow Example: "User Plays Music"

```
1. User clicks Play on SoundRootsPage
   ↓
2. SoundRootsPage calls fetchExhibit(id)
   ↓
3. apiService.ts makes GET /api/exhibits/{id}
   ↓
4. Axios interceptor adds Authorization header
   ↓
5. Backend returns exhibit + creator + wallet address
   ↓
6. SoundRootsPage displays player + creator info
   ↓
7. User hears audio, monetization starts
   ↓
8. Every 30 sec, sendViewHeartbeat() is called
   ↓
9. Backend logs visitor engagement + earnings
```

---

## 📊 MVP Feature Checklist

### Phase 2 (Current - COMPLETE)
- ✅ Authentication (email-based login/signup)
- ✅ Protected routes for creators
- ✅ Music showcase ("Sound Roots" room)
- ✅ Kokari Walker featured exhibit
- ✅ Artwork gallery with lightbox
- ✅ Creator dashboard with basic analytics
- ✅ Navigation system
- ✅ Responsive mobile design
- ✅ African cultural aesthetic

### Phase 3 (Next)
- [ ] Web Monetization API integration (real payment detection)
- [ ] Real-time monetization ticker
- [ ] Advanced analytics dashboard
- [ ] Search & filtering
- [ ] Creator profile pages
- [ ] Ratings/reviews
- [ ] Social sharing

### Phase 4+ (Future)
- [ ] Recommendation engine
- [ ] Creator marketplace
- [ ] Community features
- [ ] Multi-language support (already designed for it)
- [ ] Offline mode
- [ ] Mobile app

---

## 🧪 Development Tips

### Adding a New Page

1. **Create page component** in `src/pages/`
   ```typescript
   export const MyPage: React.FC = () => {
     return <div>...</div>;
   };
   ```

2. **Create styles** in `src/styles/mypage.css`

3. **Add route** in `App.tsx`
   ```typescript
   <Route path="/mypage" element={<MyPage />} />
   ```

4. **Add navigation link** in `Header.tsx`

---

### Calling the API

```typescript
import { fetchExhibits, sendViewHeartbeat } from '../utils/apiService';

// In component
useEffect(() => {
  const loadData = async () => {
    try {
      const data = await fetchExhibits(1, 12);
      setExhibits(data.exhibits);
    } catch (error) {
      const msg = getErrorMessage(error);
      setError(msg);
    }
  };
  loadData();
}, []);
```

---

### Protecting a Page

```typescript
<Route
  path="/creator-settings"
  element={
    <ProtectedRoute requireCreator={true}>
      <CreatorSettingsPage />
    </ProtectedRoute>
  }
/>
```

---

## 🐛 Common Issues & Solutions

### "Cannot GET /auth"
**Cause**: Vite dev server routing issue  
**Solution**: Ensure `vite.config.ts` has proper SPA routing config

---

### "API call returns 401 Unauthorized"
**Cause**: Auth token not sent or expired  
**Solution**: 
- Check localStorage for `authToken`
- Verify backend `/api/auth/login` works in Postman
- Check `apiService.ts` interceptor is adding header

---

### "Styles not loading"
**Cause**: CSS files not imported  
**Solution**: 
- Ensure page component imports its CSS file
- Check file path matches: `../styles/pagename.css`

---

## 📈 Performance Targets

- **Initial load**: < 3 seconds on 4G
- **Time to Interactive**: < 2 seconds
- **Image optimization**: Lazy loading, responsive sizes
- **Bundle size**: Target < 150KB (gzipped)

---

## 🔗 Deployment

### To Vercel (Recommended for MVP)

```bash
# 1. Push code to GitHub
git push origin main

# 2. Connect to Vercel
# https://vercel.com/new

# 3. Set environment variables
VITE_API_URL=https://kulthera-api.example.com

# 4. Deploy
vercel deploy
```

### To Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

---

## 🤝 Team Handoff Notes

**For Junior Developers**:
1. Start with Home page components
2. Study `AuthContext.tsx` to understand global state
3. Try adding a new button to Header
4. Then tackle a new page (e.g., create user profile page)

**For UI/UX Team**:
1. All color tokens are in `globals.css`
2. Component styles are co-located (e.g., `Header.tsx` + `header.css`)
3. Mobile breakpoints: 768px, 480px
4. Design system follows African cultural palette

**For Backend Team**:
1. API service expects JSON responses
2. Auth returns `{ token, user }`
3. Error responses should have `detail` field
4. See `apiService.ts` for all endpoints & payloads

---

## 📚 Resources

- [React Router v6](https://reactrouter.com/)
- [Lucide React Icons](https://lucide.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Web Monetization API](https://webmonetization.org/)
- [Interledger Protocol](https://interledger.org/)

---

## ✍️ Next Steps

1. **Phase 3 Kickoff**: Web Monetization API integration
2. **Backend Sync**: Ensure exhibit seed data loaded
3. **Testing**: Manual test all pages on mobile
4. **Performance**: Run Lighthouse audit
5. **Handoff**: Documentation for Phase 3 team

---

**Questions?** Check component comments — they explain the "why" behind each design decision.

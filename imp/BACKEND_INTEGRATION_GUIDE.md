# Backend Integration Guide for Kultr MVP

**Document Purpose**: Specifications and examples for frontend-backend integration  
**Target Audience**: Backend engineers, DevOps, API integrators  
**Date**: May 29, 2026

---

## 🔗 Overview

This guide defines the **contract between frontend and backend**, ensuring both teams develop independently and integrate seamlessly. The frontend (React/Vite) expects specific API responses; the backend (FastAPI) provides these through carefully defined endpoints.

### Key Principles

1. **Frontend is Request-Agnostic**: React doesn't care *how* data is stored, only that responses match the schema
2. **Backend Owns Data Persistence**: Database schema is backend responsibility
3. **Contracts are Type-Safe**: TypeScript interfaces on frontend match JSON responses
4. **No Breaking Changes Mid-Integration**: All endpoints versioned (`/api/v1/...`)

---

## 🌐 API Base URL Configuration

**Development**:
```
VITE_API_URL=http://localhost:8000
```

**Production**:
```
VITE_API_URL=https://kultr-backend.onrender.com
```

Frontend makes all requests relative to this base URL.

---

## 🔐 Authentication & Headers

### **Login Endpoint** (No Auth Required)

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "isCreator": false,
    "creatorId": null
  }
}
```

**Response** (401 Unauthorized):
```json
{
  "error": "Invalid credentials"
}
```

### **JWT Token Usage**

After login, frontend stores token in localStorage:

```javascript
localStorage.setItem("authToken", response.access_token);
```

All subsequent requests include the token:

```http
GET /api/exhibits
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Frontend Interceptor** (auto-injects):
```typescript
// In apiService.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 👤 User Management Endpoints

### **POST /api/auth/signup** (No Auth Required)

Create new user account.

**Request**:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "name": "Jane Smith"
}
```

**Validation** (frontend pre-checks):
- Email: Valid format, not already registered
- Password: Minimum 6 characters
- Name: At least 2 characters

**Response** (201 Created):
```json
{
  "id": 5,
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "isCreator": false,
  "creatorId": null
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Email already registered"
}
```

### **GET /api/auth/me** (Auth Required)

Get current authenticated user.

**Request**:
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "isCreator": false,
  "creatorId": null
}
```

---

## 🎨 Exhibit Endpoints

### **GET /api/exhibits** (No Auth Required)

List all exhibits with pagination and filtering.

**Query Parameters**:
```
?page=1&limit=10&room=1&type=music&search=kora&sort=popularity
```

**Request**:
```http
GET /api/exhibits?page=1&limit=10&room=1
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "title": "Kokari Walker - Kora Master",
      "description": "Listen to Kokari Walker's masterful kora performance...",
      "exhibitType": "music",
      "imageUrl": "/images/exhibits/kokari-kora-master.jpg",
      "mediaUrl": "/audio/kokari-walker-kora-master.mp3",
      "roomId": 1,
      "creatorId": 1,
      "culturalContext": "The kora is a 21-string lute-harp...",
      "locationOrigin": "Mali",
      "yearCreated": "2024",
      "medium": "Kora (21-string)",
      "durationSeconds": 480,
      "popularityScore": 950,
      "isFeatured": true,
      "creator": {
        "id": 1,
        "name": "Kokari Walker",
        "profileImageUrl": "/images/creators/kokari-walker.jpg",
        "country": "Mali"
      }
    },
    // ... more exhibits
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 27,
    "pages": 3
  }
}
```

**Query Parameter Details**:

| Param | Type | Example | Notes |
|-------|------|---------|-------|
| page | int | 1 | 1-indexed pagination |
| limit | int | 10 | Items per page (max 100) |
| room | int | 1 | Filter by room ID |
| type | string | music | Filter by exhibit_type |
| search | string | kora | Full-text search on title |
| sort | string | popularity | popularity, newest, views |

### **GET /api/exhibits/{id}** (No Auth Required)

Get single exhibit with full details.

**Request**:
```http
GET /api/exhibits/1
```

**Response** (200 OK):
```json
{
  "id": 1,
  "title": "Kokari Walker - Kora Master",
  "description": "Listen to Kokari Walker's masterful kora performance...",
  "exhibitType": "music",
  "imageUrl": "/images/exhibits/kokari-kora-master.jpg",
  "mediaUrl": "/audio/kokari-walker-kora-master.mp3",
  "roomId": 1,
  "creatorId": 1,
  "culturalContext": "The kora is a 21-string lute-harp from Mali and Senegal...",
  "locationOrigin": "Mali",
  "yearCreated": "2024",
  "medium": "Kora (21-string)",
  "durationSeconds": 480,
  "popularityScore": 950,
  "isFeatured": true,
  "createdAt": "2024-05-01T10:30:00Z",
  "updatedAt": "2024-05-15T14:45:00Z",
  "creator": {
    "id": 1,
    "name": "Kokari Walker",
    "bio": "Kokari Walker is a legendary kora virtuoso from Mali...",
    "profileImageUrl": "/images/creators/kokari-walker.jpg",
    "country": "Mali",
    "culturalHeritage": "Mandinka griot tradition",
    "paymentPointer": "$ilp.uphold.com/9h8G7K5m2X",
    "isFeatured": true,
    "socialLinks": {
      "website": "https://kokariwalkerkora.com",
      "instagram": "@kokari_walker_kora"
    }
  }
}
```

**Response** (404 Not Found):
```json
{
  "error": "Exhibit not found"
}
```

---

## 🎭 Room Endpoints

### **GET /api/rooms** (No Auth Required)

List all rooms.

**Request**:
```http
GET /api/rooms
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Sound Roots",
      "description": "Celebrate the living heritage of African music...",
      "imageUrl": "/images/rooms/soundroots-header.jpg",
      "orderIndex": 1,
      "exhibitCount": 5
    },
    {
      "id": 2,
      "name": "Art Gallery",
      "description": "Explore the vibrant visual traditions of Africa...",
      "imageUrl": "/images/rooms/gallery-header.jpg",
      "orderIndex": 2,
      "exhibitCount": 5
    }
  ]
}
```

### **GET /api/rooms/{id}/exhibits** (No Auth Required)

Get all exhibits in a specific room.

**Request**:
```http
GET /api/rooms/1/exhibits?page=1&limit=10
```

**Response** (200 OK):
```json
{
  "roomId": 1,
  "roomName": "Sound Roots",
  "data": [
    // ... exhibits array (same schema as GET /api/exhibits)
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

## 👨‍🎨 Creator Endpoints

### **GET /api/creators/{id}** (No Auth Required)

Get creator profile.

**Request**:
```http
GET /api/creators/1
```

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Kokari Walker",
  "bio": "Kokari Walker is a legendary kora virtuoso from Mali...",
  "profileImageUrl": "/images/creators/kokari-walker.jpg",
  "country": "Mali",
  "culturalHeritage": "Mandinka griot tradition",
  "paymentPointer": "$ilp.uphold.com/9h8G7K5m2X",
  "isFeatured": true,
  "socialLinks": {
    "website": "https://kokariwalkerkora.com",
    "instagram": "@kokari_walker_kora"
  },
  "exhibits": [
    // ... array of creator's exhibits (up to 5 most recent)
  ],
  "totalExhibits": 1,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### **GET /api/creators/featured** (No Auth Required)

Get featured creators (those with `isFeatured=true`).

**Request**:
```http
GET /api/creators/featured?limit=5
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Kokari Walker",
      "profileImageUrl": "/images/creators/kokari-walker.jpg",
      "isFeatured": true
    }
  ],
  "total": 1
}
```

### **GET /api/creators/me** (Auth Required)

Get authenticated user's creator profile (if creator).

**Request**:
```http
GET /api/creators/me
Authorization: Bearer {token}
```

**Response** (200 OK, if user is creator):
```json
{
  "id": 1,
  "name": "Kokari Walker",
  "bio": "...",
  "paymentPointer": "$ilp.uphold.com/9h8G7K5m2X",
  "exhibits": [...]
}
```

**Response** (403 Forbidden, if not creator):
```json
{
  "error": "User is not a creator"
}
```

---

## 📊 Analytics Endpoints

### **POST /api/analytics/view-heartbeat** (No Auth Required)

Record exhibit view session.

**Request**:
```json
POST /api/analytics/view-heartbeat
Content-Type: application/json

{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "exhibitId": 1,
  "viewDurationSeconds": 45,
  "monetizationActivated": true,
  "micropaymentAmount": 0.00015
}
```

**Validation** (backend):
- sessionId: UUID format
- exhibitId: Must exist
- viewDurationSeconds: Positive integer
- micropaymentAmount: Decimal, non-negative

**Response** (201 Created):
```json
{
  "id": 123,
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "exhibitId": 1,
  "viewDurationSeconds": 45,
  "createdAt": "2024-05-29T10:30:00Z"
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Invalid exhibit ID"
}
```

**Heartbeat Frequency**:
- Frontend sends heartbeat every 30 seconds during active viewing
- Heartbeat includes cumulative duration since view started
- Session ID is generated once per browser visit (localStorage)

### **GET /api/analytics/exhibits/{id}** (No Auth Required)

Get analytics for a specific exhibit.

**Request**:
```http
GET /api/analytics/exhibits/1?period=7days
```

**Query Parameters**:
- `period`: 7days, 30days, 90days, all

**Response** (200 OK):
```json
{
  "exhibitId": 1,
  "title": "Kokari Walker - Kora Master",
  "period": "7days",
  "stats": {
    "totalViews": 1250,
    "totalViewDuration": 45000,
    "averageViewDuration": 36,
    "uniqueVisitors": 890,
    "totalMicropayments": 0.185,
    "averageMicropaymentPerView": 0.000148
  },
  "topCountries": [
    {"country": "United States", "views": 350},
    {"country": "United Kingdom", "views": 180},
    {"country": "Canada", "views": 120}
  ],
  "viewsOverTime": [
    {"date": "2024-05-23", "views": 150},
    {"date": "2024-05-24", "views": 180},
    // ... more days
  ]
}
```

### **GET /api/creators/me/analytics** (Auth Required)

Get analytics dashboard for authenticated creator.

**Request**:
```http
GET /api/creators/me/analytics?period=30days
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "creatorId": 1,
  "creatorName": "Kokari Walker",
  "period": "30days",
  "totalStats": {
    "totalViews": 5230,
    "totalViewDuration": 195000,
    "totalMicropayments": 0.82,
    "exhibitCount": 1,
    "avgViewsPerExhibit": 5230
  },
  "exhibits": [
    {
      "exhibitId": 1,
      "title": "Kokari Walker - Kora Master",
      "views": 5230,
      "micropayments": 0.82,
      "avgViewDuration": 37
    }
  ],
  "revenueStats": {
    "totalEarnings": 0.82,
    "currency": "USD",
    "payoutMethod": "ILP",
    "lastPayout": "2024-05-28T00:00:00Z",
    "nextPayout": "2024-06-04T00:00:00Z"
  },
  "topReferrers": [
    {"source": "direct", "views": 2100},
    {"source": "google.com", "views": 1500}
  ]
}
```

---

## 🔄 Error Handling

All error responses follow this format:

**Standard Error Response**:
```json
{
  "error": "Human-readable error message",
  "statusCode": 400,
  "timestamp": "2024-05-29T10:30:00Z",
  "path": "/api/exhibits/999"
}
```

**HTTP Status Codes**:

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Exhibit fetched |
| 201 | Created | Analytics recorded |
| 400 | Bad Request | Invalid JSON, missing field |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | User lacks permission |
| 404 | Not Found | Exhibit doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Database error |

**Frontend Error Handling**:

```typescript
// In apiService.ts
export function getErrorMessage(error: AxiosError): string {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
}
```

---

## 🔐 CORS Configuration

**Backend must allow**:
```
Origins: 
  - http://localhost:5173 (dev)
  - https://kultr.vercel.app (prod)
Methods: GET, POST, PUT, DELETE, OPTIONS
Headers: Content-Type, Authorization
Credentials: true (for cookies if needed)
```

**FastAPI Example**:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://kultr.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📝 Frontend Type Definitions

**Location**: `frontend/src/types/museum.ts`

```typescript
// Auth
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  name: string;
  isCreator: boolean;
  creatorId: number | null;
}

// Exhibits
export interface Exhibit {
  id: number;
  title: string;
  description: string;
  exhibitType: 'music' | 'painting' | 'artifact' | 'story';
  imageUrl: string;
  mediaUrl: string | null;
  roomId: number;
  creatorId: number;
  culturalContext: string;
  locationOrigin: string;
  yearCreated: string;
  medium: string;
  durationSeconds: number | null;
  popularityScore: number;
  isFeatured: boolean;
  creator: Creator;
}

// Creators
export interface Creator {
  id: number;
  name: string;
  bio: string;
  profileImageUrl: string;
  country: string;
  culturalHeritage: string;
  paymentPointer: string;
  isFeatured: boolean;
  socialLinks?: Record<string, string>;
}

// Analytics
export interface ViewHeartbeat {
  sessionId: string;
  exhibitId: number;
  viewDurationSeconds: number;
  monetizationActivated: boolean;
  micropaymentAmount: number;
}
```

---

## 🧪 Testing Endpoints

**Test in Browser Developer Tools**:

```javascript
// Login
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
}).then(r => r.json()).then(d => console.log(d));

// Get exhibits
fetch('http://localhost:8000/api/exhibits?page=1&limit=5')
  .then(r => r.json())
  .then(d => console.log(d));

// Record view
fetch('http://localhost:8000/api/analytics/view-heartbeat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    exhibitId: 1,
    viewDurationSeconds: 45,
    monetizationActivated: false,
    micropaymentAmount: 0
  })
}).then(r => r.json()).then(d => console.log(d));
```

---

## 📋 Integration Checklist

**Backend Team**:
- [ ] Database schema created (rooms, creators, exhibits, analytics)
- [ ] Seed data inserted (10 exhibits, 5 creators)
- [ ] Authentication endpoints working (login, signup)
- [ ] Exhibit endpoints returning correct schema
- [ ] Analytics heartbeat accepting POST requests
- [ ] CORS configured for frontend domains
- [ ] Error responses formatted consistently
- [ ] JWT token generation/validation working

**Frontend Team**:
- [ ] API base URL configured
- [ ] Interceptor auto-injects auth token
- [ ] All pages call correct endpoints
- [ ] Form data matches expected schema
- [ ] Error messages display from backend
- [ ] Analytics heartbeat firing every 30 seconds
- [ ] Type safety enforced (TypeScript strict mode)

**Both Teams**:
- [ ] Tested integration locally
- [ ] Tested in staging environment
- [ ] Tested error scenarios
- [ ] Verified response times < 1 second
- [ ] Checked CORS headers
- [ ] Documented any deviations from this spec

---

## 🚀 Deployment Integration

**Development**: Backend on localhost:8000, Frontend on localhost:5173  
**Staging**: Backend on staging.kultr-api.com, Frontend on staging.kultr.app  
**Production**: Backend on kultr-backend.onrender.com, Frontend on kultr.vercel.app

Environment variables sync endpoints at deployment time.

---

**Questions?**

- **"Can I change the response schema?"** → Not without coordinating with frontend team. File issues first.
- **"What if I need a new endpoint?"** → Add to this spec, then implement on both sides.
- **"How do I test the API?"** → Use provided curl/fetch examples above.
- **"What's the pagination default?"** → limit=10, page=1

---

**Document Version**: 1.0  
**Last Updated**: May 29, 2026  
**Status**: Ready for Implementation

/**
 * API Service Layer
 * 
 * This module provides all HTTP communication with our backend.
 * Think of it as the "communication protocol" between our frontend museum
 * and the backend server. Centralizing API calls here makes it easier to:
 * 
 * 1. Change API endpoints in one place (not scattered across 50 components)
 * 2. Add error handling consistently
 * 3. Mock/test API responses
 * 4. Debug network issues
 * 
 * Pattern: Each function corresponds to one backend endpoint
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// Point this to your backend server
// During development: http://localhost:8000
// In production: https://kultr-api.example.com
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Create axios instance with default configuration
 * This is like setting up a standard "communication protocol" once,
 * so every request follows the same rules (headers, timeout, etc)
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor: Auto-inject auth token to every request
 * 
 * Similar to how a museum visitor shows their ticket at each exhibit,
 * we automatically include the auth token with every API request.
 * This saves us from manually adding it to 20+ different function calls.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ============================================
 * AUTHENTICATION ENDPOINTS
 * ============================================
 * Handle user login, signup, and session management
 */

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials extends LoginCredentials {
  name: string;
  isCreator?: boolean;
  preferredStyles?: string[];
  creatorStyle?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    isCreator: boolean;
  };
}

/**
 * POST /auth/login
 * Authenticate user and receive JWT token
 * Token is stored in localStorage for future requests
 */
export const authLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

/**
 * POST /auth/signup
 * Create new user account
 * Returns auth token immediately (auto-login on signup)
 */
export const authSignup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/signup', credentials);
  return response.data;
};

/**
 * ============================================
 * EXHIBIT ENDPOINTS
 * ============================================
 * Retrieve exhibit data, metadata, and creator information
 */

export interface Creator {
  id: string;
  name: string;
  bio: string;
  country: string;
  walletAddress: string;
  paymentPointer: string; // ILP payment pointer ($ilp.uphold.com/username)
  avatarUrl: string;
}

export interface Exhibit {
  id: string;
  roomId: string;
  title: string;
  description: string;
  culturalContext: string;
  mediaType: 'audio' | 'painting' | 'artifact' | 'story';
  mediaUrl: string;
  previewUrl: string;
  creator: Creator;
  walletAddress: string;
  createdAt: string;
}

/**
 * GET /exhibits
 * Fetch paginated list of all exhibits
 * Used for: Gallery, search, browsing
 * 
 * Why pagination? On high bandwidth, we could load all 1000 exhibits.
 * But for low-bandwidth regions (target market), we load 12 at a time.
 */
export const fetchExhibits = async (
  page: number = 1,
  limit: number = 12,
  filters?: { roomId?: string; mediaType?: string }
): Promise<{ exhibits: Exhibit[]; total: number }> => {
  const response = await apiClient.get<{ exhibits: Exhibit[]; total: number }>('/exhibits', {
    params: {
      page,
      limit,
      ...filters,
    },
  });
  return response.data;
};

/**
 * GET /exhibits/:id
 * Fetch single exhibit with full details and creator info
 * Used when: User clicks on an exhibit to view/interact
 * Backend also initializes Web Monetization wallet for this creator
 */
export const fetchExhibit = async (exhibitId: string): Promise<Exhibit> => {
  const response = await apiClient.get<Exhibit>(`/exhibits/${exhibitId}`);
  return response.data;
};

/**
 * ============================================
 * CREATOR ENDPOINTS
 * ============================================
 * Creator profile and analytics dashboard
 */

export interface CreatorAnalytics {
  totalVisitors: number;
  totalViewTime: number; // seconds
  totalEarnings: number;
  exhibitPerformance: Array<{
    exhibitId: string;
    exhibitTitle: string;
    viewCount: number;
    totalTime: number;
  }>;
}

/**
 * GET /creators/me
 * Fetch current logged-in creator's profile
 * Protected endpoint: requires auth token
 */
export const fetchCreatorProfile = async (): Promise<Creator> => {
  try {
    const response = await apiClient.get<Creator>('/dashboard/creators/me');
    return response.data;
  } catch (error) {
    // Fallback for development/testing
    console.warn('fetchCreatorProfile failed, using default data');
    throw error;
  }
};

/**
 * GET /creators/me/analytics
 * Fetch creator's dashboard analytics
 * Shows: visitor count, total earnings, per-exhibit breakdown
 * Protected endpoint: only for authenticated creators
 */
export const fetchCreatorAnalytics = async (): Promise<CreatorAnalytics> => {
  try {
    const response = await apiClient.get<any>('/dashboard/creators/me');
    // Transform backend response to match CreatorAnalytics interface
    return {
      totalVisitors: response.data.metrics?.total_views || 0,
      totalViewTime: Math.floor((response.data.metrics?.total_attention_hours || 0) * 3600),
      totalEarnings: response.data.metrics?.estimated_earnings_usd || 0,
      exhibitPerformance: response.data.exhibits?.map((ex: any) => ({
        exhibitId: ex.id || 'unknown',
        exhibitTitle: ex.title,
        viewCount: ex.views,
        totalTime: ex.monetized_seconds || 0,
      })) || [],
    };
  } catch (error) {
    // Fallback for development
    console.warn('fetchCreatorAnalytics failed, returning default data');
    throw error;
  }
};

/**
 * ============================================
 * ANALYTICS / TELEMETRY ENDPOINTS
 * ============================================
 * Track visitor behavior and engagement
 */

/**
 * POST /analytics/view-heartbeat
 * Send visitor engagement data in batches (every 30 seconds)
 * 
 * Why "heartbeat"? We don't send analytics immediately (too much traffic).
 * Instead, the frontend collects data for 30 seconds, then sends one batch.
 * Think of it like a museum counter: instead of counting every single visitor,
 * you count all visitors in the past 30 seconds and submit one report.
 */
export const sendViewHeartbeat = async (data: {
  sessionId: string;
  exhibitId: string;
  duration: number; // seconds watched
  monetizationActive: boolean;
}): Promise<void> => {
  await apiClient.post('/analytics/view-heartbeat', data);
};

/**
 * ============================================
 * WEB MONETIZATION ENDPOINTS
 * ============================================
 * Track Web Monetization events and creator earnings
 */

export interface MonetizationEvent {
  exhibitId: string;
  creatorId: string;
  amount: number;
  currency: string;
  timestamp: string;
}

export interface CreatorEarnings {
  totalEarnings: number;
  currency: string;
  lastUpdated: string;
  recentTransactions: MonetizationEvent[];
}

/**
 * POST /analytics/monetization-event
 * Record a Web Monetization payment event
 * Called when user with Coil extension completes a micropayment
 * 
 * Phase 2: Demo mode - records but doesn't process payments
 * Phase 3: Real mode - processes actual ILP payments
 */
export const recordMonetizationEvent = async (data: {
  exhibitId: string;
  amount: number;
  currency: string;
}): Promise<MonetizationEvent> => {
  const response = await apiClient.post<MonetizationEvent>('/analytics/monetization-event', data);
  return response.data;
};

/**
 * GET /creators/:id/earnings
 * Fetch total earnings for a creator (public data)
 * Used to display creator earnings badge
 */
export const fetchCreatorEarnings = async (creatorId: string): Promise<CreatorEarnings> => {
  const response = await apiClient.get<CreatorEarnings>(`/creators/${creatorId}/earnings`);
  return response.data;
};

/**
 * GET /creators/me/earnings
 * Fetch current logged-in creator's earnings (protected)
 * Used in dashboard for creator earnings view
 */
export const fetchMyEarnings = async (): Promise<CreatorEarnings> => {
  const response = await apiClient.get<CreatorEarnings>('/creators/me/earnings');
  return response.data;
};

/**
 * Error handling helper
 * 
 * Extract meaningful error messages from Axios errors
 * Useful for displaying user-friendly error messages in the UI
 * 
 * Example: Instead of showing "[ERR_BAD_REQUEST]", show "Email already exists"
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    
    // Backend sends structured error in response.data.detail
    if (axiosError.response?.data?.detail) {
      return axiosError.response.data.detail;
    }
    
    // Fallback to status message
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export default apiClient;

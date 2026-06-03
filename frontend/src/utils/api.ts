import { Room, Exhibit, ViewSession } from '../types/museum';

// Use local port 8000 for FastAPI communications during development
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Clean Fetch wrapper that automatically handles non-200 responses.
 * 
 * Analogy:
 *   Think of this like a mail courier. Instead of making every single function handle 
 *   lost mail or address typos, the courier does it in one central office and returns 
 *   a clear delivery status.
 */
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle errors elegantly
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API Error [${response.status}]: Failed request to ${endpoint}`;
    try {
      const parsed = JSON.parse(errorText);
      errorMessage = parsed.detail || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  // 204 No Content has no body
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  /**
   * Fetch all themed wings for the Lobby
   */
  getRooms: (): Promise<Room[]> => 
    apiRequest<Room[]>('/rooms/'),

  /**
   * Fetch specific Room details by slug
   */
  getRoom: (slug: string): Promise<Room> => 
    apiRequest<Room>(`/rooms/${slug}`),

  /**
   * Fetch exhibits with optional room filter
   */
  getExhibits: (roomSlug?: string): Promise<Exhibit[]> => {
    const query = roomSlug ? `?room_slug=${roomSlug}` : '';
    return apiRequest<Exhibit[]>(`/exhibits/${query}`);
  },

  /**
   * Fetch single exhibit details including Creator preloads
   */
  getExhibit: (id: string): Promise<Exhibit> => 
    apiRequest<Exhibit>(`/exhibits/${id}`),

  /**
   * Register or validate an anonymous visitor pass session
   */
  registerSession: (sessionToken: string): Promise<any> => 
    apiRequest('/analytics/session', {
      method: 'POST',
      body: JSON.stringify({ session_token: sessionToken }),
    }),

  /**
   * Notify backend that visitor opened an exhibit detail view
   */
  startViewSession: (visitorSessionToken: string, exhibitId: string): Promise<ViewSession> => 
    apiRequest<ViewSession>('/analytics/view-start', {
      method: 'POST',
      body: JSON.stringify({
        visitor_session_token: visitorSessionToken,
        exhibit_id: exhibitId,
      }),
    }),

  /**
   * Dispatch periodic heartbeats to update accumulated attention seconds
   */
  sendHeartbeat: (
    exhibitViewSessionId: string,
    visitorSessionToken: string,
    durationIncrement: number,
    monetizedIncrement: number,
    lastMonetizationState: string
  ): Promise<void> => 
    apiRequest<void>('/analytics/view-heartbeat', {
      method: 'POST',
      body: JSON.stringify({
        exhibit_view_session_id: exhibitViewSessionId,
        visitor_session_token: visitorSessionToken,
        duration_increment: durationIncrement,
        monetized_increment: monetizedIncrement,
        last_monetization_state: lastMonetizationState,
      }),
    }),

  /**
   * Log browser native progress micropayments
   */
  logMonetizationEvent: (
    exhibitViewSessionId: string,
    eventType: string,
    state: string,
    amount: string,
    assetCode: string,
    assetScale: number,
    rawEvent?: any
  ): Promise<void> => 
    apiRequest<void>('/analytics/monetization-event', {
      method: 'POST',
      body: JSON.stringify({
        exhibit_view_session_id: exhibitViewSessionId,
        event_type: eventType,
        state,
        amount,
        asset_code: assetCode,
        asset_scale: assetScale,
        raw_event: rawEvent,
      }),
    }),

  /**
   * Fetch real-time dashboard analytics for a Creator
   */
  getCreatorDashboard: (creatorId: string): Promise<any> => 
    apiRequest(`/dashboard/creators/${creatorId}`),
};

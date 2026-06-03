import { useState, useEffect } from 'react';

/**
 * Custom hook to retrieve or generate a persistent anonymous visitor session token.
 * Stores token in localStorage to maintain session historical identity, without 
 * harvesting personal identifiers or PII.
 */
export function useSessionId(): string {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    const STORAGE_KEY = 'kulthera_anonymous_session_token';
    
    // 1. Attempt to retrieve existing session ID
    let currentId = localStorage.getItem(STORAGE_KEY);
    
    // 2. Generate new cryptographically unique token if not present
    if (!currentId) {
      currentId = 'ksess_' + crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, currentId);
    }
    
    setSessionId(currentId);
  }, []);

  return sessionId;
}

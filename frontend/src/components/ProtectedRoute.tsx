/**
 * ProtectedRoute Component
 * 
 * Wrapper component that enforces authentication
 * 
 * Pattern: If user is not logged in, redirect to login page
 * Used for: Creator dashboard, profile page, any authenticated feature
 * 
 * This is like a "members only" sign at a museum entrance
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCreator?: boolean; // if true, only creators can access
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireCreator = false,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Still loading auth state, show nothing
  if (isLoading) {
    return null;
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Authenticated but not a creator, and creator access required
  if (requireCreator && !user?.isCreator) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>This area is only available to creators. Contact support to apply.</p>
      </div>
    );
  }

  // All checks passed, render component
  return <>{children}</>;
};

export default ProtectedRoute;

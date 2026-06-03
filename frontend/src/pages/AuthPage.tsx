/**
 * Login / Signup Component
 * 
 * Unified authentication page for both login and signup flows
 * 
 * Design principle: Keep it simple for MVP
 * - Email + password only (no social login, no OAuth)
 * - Client-side validation for better UX
 * - Smooth toggle between login/signup modes
 * - Clear error messaging
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Loader } from 'lucide-react';
import '../styles/auth.css';

type AuthMode = 'login' | 'signup';

interface FormData {
  email: string;
  password: string;
  name: string;
}

/**
 * Simple client-side validation
 * Returns errors object: { email: "error msg" } or empty {}
 * 
 * Why validate on client?
 * 1. Instant feedback (no API call needed)
 * 2. Better UX (user sees error immediately)
 * 3. Reduces server load (no invalid requests)
 * 4. Still validate on backend too (never trust client)
 */
const validateForm = (data: FormData, mode: AuthMode): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(data.email)) {
    errors.email = 'Please enter a valid email';
  }

  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  // Name validation (signup only)
  if (mode === 'signup') {
    if (!data.name) {
      errors.name = 'Name is required';
    } else if (data.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
  }

  return errors;
};

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, error: authError, isLoading, clearError } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * Handle input changes
   * Update formData state as user types
   * Clear validation errors when user corrects them
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  /**
   * Handle form submission
   * Validate → Call API → Navigate to home on success
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Client-side validation
    const errors = validateForm(formData, mode);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, formData.name);
      }

      // Success! Navigate to home page
      navigate('/');
    } catch (err) {
      // Error is handled by AuthContext and displayed below
      // No need to do anything here
    }
  };

  /**
   * Toggle between login and signup modes
   * Reset form when switching
   */
  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setFormData({ email: '', password: '', name: '' });
    setValidationErrors({});
    clearError();
  };

  return (
    <div className="auth-container">
      {/* Left side: Museum branding */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <h1 className="auth-title">Kulthera</h1>
          <p className="auth-subtitle">
            African Digital Museum
          </p>
          <p className="auth-description">
            Experience authentic African culture. Support creators in real-time through Web Monetization.
          </p>

          {/* Feature highlights */}
          <div className="auth-features">
            <div className="feature">
              <span className="feature-icon">🎵</span>
              <span>Discover Music</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🎨</span>
              <span>Explore Art</span>
            </div>
            <div className="feature">
              <span className="feature-icon">💰</span>
              <span>Support Creators</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Auth form */}
      <div className="auth-form-section">
        <div className="auth-form-wrapper">
          <h2 className="auth-form-title">
            {mode === 'login' ? 'Welcome Back' : 'Join Kulthera'}
          </h2>

          {/* API Error message */}
          {authError && (
            <div className="error-banner">
              <p>{authError}</p>
              <button
                className="error-dismiss"
                onClick={clearError}
                type="button"
              >
                ✕
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Name field (signup only) */}
            {mode === 'signup' && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                {validationErrors.name && (
                  <span className="error-text">{validationErrors.name}</span>
                )}
              </div>
            )}

            {/* Email field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              {validationErrors.email && (
                <span className="error-text">{validationErrors.email}</span>
              )}
            </div>

            {/* Password field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              {validationErrors.password && (
                <span className="error-text">{validationErrors.password}</span>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="spin" />
                  <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="auth-toggle">
            <p>
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <button
              type="button"
              className="btn-link"
              onClick={toggleMode}
              disabled={isLoading}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

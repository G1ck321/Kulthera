/**
 * Kulthera auth gateway — Visitor vs Creator (reference UI)
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';
import { ArtStylePicker } from '../components/onboarding/ArtStylePicker';
import { WelcomeArtRoomModal } from '../components/onboarding/WelcomeArtRoomModal';
import { CreatorOnboardingPanel } from '../components/onboarding/CreatorOnboardingPanel';
import '../styles/auth-gateway.css';
import '../styles/onboarding.css';
import '../styles/responsive.css';

type AuthMode = 'login' | 'signup';
type SignupStep = 'account' | 'styles' | 'creator-style';

interface FormData {
  email: string;
  password: string;
  name: string;
}

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, error: authError, isLoading, clearError } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [signupStep, setSignupStep] = useState<SignupStep>('account');
  const [isCreator, setIsCreator] = useState(false);
  const [preferredStyles, setPreferredStyles] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
  });

  const completeSignup = async (creatorStyle?: string) => {
    await signup(formData.email, formData.password, formData.name, {
      isCreator,
      preferredStyles: isCreator ? undefined : preferredStyles,
      creatorStyle,
    });
    if (isCreator) navigate('/dashboard');
    else setShowWelcome(true);
  };

  const handleEnter = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (mode === 'login') {
      try {
        await login(formData.email, formData.password);
        const userJson = localStorage.getItem('authUser');
        const parsed = userJson ? JSON.parse(userJson) : null;
        navigate(parsed?.isCreator ? '/dashboard' : '/');
      } catch {
        /* handled */
      }
      return;
    }

    if (signupStep === 'account') {
      if (!formData.name.trim()) return;
      setSignupStep(isCreator ? 'creator-style' : 'styles');
      return;
    }
  };

  const defaultEmail = isCreator ? 'creator@kulthera.africa' : 'visitor@kulthera.africa';

  return (
    <div className="auth-gateway">
      <WelcomeArtRoomModal
        open={showWelcome}
        onEnter={() => {
          localStorage.setItem('kultr_welcome_seen', '1');
          setShowWelcome(false);
          navigate('/gallery');
        }}
      />

      <div className="auth-gateway-brand">
        <h1>Kulthera</h1>
        <p className="auth-gateway-tagline">African culture, streamed alive.</p>
      </div>

      {mode === 'signup' && signupStep === 'styles' && (
        <div className="auth-gateway-card" style={{ maxWidth: 480 }}>
          <ArtStylePicker selected={preferredStyles} onChange={setPreferredStyles} />
          <button
            type="button"
            className="heritage-btn-primary"
            disabled={preferredStyles.length === 0 || isLoading}
            onClick={() => completeSignup()}
          >
            {isLoading ? 'Creating account...' : 'Continue'}
          </button>
          <button type="button" className="heritage-btn-secondary" style={{ width: '100%', marginTop: 12 }} onClick={() => setSignupStep('account')}>
            Back
          </button>
        </div>
      )}

      {mode === 'signup' && signupStep === 'creator-style' && (
        <div className="auth-gateway-card" style={{ maxWidth: 480 }}>
          <CreatorOnboardingPanel onComplete={({ style }) => completeSignup(style)} />
        </div>
      )}

      {(mode === 'login' || signupStep === 'account') && (
        <div className="auth-gateway-card">
          <div className="role-toggle-heritage">
            <button
              type="button"
              className={!isCreator ? 'active' : ''}
              onClick={() => setIsCreator(false)}
            >
              {mode === 'login' ? 'Sign in as Visitor' : 'Join as Visitor'}
            </button>
            <button
              type="button"
              className={isCreator ? 'active' : ''}
              onClick={() => setIsCreator(true)}
            >
              {mode === 'login' ? 'Sign in as Creator' : 'Join as Creator'}
            </button>
          </div>

          {authError && (
            <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: 12 }}>{authError}</p>
          )}

          <form onSubmit={handleEnter}>
            {mode === 'signup' && (
              <>
                <label className="heritage-label">Name</label>
                <input
                  className="heritage-input"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                />
              </>
            )}
            <label className="heritage-label">Email</label>
            <input
              className="heritage-input"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              placeholder={defaultEmail}
            />
            <label className="heritage-label">Password</label>
            <input
              className="heritage-input"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
            />
            <button type="submit" className="heritage-btn-primary" disabled={isLoading}>
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Loader size={18} className="spin" /> Please wait
                </span>
              ) : (
                'Enter Kulthera'
              )}
            </button>
          </form>

          <p className="auth-gateway-footer">
            Demo gateway: the same form splits visitors into the public museum and creators into
            their workspace.
          </p>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem' }}>
            {mode === 'login' ? (
              <>
                New here?{' '}
                <button type="button" className="heritage-btn-secondary" style={{ border: 'none', padding: 0, background: 'transparent' }} onClick={() => setMode('signup')}>
                  Sign up
                </button>
              </>
            ) : (
              <>
                Have an account?{' '}
                <button type="button" className="heritage-btn-secondary" style={{ border: 'none', padding: 0, background: 'transparent' }} onClick={() => { setMode('login'); setSignupStep('account'); }}>
                  Sign in
                </button>
              </>
            )}
          </p>
          <p style={{ textAlign: 'center', marginTop: 8 }}>
            <Link to="/" style={{ color: '#64748b', fontSize: '0.8rem' }}>
              ← Back to museum
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default AuthPage;

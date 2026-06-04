import React from 'react';
import { Sparkles } from 'lucide-react';

interface WelcomeArtRoomModalProps {
  open: boolean;
  onEnter: () => void;
}

export const WelcomeArtRoomModal: React.FC<WelcomeArtRoomModalProps> = ({ open, onEnter }) => {
  if (!open) return null;

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true">
      <div className="onboarding-modal welcome-modal">
        <div className="welcome-icon">
          <Sparkles size={32} />
        </div>
        <h2 className='light'>Welcome to the Art Room</h2>
        <p className="welcome-lead">
          You&apos;re not limited by recommendations here. Beauty is in the eye of the beholder —
          wander as far as you want.
        </p>
        <p className="welcome-sub">
          Every exhibit you open can stream support to its creator while you explore.
          Take your time. The museum follows your curiosity, not an algorithm.
        </p>
        <button type="button" className="btn-primary btn-wide" onClick={onEnter}>
          Enter the Gallery
        </button>
      </div>
    </div>
  );
};

export default WelcomeArtRoomModal;

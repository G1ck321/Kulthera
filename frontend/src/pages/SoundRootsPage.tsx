/**
 * Music Showcase Page - "Sound Roots"
 * 
 * This is the star of the MVP. The music room showcases:
 * 1. **Kokari Walker Featured Exhibit** - flagship artist
 * 2. **Audio player** with monetization ticker
 * 3. **Creator context** and cultural background
 * 4. **Curated playlist** of traditional African music
 * 
 * Why music as MVP focus?
 * - Strongest emotional connection (universally moving)
 * - Easiest to stream in low-bandwidth (smaller file sizes than video)
 * - Deepest cultural significance in African traditions
 * - Monetization model makes sense (artist support)
 * - Kokari Walker (kora player) = perfect flagship creator to tell the story
 */

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { fetchExhibits, Exhibit } from '../utils/apiService';
import { MonetizationStatus } from '../components/MonetizationStatus';
import { MusicExhibit } from '../components/MusicExhibit';
import '../styles/soundRoots.css';

/**
 * MusicExhibitType: Represents one music track/performance
 * Extended exhibit type with audio-specific metadata
 */
interface MusicExhibitType extends Exhibit {
  duration?: number; // in seconds
  instruments?: string[]; // e.g., ["kora", "talking drum"]
  language?: string; // e.g., "Mandinka", "Yoruba"
  tradition?: string; // e.g., "Griot tradition", "Call-and-response"
}

/**
 * SoundRootsPage Component
 * 
 * Mental model: Think of this as a "music gallery" where each piece
 * can be played and funds the creator in real-time.
 * 
 * This is similar to a streaming platform, but with:
 * - Creator names/faces prominent (not hidden)
 * - Monetization amount visible (not hidden)
 * - Cultural context explained (not generic)
 * - Low bandwidth design (not HD-only)
 */
export const SoundRootsPage: React.FC = () => {
  const [exhibits, setExhibits] = useState<MusicExhibitType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [displayedExhibit, setDisplayedExhibit] = useState<MusicExhibitType | null>(null);

  /**
   * Load all music exhibits from backend
   * Filters for mediaType === 'audio'
   */
  useEffect(() => {
    const loadExhibits = async () => {
      try {
        setIsLoading(true);
        const data = await fetchExhibits(1, 20, { mediaType: 'audio' });
        
        // Sort so Kokari Walker (if exists) is first
        const sorted = data.exhibits.sort((a, b) => {
          if (a.creator.name.includes('Kokari')) return -1;
          if (b.creator.name.includes('Kokari')) return 1;
          return 0;
        });

        setExhibits(sorted);
        // Auto-display first exhibit
        if (sorted.length > 0) {
          setDisplayedExhibit(sorted[0]);
        }
      } catch (err) {
        setError('Could not load music exhibits. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadExhibits();
  }, []);

  /**
   * Handle exhibit selection
   * Updates the main player display
   */
  const handleSelectExhibit = (exhibit: MusicExhibitType) => {
    setDisplayedExhibit(exhibit);
    setCurrentPlaying(exhibit.id);
  };

  /**
   * Format seconds to MM:SS display
   * Helper for audio duration
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="soundroots-container loading">
        <div className="loading-spinner"></div>
        <p>Loading music collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="soundroots-container error">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="soundroots-container">
      {/* Web Monetization Status - Only show when music is actively playing */}
      {currentPlaying && displayedExhibit && displayedExhibit.creator.paymentPointer && (
        <MonetizationStatus 
          creatorName={displayedExhibit.creator.name}
          paymentPointer={displayedExhibit.creator.paymentPointer}
        />
      )}
      {/* Hero section: Title + intro */}
      <div className="soundroots-hero">
        <div className="hero-content">
          <h1>Sound Roots</h1>
          <p className="hero-subtitle">
            Discover authentic African music and support creators in real-time
          </p>
          <p className="hero-description">
            From griot traditions to contemporary performances, explore music that carries
            cultural heritage. Your listening supports African artists directly through Web Monetization.
          </p>
        </div>
      </div>

      <div className="soundroots-layout">
        {/* Main Player Section */}
        <div className="soundroots-player">
          {displayedExhibit && (
            <div className="player-container-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <MusicExhibit
                src={displayedExhibit.mediaUrl}
                title={displayedExhibit.title}
                artistName={displayedExhibit.creator.name}
                onTimeUpdate={(time) => {
                  if (time > 0 && currentPlaying !== displayedExhibit.id) {
                    setCurrentPlaying(displayedExhibit.id);
                  }
                }}
              />
              
              {/* Monetization ticker */}
              {currentPlaying === displayedExhibit.id && (
                <div className="monetization-ticker" style={{ marginTop: '-10px' }}>
                  <div className="ticker-animation"></div>
                  <p>💰 Simulated support flowing to {displayedExhibit.creator.name}</p>
                </div>
              )}

              {/* Creator info card */}
              <div className="creator-card glass-panel" style={{ marginTop: '10px' }}>
                <img
                  src={displayedExhibit.creator.avatarUrl}
                  alt={displayedExhibit.creator.name}
                  className="creator-avatar"
                />
                <div className="creator-details">
                  <h3>{displayedExhibit.creator.name}</h3>
                  <p className="creator-role">{displayedExhibit.creator.bio}</p>
                  <div className="creator-stats">
                    <div className="stat">
                      <span className="stat-value">{displayedExhibit.creator.country || 'Africa'}</span>
                      <span className="stat-label">Origin</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Playlist / Exhibit list */}
        <div className="soundroots-playlist">
          <div className="playlist-header">
            <h3>Sound Roots Collection</h3>
            <span className="playlist-count">{exhibits.length} tracks</span>
          </div>

          <div className="playlist-items">
            {exhibits.map((exhibit) => (
              <button
                key={exhibit.id}
                className={`playlist-item ${displayedExhibit?.id === exhibit.id ? 'active' : ''}`}
                onClick={() => handleSelectExhibit(exhibit)}
              >
                {/* Highlight Kokari Walker */}
                {exhibit.creator.name.includes('Kokari') && (
                  <div className="flagship-badge">Featured</div>
                )}

                <div className="item-content">
                  <div className="item-title">
                    {currentPlaying === exhibit.id && (
                      <span className="playing-indicator">🎵</span>
                    )}
                    <span>{exhibit.title}</span>
                  </div>
                  <div className="item-meta">
                    <span className="artist">{exhibit.creator.name}</span>
                    <span className="duration">
                      <Clock size={12} />
                      {formatDuration(exhibit.duration || 0)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className="soundroots-info">
        <div className="info-card">
          <h3>🌍 African Musical Traditions</h3>
          <p>
            Sound Roots celebrates diverse African musical heritage—from griot storytelling
            traditions to contemporary innovations. Each performance represents generations
            of cultural knowledge.
          </p>
        </div>

        <div className="info-card">
          <h3>💰 How Monetization Works</h3>
          <p>
            When you listen to music on Kulthera, Web Monetization technology streams micropayments
            directly to the artist's wallet. No intermediaries. Pure support.
          </p>
        </div>

        <div className="info-card">
          <h3>🎤 Featured: Kokari Walker</h3>
          <p>
            Kokari Walker's kora mastery carries Mandinka tradition forward. Through Kulthera,
            his artistry reaches global audiences while he earns sustainable income from
            his cultural work.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SoundRootsPage;

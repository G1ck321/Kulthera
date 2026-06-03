import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Palette, ArrowRight } from 'lucide-react';
import { HeroCarousel } from '../components/HeroCarousel';
import { HERO_SLIDES } from '../data/heroSlides';
import { MUSEUM_ROOMS } from '../data/mockCreators';
import '../styles/home.css';
import '../styles/hero-carousel.css';
import '../styles/responsive.css';

const LOGO_SRC = '/assets/kulthera-logo.png';

export const HomePage: React.FC = () => {
  const totalExhibits = MUSEUM_ROOMS.reduce((n, r) => n + r.exhibits, 0);

  return (
    <div className="home-container">
      <section className="hero" aria-label="Welcome">
        <HeroCarousel slides={HERO_SLIDES} intervalMs={4500} />

        <div className="hero-content">
          <img
            src={LOGO_SRC}
            alt="Kulthera"
            className="hero-logo"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const el = document.getElementById('hero-title-fallback');
              if (el) el.style.display = 'block';
            }}
          />
          <h1 id="hero-title-fallback" className="hero-title-fallback" style={{ display: 'none' }}>
            Kulthera
          </h1>
          <p className="hero-kicker">Open culture. Seamless value.</p>
          <p className="hero-description">
            A premium digital museum preserving African cultural history while routing
            attention into creator support.
          </p>
          <div className="hero-cta">
            <Link to="/gallery" className="btn-primary-large">
              Enter Museum <ArrowRight size={20} />
            </Link>
            <Link to="/auth" className="btn-secondary-large">
              Creator Studio
            </Link>
          </div>
          <p className="hero-powered">Powered by Interledger Protocol</p>
        </div>

        <aside className="hero-stat-card" aria-label="Museum stats">
          <p className="hero-stat-label">Live demo loop</p>
          <p className="hero-stat-value">{totalExhibits}</p>
          <p className="hero-stat-sub">curated exhibits across four rooms</p>
          <div className="hero-stat-dots">
            <span className="dot-green" />
            <span className="dot-white" />
            <span className="dot-black" />
          </div>
        </aside>
      </section>

      <section className="rooms-section container-page">
        <div className="rooms-section-header">
          <h2>Museum Rooms</h2>
          <p className="rooms-section-hint">Choose a room to begin the stream.</p>
        </div>
        <div className="rooms-grid rooms-grid-responsive">
          {MUSEUM_ROOMS.map((room) => {
            const href = room.slug === 'sound-roots' ? '/music' : '/gallery';
            const icon =
              room.slug === 'sound-roots'
                ? '🎵'
                : room.slug === 'painted-memory'
                  ? '🎨'
                  : room.slug === 'artifact-house'
                    ? '🏛️'
                    : '📖';
            return (
              <Link key={room.slug} to={href} className="room-card">
                <div className="room-icon">{icon}</div>
                <h3>{room.name}</h3>
                <p>{room.exhibits} exhibits in this wing</p>
                <span className="room-visitors">{room.visitors} visitors now</span>
                <div className="room-footer">
                  {room.slug === 'sound-roots' ? <Music size={16} /> : <Palette size={16} />}
                  <span>Enter room</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="how-it-works">
        <h2>How Kulthera Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Discover</h3>
            <p>Browse music, paintings, artifacts, and stories across four rooms.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Engage</h3>
            <p>Your presence funds the creator in real time.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Support</h3>
            <p>Web Monetization streams to the active exhibit wallet.</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Track</h3>
            <p>Creators upload and manage work from their studio.</p>
          </div>
        </div>
      </section>

      <section className="monetization-explainer">
        <div className="explainer-content">
          <div className="explainer-text">
            <h2>Attention becomes visible support</h2>
            <p>Value routes directly to custodians and artists through open web standards.</p>
            <Link to="/auth" className="btn-get-started">Get started</Link>
          </div>
          <div className="explainer-visual">
            <div className="visual-flow">
              <div className="flow-item"><div className="flow-icon">👤</div><p>Visitor</p></div>
              <span className="flow-arrow">→</span>
              <div className="flow-item"><div className="flow-icon">🏛️</div><p>Kulthera</p></div>
              <span className="flow-arrow">→</span>
              <div className="flow-item"><div className="flow-icon">🎨</div><p>Creator</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-creator">
        <h2>Featured: Sani &ldquo;The Kokari Walker&rdquo;</h2>
        <div className="featured-card">
          <div className="featured-content">
            <img
              src="https://images.unsplash.com/photo-1531384370597-859faa8ce332?auto=format&fit=crop&q=80&w=200"
              alt="The Kokari Walker"
              className="featured-image"
            />
            <div className="featured-text">
              <h3>Sani Kokari — Wandering Minstrel</h3>
              <p className="featured-origin">Mali · Kora tradition</p>
              <p>Your listening time streams support directly to his wallet.</p>
              <Link to="/music" className="btn-listen">Listen in Sound Roots</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <h2>Ready to explore?</h2>
        <p>Step into the museum.</p>
        <Link to="/gallery" className="btn-primary-large">
          Enter Museum <ArrowRight size={20} />
        </Link>
      </section>
    </div>
  );
};

export default HomePage;

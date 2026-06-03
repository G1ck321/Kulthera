import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Palette, ArrowRight } from 'lucide-react';
import { MUSEUM_ROOMS } from '../data/mockCreators';
import '../styles/home.css';
import '../styles/responsive.css';

const LOGO_SRC = '/assets/kulthera-logo.png';

export const HomePage: React.FC = () => {
  const totalExhibits = MUSEUM_ROOMS.reduce((n, r) => n + r.exhibits, 0);

  return (
    <div className="home-container">
      <section className="hero" aria-label="Welcome">
        <div className="hero-texture" aria-hidden="true" />
        <div className="hero-content">
          <img
            src={LOGO_SRC}
            alt="Kulthera"
            className="hero-logo"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const fallback = document.getElementById('hero-title-fallback');
              if (fallback) fallback.style.display = 'block';
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
            <span className="dot-teal" />
            <span className="dot-ochre" />
            <span className="dot-rust" />
          </div>
        </aside>
      </section>

      <section className="rooms-section container-page section-tribal-accent">
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
            <p>Listen, view, or read — your presence funds the creator in real time.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Support</h3>
            <p>Web Monetization streams micropayments to the active exhibit wallet.</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Track</h3>
            <p>Creators manage uploads and analytics from their studio dashboard.</p>
          </div>
        </div>
      </section>

      <section className="monetization-explainer">
        <div className="explainer-content">
          <div className="explainer-text">
            <h2>Attention becomes visible support</h2>
            <p>
              Traditional platforms take a large cut. Kulthera routes value directly to
              custodians and artists through open web standards.
            </p>
            <p>No checkout wall — support flows while you explore.</p>
            <Link to="/auth" className="btn-get-started">
              Get started
            </Link>
          </div>
          <div className="explainer-visual">
            <div className="visual-flow">
              <div className="flow-item">
                <div className="flow-icon">👤</div>
                <p>Visitor</p>
              </div>
              <span className="flow-arrow">→</span>
              <div className="flow-item">
                <div className="flow-icon">🏛️</div>
                <p>Kulthera</p>
              </div>
              <span className="flow-arrow">→</span>
              <div className="flow-item">
                <div className="flow-icon">🎨</div>
                <p>Creator</p>
              </div>
            </div>
            <p className="flow-caption">Support follows the exhibit you are viewing</p>
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
              <p className="featured-origin">Mali · Bambara Kora tradition</p>
              <p>
                His Kora journeys document cultures across the Sahel. On Kulthera, your
                listening time streams support directly to his wallet.
              </p>
              <Link to="/music" className="btn-listen">
                Listen in Sound Roots
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <h2>Ready to explore?</h2>
        <p>Step into the museum — beauty is in the eye of the beholder.</p>
        <Link to="/gallery" className="btn-primary-large">
          Enter Museum <ArrowRight size={20} />
        </Link>
      </section>
    </div>
  );
};

export default HomePage;

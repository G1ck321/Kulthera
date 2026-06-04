import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HeroCarousel } from '../components/HeroCarousel';
import { DemoStatusBadge } from '../components/DemoStatusBadge';
import { MuseumWingCard } from '../components/MuseumWingCard';
import { HERO_SLIDES } from '../data/heroSlides';
import { MUSEUM_ROOMS } from '../data/mockCreators';
import '../styles/home.css';
import '../styles/hero-carousel.css';
import '../styles/responsive.css';

const LOGO_SRC = '/assets/kulthera-logo.png';

export const HomePage: React.FC = () => {
  const totalExhibits = MUSEUM_ROOMS.reduce((n, r) => n + r.exhibits, 0);

  const wings = MUSEUM_ROOMS.map((room) => ({
    slug: room.slug,
    name: room.name,
    tagline: room.tagline,
    exhibits: room.exhibits,
    visitors: room.visitors,
    imageUrl: room.imageUrl,
    href: room.slug === 'sound-roots' ? '/music' : '/gallery',
  }));

  return (
    <div className="home-container">
      <DemoStatusBadge exhibitCount={totalExhibits} />

      <section className="hero" aria-label="Welcome">
        <HeroCarousel slides={HERO_SLIDES} intervalMs={5000} />

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
            <Link to="/gallery" className="btn-glass">
              Enter Museum <ArrowRight size={20} />
            </Link>
            <Link to="/auth" className="btn-outline-light">
              Creator Studio
            </Link>
          </div>
          <p className="hero-powered">Powered by Interledger Protocol</p>
        </div>
      </section>

      <section className="rooms-section">
        <div className="rooms-section-header">
          <h2>Museum Wings</h2>
          <p className="rooms-section-hint">Choose a room to begin the stream.</p>
        </div>
        <div className="wings-grid">
          {wings.map((wing) => (
            <MuseumWingCard key={wing.slug} wing={wing} />
          ))}
        </div>
      </section>

      <section className="how-it-works">
        <h2>How Kulthera Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Discover</h3>
            <p>Browse music, paintings, artifacts, and stories across four curated wings.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Engage</h3>
            <p>Your presence funds the creator in real time—attention becomes visible.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Support</h3>
            <p>Web Monetization streams to whoever&apos;s exhibit you are experiencing.</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Track</h3>
            <p>Creators steward their rooms from a professional workspace.</p>
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
            <Link to="/auth" className="btn-get-started">Begin as patron or creator</Link>
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
        <p>Beauty is in the eye of the beholder—wander as far as you wish.</p>
        <Link to="/gallery" className="btn-glass">
          Enter Museum <ArrowRight size={20} />
        </Link>
      </section>
    </div>
  );
};

export default HomePage;

/**
 * Home Page / Museum Lobby
 * 
 * Entry point to the museum
 * Explains the concept and invites users to explore
 * 
 * Shows:
 * 1. Museum mission statement
 * 2. Featured exhibits/rooms
 * 3. Call-to-action buttons
 * 4. How Web Monetization works (visual explanation)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Palette, Zap, ArrowRight } from 'lucide-react';
import { MUSEUM_ROOMS } from '../data/mockCreators';
import '../styles/home.css';
import '../styles/responsive.css';

export const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Kulthera</h1>
          <p className="hero-subtitle">
            The African Digital Museum for Creative Expression and Direct Support
          </p>
          <p className="hero-description">
            Experience authentic African culture—music, paintings, artifacts, and stories.
            When you engage with an exhibit, Web Monetization technology streams support
            directly to the creator. Attention becomes visible. Presence creates support.
          </p>

          <div className="hero-cta">
            <Link to="/music" className="btn-primary-large">
              Explore Music <ArrowRight size={20} />
            </Link>
            <Link to="/gallery" className="btn-secondary-large">
              View Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Rooms / Sections */}
      <section className="rooms-section container-page">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2>Museum Rooms</h2>
          <p style={{ color: 'rgba(245,241,232,0.6)', fontSize: '0.9rem' }}>Choose a room to begin the stream.</p>
        </div>
        <div className="rooms-grid rooms-grid-responsive">
          {MUSEUM_ROOMS.map((room) => {
            const href = room.slug === 'sound-roots' ? '/music' : '/gallery';
            return (
              <Link key={room.slug} to={href} className="room-card">
                <div className="room-icon">
                  {room.slug === 'sound-roots' ? '🎵' : room.slug === 'painted-memory' ? '🎨' : room.slug === 'artifact-house' ? '🏛️' : '📖'}
                </div>
                <h3>{room.name}</h3>
                <p>
                  {room.exhibits} exhibits · {room.visitors} visitors now
                </p>
                <div className="room-footer">
                  {room.slug === 'sound-roots' ? <Music size={16} /> : <Palette size={16} />}
                  <span>Enter room</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How Kulthera Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Discover</h3>
            <p>Browse authentic African creative works across music, art, and stories.</p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Engage</h3>
            <p>Listen, view, or read. The more you engage, the more meaningful the support.</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Support</h3>
            <p>
              Web Monetization automatically streams micropayments to the creator's
              wallet in real-time.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Track</h3>
            <p>Creators see real-time analytics and earnings through their dashboard.</p>
          </div>
        </div>
      </section>

      {/* Web Monetization Explainer */}
      <section className="monetization-explainer">
        <div className="explainer-content">
          <div className="explainer-text">
            <h2>Web Monetization: Direct Artist Support</h2>
            <p>
              Traditional platforms take 30% commission. Kulthera uses Web Monetization—
              a W3C web standard that streams money directly from supporters to creators.
            </p>
            <p>
              No intermediaries. No commission. Pure support flowing to African artists.
            </p>

            <div className="features-list">
              <div className="feature-item">
                <Zap size={20} className="feature-icon" />
                <div>
                  <h4>Real-Time Payments</h4>
                  <p>Micropayments flow continuously while visitors engage</p>
                </div>
              </div>

              <div className="feature-item">
                <Zap size={20} className="feature-icon" />
                <div>
                  <h4>100% to Creators</h4>
                  <p>No commission, no middleman, all support reaches the artist</p>
                </div>
              </div>

              <div className="feature-item">
                <Zap size={20} className="feature-icon" />
                <div>
                  <h4>Low Bandwidth</h4>
                  <p>Designed for African networks with limited connectivity</p>
                </div>
              </div>
            </div>

            <Link to="/auth" className="btn-get-started">
              Get Started Today
            </Link>
          </div>

          <div className="explainer-visual">
            <div className="visual-flow">
              <div className="flow-item">
                <div className="flow-icon">👤</div>
                <p>Visitor</p>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-item">
                <div className="flow-icon">🏛️</div>
                <p>Kulthera</p>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-item">
                <div className="flow-icon">🎨</div>
                <p>Creator</p>
              </div>
            </div>
            <p className="flow-caption">Visitor support flows directly to creators</p>
          </div>
        </div>
      </section>

      {/* Featured Creator Highlight */}
      <section className="featured-creator">
        <h2>Featured: Sani "The Kokari Walker"</h2>
        <div className="featured-card">
          <div className="featured-content">
            <img
              src="https://images.unsplash.com/photo-1531384370597-859faa8ce332?auto=format&fit=crop&q=80&w=200"
              alt="The Kokari Walker"
              className="featured-image"
            />
            <div className="featured-text">
              <h3>Sani Kokari - Wandering Minstrel</h3>
              <p className="featured-origin">🇲🇱 Mali | Bambara Kora Master</p>
              <p>
                Sani traveled extensively across West Africa by foot, playing his Kora. His music captures the essence of his journey, documenting the diverse cultures and landscapes he encountered. On Kulthera, your attention directly supports his legacy.
              </p>

              <Link to="/music" className="btn-listen">
                Listen Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="final-cta">
        <h2>Ready to Support African Creators?</h2>
        <p>Join Kulthera and experience the future of cultural exchange.</p>
        <Link to="/music" className="btn-primary-large">
          Start Exploring
        </Link>
      </section>
    </div>
  );
};

export default HomePage;

/**
 * Header Component
 * 
 * Top navigation bar visible on all pages
 * Shows:
 * - Kulthera logo + home link
 * - Navigation menu (Rooms, Gallery, Explore)
 * - User menu (when logged in) or "Sign In" button (when logged out)
 * 
 * Responsive: On mobile, menu collapses into hamburger
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import '../styles/header.css';

export const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Check if a route is currently active
   * Used to highlight the current page in navigation
   */
  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo / Home link */}
        <Link to="/" className="logo">
          <span className="logo-emoji">🏛️</span>
          <span className="logo-text">Kulthera</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          <Link
            to="/music"
            className={`nav-link ${isActive('/music') ? 'active' : ''}`}
          >
            🎵 Music
          </Link>
          <Link
            to="/gallery"
            className={`nav-link ${isActive('/gallery') ? 'active' : ''}`}
          >
            🎨 Gallery
          </Link>
        </nav>

        {/* Right side: Mobile menu toggle */}
        <div className="header-actions">
          <button
            className="menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav className="nav-mobile">
          <Link
            to="/music"
            className={`nav-link-mobile ${isActive('/music') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            🎵 Music
          </Link>
          <Link
            to="/gallery"
            className={`nav-link-mobile ${isActive('/gallery') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            🎨 Gallery
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;

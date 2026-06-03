import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/header.css';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string): boolean => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-emoji">🏛️</span>
          <span className="logo-text">Kulthera</span>
        </Link>

        <nav className="nav-desktop">
          <Link to="/music" className={`nav-link ${isActive('/music') ? 'active' : ''}`}>
            🎵 Music
          </Link>
          <Link to="/gallery" className={`nav-link ${isActive('/gallery') ? 'active' : ''}`}>
            🎨 Gallery
          </Link>
          {isAuthenticated && user?.isCreator && (
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
              <LayoutDashboard size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Dashboard
            </Link>
          )}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <button type="button" className="nav-auth-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span className="nav-auth-label">Out</span>
            </button>
          ) : (
            <Link to="/auth" className="nav-auth-btn">
              <LogIn size={16} />
              <span className="nav-auth-label">Sign In</span>
            </Link>
          )}
          <button
            className="menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="nav-mobile">
          <Link to="/music" className={`nav-link-mobile ${isActive('/music') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
            🎵 Music
          </Link>
          <Link to="/gallery" className={`nav-link-mobile ${isActive('/gallery') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
            🎨 Gallery
          </Link>
          {isAuthenticated && user?.isCreator && (
            <Link to="/dashboard" className="nav-link-mobile" onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </Link>
          )}
          {!isAuthenticated ? (
            <Link to="/auth" className="nav-link-mobile" onClick={() => setMobileMenuOpen(false)}>
              Sign In
            </Link>
          ) : (
            <button type="button" className="nav-link-mobile" onClick={handleLogout}>
              Sign Out
            </button>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;

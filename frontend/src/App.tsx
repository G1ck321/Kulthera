import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import Header from './components/Header';

// Pages
import HomePage from './pages/HomePage';
import SoundRootsPage from './pages/SoundRootsPage';
import GalleryPage from './pages/GalleryPage';

// Styles
import './styles/globals.css';

/**
 * App Component - Root Router
 * 
 * Route Structure:
 * / → Home (entry point)
 * /music → Sound Roots (music gallery)
 * /gallery → Artwork gallery (paintings, artifacts, stories)
 */
const App: React.FC = () => {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header appears on all pages */}
        <Header />

        {/* Main content area - grows to fill space */}
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/music" element={<SoundRootsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />

            {/* Catch-all: redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import SoundRootsPage from './pages/SoundRootsPage';
import GalleryPage from './pages/GalleryPage';
import AuthPage from './pages/AuthPage';
import ArtistRoomPage from './pages/ArtistRoomPage';
import CreatorDashboardPage from './pages/CreatorDashboardPage';
import './styles/globals.css';
import PaymentTest from './pages/Payment';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/music" element={<SoundRootsPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/room/:creatorSlug" element={<ArtistRoomPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/paycheck" element={<PaymentTest />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireCreator>
                    <CreatorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

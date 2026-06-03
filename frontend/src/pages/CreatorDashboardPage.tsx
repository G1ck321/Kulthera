/**
 * Creator Dashboard Page
 * 
 * Shows creator-specific analytics:
 * - Total earnings & visitor count
 * - Per-exhibit performance
 * - Real-time activity
 * - Wallet address management
 * 
 * Protected route: Only authenticated creators can access
 */

import React, { useState, useEffect } from 'react';
import { fetchCreatorAnalytics, fetchCreatorProfile } from '../utils/apiService';
import { BarChart3, Users, DollarSign, Clock, MapPin, Mail } from 'lucide-react';
import '../styles/dashboard.css';

export const CreatorDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [analyticsData, profileData] = await Promise.all([
          fetchCreatorAnalytics(),
          fetchCreatorProfile(),
        ]);
        setAnalytics(analyticsData);
        setProfile(profileData);
      } catch (err) {
        setError('Could not load dashboard data. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-container loading">
        <div className="loading-spinner"></div>
        <p>Loading your analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container error">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Creator Analytics Dashboard</h1>
        <p>Track your exhibit performance and earnings</p>
      </div>

      {profile && (
        <div className="profile-card glass-panel">
          <img src={profile.avatarUrl} alt={profile.name} className="profile-avatar" />
          <div className="profile-info">
            <h2>{profile.name}</h2>
            <p className="profile-role">{profile.bio}</p>
            <div className="profile-details">
              <span>
                <MapPin size={14} /> {profile.country}
              </span>
              {profile.email && (
                <span>
                  <Mail size={14} /> {profile.email}
                </span>
              )}
            </div>
          </div>
          <div className="wallet-info">
            <p className="wallet-label">Wallet Address</p>
            <p className="wallet-address">{profile.walletAddress?.slice(0, 20)}...</p>
          </div>
        </div>
      )}

      {analytics && (
        <>
          {/* Summary Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <Users size={24} className="stat-icon" />
              <h3>Total Visitors</h3>
              <p className="stat-value">{analytics.totalVisitors}</p>
            </div>

            <div className="stat-card">
              <Clock size={24} className="stat-icon" />
              <h3>Total Watch Time</h3>
              <p className="stat-value">
                {Math.floor(analytics.totalViewTime / 3600)}h{' '}
                {Math.floor((analytics.totalViewTime % 3600) / 60)}m
              </p>
            </div>

            <div className="stat-card highlight">
              <DollarSign size={24} className="stat-icon" />
              <h3>Total Earnings</h3>
              <p className="stat-value">${analytics.totalEarnings.toFixed(2)}</p>
            </div>

            <div className="stat-card">
              <BarChart3 size={24} className="stat-icon" />
              <h3>Active Exhibits</h3>
              <p className="stat-value">{analytics.exhibitPerformance?.length || 0}</p>
            </div>
          </div>

          {/* Per-Exhibit Breakdown */}
          {analytics.exhibitPerformance && analytics.exhibitPerformance.length > 0 && (
            <div className="exhibits-section">
              <h2>Your Exhibits</h2>
              <div className="exhibits-table">
                <div className="table-header">
                  <div className="col-title">Exhibit</div>
                  <div className="col-stat">Visitors</div>
                  <div className="col-stat">Watch Time</div>
                </div>

                {analytics.exhibitPerformance.map((exhibit: any) => (
                  <div key={exhibit.exhibitId} className="table-row">
                    <div className="col-title">{exhibit.exhibitTitle}</div>
                    <div className="col-stat">{exhibit.viewCount}</div>
                    <div className="col-stat">
                      {Math.floor(exhibit.totalTime / 60)}m {exhibit.totalTime % 60}s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="info-cards">
            <div className="info-card">
              <h3>🌐 What's Next?</h3>
              <p>
                Advanced analytics coming soon: audience demographics, geographic reach,
                and engagement trends.
              </p>
            </div>

            <div className="info-card">
              <h3>💡 Monetization Tips</h3>
              <p>
                Share your Kulthera exhibit link on social media. Longer engagement = more
                support. Quality content attracts dedicated supporters.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreatorDashboardPage;

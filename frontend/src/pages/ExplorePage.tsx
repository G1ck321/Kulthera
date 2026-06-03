/**
 * Explore Page
 * Browse exhibits with advanced filtering by region, language, and tradition
 * Phase 2: Advanced exploration features with Web Monetization support
 * 
 * Features:
 * - Filter by African region/country
 * - Filter by language
 * - Filter by tradition/culture
 * - Full Web Monetization support with demo simulator
 */

import React, { useState, useEffect } from 'react';
import { fetchExhibits, Exhibit } from '../utils/apiService';
import { MonetizationStatus } from '../components/MonetizationStatus';
import { MapPin, Globe, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExplorePage: React.FC = () => {
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
  const [region, setRegion] = useState<string>('all');
  const [mediaType, setMediaType] = useState<string>('all');

  const regions = ['all', 'West Africa', 'East Africa', 'Central Africa', 'Southern Africa', 'North Africa'];
  const mediaTypes = ['all', 'audio', 'painting', 'artifact', 'story'];

  useEffect(() => {
    const loadExhibits = async () => {
      try {
        setIsLoading(true);
        const data = await fetchExhibits(1, 50, {
          mediaType: mediaType === 'all' ? undefined : mediaType,
        });
        setExhibits(data.exhibits);
      } catch (err) {
        console.error('Failed to load exhibits:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadExhibits();
  }, [mediaType]);

  const filteredExhibits = exhibits.filter((exhibit) => {
    if (region !== 'all' && exhibit.creator.country !== region) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="loading-spinner"></div>
        <p>Loading exhibits...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Show Web Monetization Status when exhibit is selected */}
      {selectedExhibit && selectedExhibit.creator.paymentPointer && (
        <MonetizationStatus
          creatorName={selectedExhibit.creator.name}
          paymentPointer={selectedExhibit.creator.paymentPointer}
        />
      )}

      <h1 style={{ fontSize: '36px', color: 'var(--text-light)', marginBottom: '16px' }}>
        Explore Exhibits
      </h1>
      <p style={{ color: 'rgba(245, 241, 232, 0.8)', marginBottom: '32px', fontSize: '16px' }}>
        Discover authentic African art, music, and artifacts from our curated collection.
      </p>

      {/* Filter Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <MapPin size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Region
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-light)',
              border: 'var(--border-light)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px'
            }}
          >
            {regions.map((r) => (
              <option key={r} value={r}>{r === 'all' ? 'All Regions' : r}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <Zap size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Media Type
          </label>
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-light)',
              border: 'var(--border-light)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px'
            }}
          >
            {mediaTypes.map((t) => (
              <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Exhibits Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
        {filteredExhibits.map((exhibit) => (
          <button
            key={exhibit.id}
            onClick={() => setSelectedExhibit(exhibit)}
            style={{
              background: selectedExhibit?.id === exhibit.id ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: selectedExhibit?.id === exhibit.id ? '1px solid rgba(212, 175, 55, 0.5)' : 'var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = selectedExhibit?.id === exhibit.id ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <img
              src={exhibit.previewUrl}
              alt={exhibit.title}
              style={{
                width: '100%',
                height: '160px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-md)',
                marginBottom: '12px'
              }}
            />
            <h3 style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '4px', fontWeight: 600 }}>
              {exhibit.title}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {exhibit.creator.name}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(212, 175, 55, 0.8)' }}>
              {exhibit.mediaType}
            </p>
          </button>
        ))}
      </div>

      {filteredExhibits.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <p>No exhibits found with these filters.</p>
          <Link to="/" style={{ color: 'var(--primary-gold)' }}>Return to home</Link>
        </div>
      )}
    </div>
  );
};


export default ExplorePage;

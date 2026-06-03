/**
 * Gallery Page
 * 
 * Showcases paintings and artwork exhibits in a responsive grid
 * 
 * Why a dedicated gallery?
 * - Visual art requires different UX than audio (no playback)
 * - Need expanded lightbox view for high-res artwork
 * - Filters by exhibit type (painting, artifact, story)
 * - Lower bandwidth than video, higher impact than text
 * 
 * Design pattern: Grid → Click to expand → Show creator info + monetization
 */

import React, { useState, useEffect } from 'react';
import { fetchExhibits, Exhibit } from '../utils/apiService';
import { MonetizationStatus } from '../components/MonetizationStatus';
import { X, MapPin, User } from 'lucide-react';
import '../styles/gallery.css';

export const GalleryPage: React.FC = () => {
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
  const [filter, setFilter] = useState<'all' | 'painting' | 'artifact' | 'story'>('all');

  /**
   * Load all visual exhibits (paintings, artifacts, stories)
   * Excludes audio exhibits (those go to Sound Roots)
   */
  useEffect(() => {
    const loadExhibits = async () => {
      try {
        setIsLoading(true);
        const data = await fetchExhibits(1, 50, {
          mediaType: filter === 'all' ? undefined : filter,
        });
        setExhibits(data.exhibits);
      } catch (err) {
        setError('Could not load gallery. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadExhibits();
  }, [filter]);

  /**
   * Filter exhibits by type
   * Shows all if filter is 'all', otherwise shows only selected type
   */
  const filteredExhibits = exhibits.filter(
    exhibit => filter === 'all' || exhibit.mediaType === filter
  );

  if (isLoading) {
    return (
      <div className="gallery-loading">
        <div className="loading-spinner"></div>
        <p>Loading gallery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      {/* Web Monetization Status - Show when exhibit is selected */}
      {selectedExhibit && selectedExhibit.creator.paymentPointer && (
        <MonetizationStatus
          creatorName={selectedExhibit.creator.name}
          paymentPointer={selectedExhibit.creator.paymentPointer}
        />
      )}
      {/* Header */}
      <div className="gallery-hero">
        <h1>African Artwork Gallery</h1>
        <p>
          Explore authentic African paintings, artifacts, and stories. Support artists
          and cultural custodians directly through your engagement.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="gallery-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({exhibits.length})
        </button>
        <button
          className={`filter-btn ${filter === 'painting' ? 'active' : ''}`}
          onClick={() => setFilter('painting')}
        >
          🎨 Paintings
        </button>
        <button
          className={`filter-btn ${filter === 'artifact' ? 'active' : ''}`}
          onClick={() => setFilter('artifact')}
        >
          🏛️ Artifacts
        </button>
        <button
          className={`filter-btn ${filter === 'story' ? 'active' : ''}`}
          onClick={() => setFilter('story')}
        >
          📖 Stories
        </button>
      </div>

      {/* Gallery grid */}
      <div className="gallery-grid">
        {filteredExhibits.map((exhibit) => (
          <div
            key={exhibit.id}
            className="gallery-card"
            onClick={() => setSelectedExhibit(exhibit)}
          >
            <div className="card-image-wrapper">
              <img
                src={exhibit.previewUrl}
                alt={exhibit.title}
                className="card-image"
              />
              <div className="card-overlay">
                <button className="card-action">
                  View
                </button>
              </div>
            </div>
            <div className="card-info">
              <h3 className="card-title">{exhibit.title}</h3>
              <p className="card-artist">{exhibit.creator.name}</p>
              <p className="card-type">{exhibit.mediaType}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedExhibit && (
        <div className="lightbox-overlay" onClick={() => setSelectedExhibit(null)}>
          <button
            className="lightbox-close"
            onClick={() => setSelectedExhibit(null)}
          >
            <X size={24} />
          </button>

          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="lightbox-image-wrapper">
              <img
                src={selectedExhibit.mediaUrl}
                alt={selectedExhibit.title}
                className="lightbox-image"
              />
            </div>

            {/* Info panel */}
            <div className="lightbox-info">
              {/* Title & Type */}
              <div>
                <h2 className="lightbox-title">{selectedExhibit.title}</h2>
                <div className="info-meta">
                  <span className="badge-type">{selectedExhibit.mediaType}</span>
                  {selectedExhibit.creator.country && (
                    <span className="badge-location">
                      <MapPin size={14} />
                      {selectedExhibit.creator.country}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="lightbox-description">
                {selectedExhibit.description}
              </p>

              {/* Cultural context */}
              {selectedExhibit.culturalContext && (
                <div className="cultural-context">
                  <h4>Cultural Context</h4>
                  <p>{selectedExhibit.culturalContext}</p>
                </div>
              )}

              {/* Creator info */}
              <div className="lightbox-creator">
                <img
                  src={selectedExhibit.creator.avatarUrl}
                  alt={selectedExhibit.creator.name}
                  className="creator-avatar"
                />
                <div className="creator-info">
                  <h4 className="creator-name">{selectedExhibit.creator.name}</h4>
                  <p className="creator-bio">{selectedExhibit.creator.bio}</p>
                  {selectedExhibit.creator.country && (
                    <p className="creator-country">
                      <MapPin size={14} />
                      {selectedExhibit.creator.country}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="lightbox-actions">
                <button className="btn-support">
                  💰 Support This Creator
                </button>
                <button
                  className="btn-close-secondary"
                  onClick={() => setSelectedExhibit(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;

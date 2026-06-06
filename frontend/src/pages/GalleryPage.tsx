/**
 * Gallery Page
 * * Showcases paintings and artwork exhibits in a responsive grid
 * Design pattern: Grid → Click to expand → Show creator info + monetization
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchExhibits, Exhibit } from '../utils/apiService';
import { MonetizationStatus } from '../components/MonetizationStatus';
import { ExhibitEntryModal } from '../components/ExhibitEntryModal';
import { TipCreatorButton } from '../components/TipCreatorButton';
import { WelcomeArtRoomModal } from '../components/onboarding/WelcomeArtRoomModal';
import { X, MapPin, DoorOpen } from 'lucide-react';
import '../styles/gallery.css';
import '../styles/onboarding.css';

export const GalleryPage: React.FC = () => {
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingExhibit, setPendingExhibit] = useState<Exhibit | null>(null);
  const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
  const [filter, setFilter] = useState<'all' | 'painting' | 'artifact' | 'story'>('all');
  const [showWelcome, setShowWelcome] = useState(false);

  const artistRooms = useMemo(() => {
    const byCreator = new Map<string, Exhibit[]>();
    exhibits
      .filter((e) => e.mediaType === 'painting')
      .forEach((e) => {
        const key = e.creator.name;
        if (!byCreator.has(key)) byCreator.set(key, []);
        byCreator.get(key)!.push(e);
      });
    return Array.from(byCreator.entries()).filter(([, list]) => list.length >= 2);
  }, [exhibits]);

  useEffect(() => {
    const styles = localStorage.getItem('preferredArtStyles');
    const welcomeSeen = localStorage.getItem('kultr_welcome_seen');
    if (styles && !welcomeSeen) {
      setShowWelcome(true);
    }
  }, []);

  /**
   * Load all visual exhibits (paintings, artifacts, stories)
   */
  useEffect(() => {
    const loadExhibits = async () => {
      try {
        setIsLoading(true);
        const data = await fetchExhibits(1, 50, {
          mediaType: filter === 'all' ? undefined : filter,
        });
        const visual = data.exhibits.filter((e) => e.mediaType !== 'audio');
        setExhibits(visual);
      } catch (err) {
        setError('Could not load gallery. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadExhibits();
  }, [filter]);

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

  const slugify = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <div className="gallery-container">
      <WelcomeArtRoomModal
        open={showWelcome}
        onEnter={() => {
          localStorage.setItem('kultr_welcome_seen', '1');
          setShowWelcome(false);
        }}
      />

      {pendingExhibit && !selectedExhibit && (
        <ExhibitEntryModal
          exhibit={pendingExhibit}
          onEnter={() => {
            setSelectedExhibit(pendingExhibit);
            setPendingExhibit(null);
          }}
          onCancel={() => setPendingExhibit(null)}
        />
      )}

      {selectedExhibit && selectedExhibit.creator.paymentPointer && (
        <MonetizationStatus
          creatorName={selectedExhibit.creator.name}
          paymentPointer={selectedExhibit.creator.paymentPointer}
          showTimer
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

      {artistRooms.length > 0 && (
        <section className="artist-rooms-strip">
          <h2>Artist Rooms</h2>
          <p>Step inside — each room holds multiple works in a carousel.</p>
          <div className="artist-rooms-list">
            {artistRooms.map(([name, list]) => (
              <Link
                key={name}
                to={`/room/${slugify(name)}`}
                className="artist-room-card"
              >
                <img src={list[0].previewUrl || list[0].mediaUrl} alt={name} />
                <span>{name}</span>
                <span className="room-count">{list.length} works</span>
                <DoorOpen size={16} />
              </Link>
            ))}
          </div>
        </section>
      )}

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

      <div className="gallery-grid gallery-grid-responsive">
        {filteredExhibits.length === 0 && !isLoading && (
          <p className="gallery-empty">No exhibits in this category. Try another filter or start the API.</p>
        )}
        {filteredExhibits.map((exhibit) => (
          <div
            key={exhibit.id}
            className="gallery-card"
            onClick={() => setPendingExhibit(exhibit)}
          >
            <div className="card-image-wrapper">
              <img
                src={exhibit.previewUrl || exhibit.mediaUrl}
                alt={exhibit.title}
                className="card-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/paint2.jpg';
                }}
              />
              <div className="card-overlay">
                <button className="card-action">View</button>
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
          <button className="lightbox-close" onClick={() => setSelectedExhibit(null)}>
            <X size={24} />
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {/* Image Wrapper */}
            <div className="lightbox-image-wrapper">
              <img
                src={selectedExhibit.mediaUrl || "assets/paint.jpg"}
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
                <TipCreatorButton creatorName={selectedExhibit.creator.name} />
                <Link
                  to={`/room/${slugify(selectedExhibit.creator.name)}`}
                  className="btn-support"
                  style={{ textDecoration: 'none', textAlign: 'center' }}
                >
                  Visit full room
                </Link>
                <button className="btn-close-secondary" onClick={() => setSelectedExhibit(null)}>
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
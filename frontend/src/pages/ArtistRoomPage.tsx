import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchExhibits, Exhibit } from '../utils/apiService';
import { ArtistRoomCarousel } from '../components/ArtistRoomCarousel';
import { ExhibitEntryModal } from '../components/ExhibitEntryModal';
import { MonetizationStatus } from '../components/MonetizationStatus';
import { TipCreatorButton } from '../components/TipCreatorButton';
import { MapPin, ArrowLeft } from 'lucide-react';
import '../styles/gallery.css';
import '../styles/onboarding.css';

export const ArtistRoomPage: React.FC = () => {
  const { creatorSlug } = useParams<{ creatorSlug: string }>();
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingExhibit, setPendingExhibit] = useState<Exhibit | null>(null);
  const [activeExhibit, setActiveExhibit] = useState<Exhibit | null>(null);
  const [totalTips, setTotalTips] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await fetchExhibits(1, 50, { mediaType: 'painting' });
        const slug = decodeURIComponent(creatorSlug || '');
        const roomExhibits = data.exhibits.filter(
          (e) => slugify(e.creator.name) === slug
        );
        setExhibits(roomExhibits);
        if (roomExhibits.length > 0) {
          setPendingExhibit(roomExhibits[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [creatorSlug]);

  const creator = exhibits[0]?.creator;

  if (isLoading) {
    return (
      <div className="gallery-loading">
        <div className="loading-spinner" />
        <p>Opening artist room...</p>
      </div>
    );
  }

  if (!creator || exhibits.length < 2) {
    return (
      <div className="gallery-error">
        <p>This artist room needs at least two works in the carousel. Try another creator from the gallery.</p>
        <Link to="/gallery" className="btn-primary">Back to Gallery</Link>
      </div>
    );
  }

  return (
    <div className="artist-room-page">
      {pendingExhibit && !activeExhibit && (
        <ExhibitEntryModal
          exhibit={pendingExhibit}
          onEnter={() => {
            setActiveExhibit(pendingExhibit);
            setPendingExhibit(null);
          }}
          onCancel={() => window.history.back()}
        />
      )}

      {activeExhibit && activeExhibit.creator.paymentPointer && (
        <MonetizationStatus
          creatorName={activeExhibit.creator.name}
          paymentPointer={activeExhibit.creator.paymentPointer}
          showTimer
        />
      )}

      <Link to="/gallery" className="artist-room-back">
        <ArrowLeft size={18} /> Gallery
      </Link>

      <header className="artist-room-header">
        <img src={creator.avatarUrl} alt={creator.name} className="artist-room-avatar" />
        <div>
          <h1>{creator.name}&apos;s Room</h1>
          <p>{creator.bio}</p>
          {creator.country && (
            <span className="badge-location">
              <MapPin size={14} /> {creator.country}
            </span>
          )}
        </div>
        <TipCreatorButton
          creatorName={creator.name}
          onTip={(usd) => setTotalTips((t) => t + usd)}
        />
      </header>

      {totalTips > 0 && (
        <p className="artist-room-tips">Demo tips this visit: ${totalTips.toFixed(2)} USD equivalent</p>
      )}

      <ArtistRoomCarousel
        exhibits={exhibits}
        onSelectExhibit={(ex) => {
          setPendingExhibit(ex);
          setActiveExhibit(null);
        }}
      />
    </div>
  );
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default ArtistRoomPage;

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Exhibit } from '../utils/apiService';

interface ArtistRoomCarouselProps {
  exhibits: Exhibit[];
  onSelectExhibit?: (exhibit: Exhibit) => void;
}

export const ArtistRoomCarousel: React.FC<ArtistRoomCarouselProps> = ({
  exhibits,
  onSelectExhibit,
}) => {
  const [index, setIndex] = useState(0);

  if (exhibits.length === 0) return null;

  const current = exhibits[index];
  const prev = () => setIndex((i) => (i === 0 ? exhibits.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === exhibits.length - 1 ? 0 : i + 1));

  return (
    <div className="artist-room-carousel">
      <div className="carousel-main">
        <button type="button" className="carousel-nav prev" onClick={prev} aria-label="Previous work">
          <ChevronLeft size={28} />
        </button>

        <div
          className="carousel-slide"
          onClick={() => onSelectExhibit?.(current)}
          role={onSelectExhibit ? 'button' : undefined}
        >
          <img src={current.mediaUrl || current.previewUrl} alt={current.title} />
          <div className="carousel-caption">
            <h3>{current.title}</h3>
            <p>{current.description}</p>
          </div>
        </div>

        <button type="button" className="carousel-nav next" onClick={next} aria-label="Next work">
          <ChevronRight size={28} />
        </button>
      </div>

      <div className="carousel-dots">
        {exhibits.map((ex, i) => (
          <button
            key={ex.id}
            type="button"
            className={`carousel-dot ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`View ${ex.title}`}
          />
        ))}
      </div>
      <p className="carousel-counter">
        {index + 1} of {exhibits.length} in this room
      </p>
    </div>
  );
};

export default ArtistRoomCarousel;

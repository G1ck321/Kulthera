import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/hero-carousel.css';

export interface HeroSlide {
  src: string;
  alt: string;
  caption?: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  intervalMs?: number;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides,
  intervalMs = 5000,
}) => {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i === 0 ? slides.length - 1 : i - 1));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(next, intervalMs);
    return () => clearInterval(t);
  }, [next, intervalMs, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="hero-carousel" aria-roledescription="carousel" aria-label="Featured exhibits">
      <div
        className="hero-carousel-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.src} className="hero-carousel-slide">
            <img src={slide.src} alt={slide.alt} loading="eager" />
            {slide.caption && <span className="hero-carousel-caption">{slide.caption}</span>}
          </div>
        ))}
      </div>

      <div className="hero-carousel-scrim" aria-hidden="true" />

      {slides.length > 1 && (
        <>
          <button type="button" className="hero-carousel-nav prev" onClick={prev} aria-label="Previous slide">
            <ChevronLeft size={28} />
          </button>
          <button type="button" className="hero-carousel-nav next" onClick={next} aria-label="Next slide">
            <ChevronRight size={28} />
          </button>
          <div className="hero-carousel-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={i === index ? 'active' : ''}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroCarousel;

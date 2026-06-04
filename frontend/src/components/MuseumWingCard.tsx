import React from 'react';
import { Link } from 'react-router-dom';

export interface MuseumWing {
  slug: string;
  name: string;
  tagline: string;
  exhibits: number;
  visitors: number;
  imageUrl: string;
  href: string;
}

export const MuseumWingCard: React.FC<{ wing: MuseumWing }> = ({ wing }) => {
  return (
    <Link to={wing.href} className="wing-portal">
      <img src={wing.imageUrl} alt="" className="wing-portal-bg" loading="lazy" />
      <div className="wing-portal-scrim" aria-hidden="true" />
      <div className="wing-portal-content">
        <h3 className="wing-portal-name">{wing.name}</h3>
        <p className="wing-portal-tagline">{wing.tagline}</p>
        <p className="wing-portal-meta">
          {wing.exhibits} exhibits · {wing.visitors} visitors now
        </p>
      </div>
    </Link>
  );
};

export default MuseumWingCard;

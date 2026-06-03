import React from 'react';
import { Exhibit } from '../utils/apiService';
import { MapPin, Clock } from 'lucide-react';

interface ExhibitEntryModalProps {
  exhibit: Exhibit;
  onEnter: () => void;
  onCancel: () => void;
}

export const ExhibitEntryModal: React.FC<ExhibitEntryModalProps> = ({
  exhibit,
  onEnter,
  onCancel,
}) => {
  return (
    <div className="onboarding-overlay exhibit-entry-overlay" role="dialog" aria-modal="true">
      <div className="onboarding-modal exhibit-entry-modal" onClick={(e) => e.stopPropagation()}>
        <span className="exhibit-entry-badge">Cultural Exhibit</span>
        <h2>{exhibit.title}</h2>
        <p className="exhibit-entry-artist">by {exhibit.creator.name}</p>

        {exhibit.culturalContext && (
          <div className="exhibit-entry-context">
            <h4>Before you enter</h4>
            <p>{exhibit.culturalContext}</p>
          </div>
        )}

        <div className="exhibit-entry-funding">
          <Clock size={16} />
          <p>
            Time you spend inside streams micropayment support to{' '}
            <strong>{exhibit.creator.name}</strong>. A live counter shows demo value accruing.
          </p>
        </div>

        {exhibit.creator.country && (
          <p className="exhibit-entry-meta">
            <MapPin size={14} /> {exhibit.creator.country}
          </p>
        )}

        <div className="exhibit-entry-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Go back
          </button>
          <button type="button" className="btn-primary" onClick={onEnter}>
            Enter Exhibit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExhibitEntryModal;

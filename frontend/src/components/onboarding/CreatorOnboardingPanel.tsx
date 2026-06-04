import React, { useState } from 'react';
import { ImagePlus, Music, Upload } from 'lucide-react';

const CREATOR_STYLES = [
  'Sahel fine art',
  'Textile & pattern',
  'Percussion & oral tradition',
  'Kora / griot music',
  'Bronze & artifact documentation',
  'Digital illustration',
  'Storytelling & essays',
];

interface CreatorOnboardingPanelProps {
  onComplete: (data: { style: string; uploads: { name: string; type: string }[] }) => void;
}

export const CreatorOnboardingPanel: React.FC<CreatorOnboardingPanelProps> = ({ onComplete }) => {
  const [style, setStyle] = useState('');
  const [customStyle, setCustomStyle] = useState('');
  const [uploads, setUploads] = useState<{ name: string; type: string }[]>([]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    const files = e.target.files;
    if (!files) return;
    const added = Array.from(files).map((f) => ({ name: f.name, type }));
    setUploads((prev) => [...prev, ...added].slice(0, 6));
    e.target.value = '';
  };

  const resolvedStyle = customStyle.trim() || style;

  return (
    <div className="creator-onboarding">
      <h3>What will your style be?</h3>
      <p className="onboarding-hint">This helps visitors find your room in the museum.</p>

      <div className="creator-style-list">
        {CREATOR_STYLES.map((s) => (
          <button
            key={s}
            type="button"
            style={{ color:'#141210'}}
            className={`art-style-chip ${style === s ? 'selected' : ''}`}
            onClick={() => setStyle(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <input
        type="text"
        className="creator-custom-style"
        placeholder="Or describe your own style..."
        value={customStyle}
        onChange={(e) => setCustomStyle(e.target.value)}
      />

      <h3 className="upload-section-title">Share your work</h3>
      <p className="onboarding-hint">Images and audio for your room (saved locally for MVP demo).</p>

      <div className="creator-upload-row">
        <label className="upload-btn">
          <ImagePlus size={18} />
          <span>Add images</span>
          <input type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e, 'image')} />
        </label>
        <label className="upload-btn">
          <Music size={18} />
          <span>Add audio</span>
          <input type="file" accept="audio/*" multiple hidden onChange={(e) => handleFiles(e, 'audio')} />
        </label>
      </div>

      {uploads.length > 0 && (
        <ul className="upload-preview-list">
          {uploads.map((u, i) => (
            <li key={`${u.name}-${i}`}>
              <Upload size={14} /> {u.name} <span className="upload-type">({u.type})</span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="heritage-btn-primary btn-wide"
        disabled={!resolvedStyle}
        onClick={() => onComplete({ style: resolvedStyle, uploads })}
      >
        Open Creator Dashboard
      </button>
    </div>
  );
};

export default CreatorOnboardingPanel;

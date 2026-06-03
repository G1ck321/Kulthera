import React from 'react';

export const ART_STYLES = [
  { id: 'sahel', label: 'Sahel & Desert Tones', emoji: '🏜️' },
  { id: 'adire', label: 'Adire & Textile Patterns', emoji: '🧵' },
  { id: 'sound', label: 'Sound Roots & Oral Traditions', emoji: '🎵' },
  { id: 'bronze', label: 'Bronze & Artifact Studies', emoji: '🏺' },
  { id: 'contemporary', label: 'Contemporary Urban', emoji: '🌆' },
  { id: 'story', label: 'Living Stories & Poetry', emoji: '📖' },
] as const;

interface ArtStylePickerProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

export const ArtStylePicker: React.FC<ArtStylePickerProps> = ({ selected, onChange }) => {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else if (selected.length < 4) {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="art-style-grid">
      <p className="onboarding-hint">Pick up to 4 — you can explore everything later.</p>
      <div className="art-style-options">
        {ART_STYLES.map((style) => (
          <button
            key={style.id}
            type="button"
            className={`art-style-chip ${selected.includes(style.id) ? 'selected' : ''}`}
            onClick={() => toggle(style.id)}
          >
            <span className="chip-emoji">{style.emoji}</span>
            <span>{style.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ArtStylePicker;

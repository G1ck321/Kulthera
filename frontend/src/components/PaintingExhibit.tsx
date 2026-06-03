import React, { useState } from 'react';
import { Shield } from 'lucide-react';

interface PaintingExhibitProps {
  lowResSrc: string;
  highResSrc: string;
  title: string;
  dimensions?: string;
  medium?: string;
}

/**
 * Visual Painting Exhibit container.
 * Features progressive two-stage blur-up loading for smooth, low-bandwidth transitions,
 * coupled with contextmenu suppression and a transparent overlay clickshield to block
 * drag-and-drop or right-click saves on creative masterworks.
 */
export const PaintingExhibit: React.FC<PaintingExhibitProps> = ({ 
  lowResSrc, 
  highResSrc, 
  title,
  dimensions = "Unknown dimensions",
  medium = "Digital Media"
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '780px',
        margin: '0 auto',
        borderRadius: '20px',
        overflow: 'hidden',
        background: '#040406',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'var(--glass-shadow)',
        userSelect: 'none'
      }}
      onContextMenu={(e) => e.preventDefault()} // Lock right-clicks globally on container
    >
      {/* 1. Shield Overlay (Clickjacking Block)
          Sits directly above the image elements. Intercepts all click, drag, and touch commands
          to protect underlying creative properties from scraper tools. */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          background: 'transparent',
          cursor: 'default'
        }}
      />

      {/* Media Canvas Area */}
      <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '360px' }}>
        
        {/* Stage A: Blurred low-bandwidth placeholder thumbnail */}
        <img 
          src={lowResSrc} 
          alt={`${title} - Low resolution loading thumbnail`} 
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '600px',
            objectFit: 'contain',
            filter: 'blur(20px)',
            transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: isLoaded ? 0 : 1,
            position: isLoaded ? 'absolute' : 'relative',
            zIndex: 1
          }} 
        />

        {/* Stage B: High-fidelity fine art assets */}
        <img 
          src={highResSrc} 
          alt={`${title} - Full exhibition presentation`} 
          onLoad={() => setIsLoaded(true)}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '600px',
            objectFit: 'contain',
            pointerEvents: 'none', // Disallow dragging image
            userSelect: 'none',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: isLoaded ? 1 : 0,
            zIndex: 2
          }}
        />
      </div>

      {/* Frame Captions Detail footer */}
      <div 
        style={{
          padding: '16px 20px',
          background: 'rgba(14, 14, 20, 0.9)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 15,
          position: 'relative'
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f8fafc' }}>{title}</h4>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            {medium} • {dimensions}
          </p>
        </div>

        {/* Dynamic secure watermark display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
          <Shield size={12} style={{ color: '#a855f7' }} />
          <span>Protected Frame</span>
        </div>
      </div>
    </div>
  );
};
export default PaintingExhibit;

import React, { useState, useRef } from 'react';
import { RotateCw, ShieldCheck } from 'lucide-react';

interface Artifact3DExhibitProps {
  frameArray: string[]; // Sequential image URLs for structural rotation perspective
  title: string;
  culturalOrigin?: string;
}

/**
 * 3D Artifact Rotational Visualizer.
 * Provides a lightweight, high-performance, mobile-responsive rotation simulation.
 * Translates drag/swipe telemetry into frame increments to mimic 3D depth,
 * bypassing high-bandwidth polygon rendering engines.
 */
export const Artifact3DExhibit: React.FC<Artifact3DExhibitProps> = ({ 
  frameArray, 
  title,
  culturalOrigin = "African Origin"
}) => {
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const isDragging = useRef<boolean>(false);
  const startX = useRef<number>(0);

  // 1. Interactive Drag Telemetry Handler
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !frameArray || frameArray.length <= 1) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startX.current;
    
    // Drag threshold to change frame
    const THRESHOLD = 12; 
    
    if (Math.abs(deltaX) > THRESHOLD) {
      const step = deltaX > 0 ? -1 : 1; // Direct standard drag direction rotation
      setCurrentFrame((prev) => (prev + step + frameArray.length) % frameArray.length);
      startX.current = clientX; // Reset capture anchor to guarantee smooth ongoing swipes
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div 
      style={{
        width: '100%',
        maxWidth: '680px',
        margin: '0 auto',
        borderRadius: '20px',
        background: '#040406',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '20px',
        boxShadow: 'var(--glass-shadow)',
        userSelect: 'none'
      }}
      onContextMenu={(e) => e.preventDefault()} // Secure copyright blocking
    >
      {/* Structural Rotation Canvas Area */}
      <div 
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        style={{
          position: 'relative',
          width: '100%',
          height: '380px',
          background: 'radial-gradient(circle, rgba(30,30,45,0.4) 0%, rgba(5,5,8,1) 100%)',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'grab',
          border: '1px solid rgba(255,255,255,0.03)'
        }}
      >
        {/* Anti-Scraping Overlay: Invisible DIV protecting asset click bindings */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            background: 'transparent'
          }}
        />

        {/* Display Current Frame */}
        {frameArray && frameArray.length > 0 ? (
          <img 
            src={frameArray[currentFrame]} 
            alt={`${title} structural perspective frame ${currentFrame + 1}`} 
            style={{
              maxHeight: '340px',
              maxWidth: '90%',
              objectFit: 'contain',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 5,
              transition: 'transform 0.1s ease-out'
            }}
          />
        ) : (
          <div style={{ color: '#64748b', fontSize: '13px', fontFamily: 'monospace' }}>
            No perspective models loaded.
          </div>
        )}

        {/* Interactive Helper Icon and Frame indicators */}
        <div 
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(9, 9, 14, 0.7)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#94a3b8',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            zIndex: 15
          }}
        >
          <RotateCw size={10} className="animate-spin-slow" style={{ animation: 'spin 8s linear infinite' }} />
          <span>Frame {currentFrame + 1}/{frameArray.length || 1} • Swipe / Drag to Rotate</span>
        </div>
      </div>

      {/* Detail Footer */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          padding: '4px'
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>{title}</h4>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>{culturalOrigin}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.08)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.15)' }}>
          <ShieldCheck size={12} />
          <span>Authenticated Archive</span>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
export default Artifact3DExhibit;

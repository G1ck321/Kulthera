import React from 'react';

interface DemoStatusBadgeProps {
  exhibitCount?: number;
}

export const DemoStatusBadge: React.FC<DemoStatusBadgeProps> = ({ exhibitCount }) => {
  return (
    <div className="demo-status-badge" role="status" aria-live="polite">
      <span className="demo-status-dot" aria-hidden="true" />
      <span>Testnet demo active</span>
      {exhibitCount != null && (
        <span style={{ opacity: 0.75 }}>· {exhibitCount} exhibits</span>
      )}
    </div>
  );
};

export default DemoStatusBadge;

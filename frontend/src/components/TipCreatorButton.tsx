import React, { useState } from 'react';
import { Heart } from 'lucide-react';

const TIP_AMOUNTS = [
  { label: '₦500', usd: 0.35 },
  { label: '₵5', usd: 0.42 },
  { label: '$1', usd: 1.0 },
];

interface TipCreatorButtonProps {
  creatorName: string;
  onTip?: (amountUsd: number) => void;
}

export const TipCreatorButton: React.FC<TipCreatorButtonProps> = ({ creatorName, onTip }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [lastTip, setLastTip] = useState<string | null>(null);

  const sendTip = (label: string, usd: number) => {
    onTip?.(usd);
    setLastTip(label);
    setShowPicker(false);
    setTimeout(() => setLastTip(null), 4000);
  };

  return (
    <div className="tip-creator-wrap">
      {lastTip ? (
        <span className="tip-thanks">Thank you — {lastTip} demo tip sent to {creatorName}</span>
      ) : (
        <>
          <button
            type="button"
            className="btn-tip"
            onClick={() => setShowPicker(!showPicker)}
          >
            <Heart size={16} />
            Tip Creator
          </button>
          {showPicker && (
            <div className="tip-picker">
              {TIP_AMOUNTS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => sendTip(t.label, t.usd)}
                >
                  {t.label}
                </button>
              ))}
              <p className="tip-demo-note">Demo tips — no real charge</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TipCreatorButton;

import { useEffect, useState } from 'react';

export default function PaymentTest() {
  const [status, setStatus] = useState('Ready');

  useEffect(() => {
    // 1. Immediately scan the active URL parameters on mount
    const urlParams = new URLSearchParams(window.location.search);
    const interactRef = urlParams.get('interact_ref');
    const result = urlParams.get('result');

    // 2. If we find an interactive reference string, fire the finalization script instantly
    if (interactRef) {
      setStatus('🔄 Step 2: Wallet Approved! Unlocking background terminal loop...');
      console.log("Captured interact_ref from URL redirect:", interactRef);
      
      fetch('http://localhost:4000/finalize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interactRef })
      })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.json();
      })
      .then(() => {
        setStatus('🎉 Success! Look at your backend terminal console for confirmation metrics!');
      })
      .catch(err => {
        setStatus(`❌ Transmission failed: ${err.message}`);
      });
    } else if (result === 'invalid_interaction') {
      setStatus('❌ Interaction session rejected by the wallet provider.');
    }
  }, []);

  const handleStartPayment = async () => {
    setStatus('⏳ Requesting interactive consent channel link...');
    try {
      const response = await fetch('http://localhost:4000/create-grant', { method: 'POST' });
      const data = await response.json();
      
      if (data.redirectUrl) {
        setStatus('↪️ Redirecting you to your wallet provider...');
        window.location.href = data.redirectUrl; 
      } else {
        setStatus(`❌ Failed: ${data.error || 'No redirect URL returned'}`);
      }
    } catch (err: any) {
      setStatus(`❌ Connection Error to bridge port 4000: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Open Payments Production Bridge Test</h1>
      <button 
        onClick={handleStartPayment} 
        style={{ padding: '12px 24px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#75381e', color: '#fff', border: 'none', borderRadius: '5px' }}
      >
        💸 Connect Wallet & Authorize Payment
      </button>
      <div style={{ marginTop: '20px', fontWeight: 'bold', fontSize: '16px' }}>
        Status: {status}
      </div>
    </div>
  );
}

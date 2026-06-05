import { useEffect, useState } from 'react';

export default function PaymentTest() {
  const [status, setStatus] = useState('Ready');

  useEffect(() => {
    // Automatically catch the redirect parameters inside native Vite lifecycle hook
    const urlParams = new URLSearchParams(window.location.search);
    const interactRef = urlParams.get('interact_ref');
    const result = urlParams.get('result');

    // If the hash is present but "result" is missing, we check for the hash parameter explicitly
    if (interactRef) {
      setStatus('🔄 Step 2: Wallet Approved! Sending reference to terminal bridge...');
      
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
        setStatus('🎉 Success! Reference code sent. Look at your backend terminal window!');
      })
      .catch(err => {
        setStatus(`❌ Transmission failed: ${err.message}`);
      });
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
      setStatus(`❌ Connection Error to port 4000: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Open Payments Startup Portal</h1>
      <button 
        onClick={handleStartPayment} 
        style={{ padding: '12px 24px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px' }}
      >
        💸 Connect Wallet & Authorize Payment
      </button>
      <div style={{ marginTop: '20px', fontWeight: 'bold', fontSize: '16px' }}>
        Status: {status}
      </div>
    </div>
  );
}

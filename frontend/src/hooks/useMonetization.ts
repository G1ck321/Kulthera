import { useEffect, useState } from 'react';

export type MonetizationState = 'idle' | 'pending' | 'streaming' | 'paused';

interface UseMonetizationResult {
  state: MonetizationState;
  isStreaming: boolean;
  amountSent: number;
  currency: string;
}

/**
 * Custom hook to manage Interledger Web Monetization DOM Link injection and W3C event handling.
 * Automatically swaps payment pointer targets dynamically as visitor switches exhibits.
 * 
 * @param paymentPointer The Interledger Wallet payment pointer ($ilp.example/username)
 * @param creatorName Name of the active exhibit's creator (for contextual logging)
 */
export function useMonetization(paymentPointer?: string, creatorName?: string): UseMonetizationResult {
  const [state, setState] = useState<MonetizationState>('idle');
  const [amountSent, setAmountSent] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('USD');

  useEffect(() => {
    if (!paymentPointer) {
      setState('idle');
      return;
    }

    setState('pending');

    // 1. Locate or programmatically inject <link rel="monetization"> into document head
    let link = document.querySelector('link[rel="monetization"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'monetization';
      document.head.appendChild(link);
    }

    // 2. Programmatically swap the pointer target to route streams directly to this creator
    link.href = paymentPointer;
    console.log(`[WebMonetization] Injected pointer [${paymentPointer}] for creator [${creatorName || 'Unknown'}]`);

    // 3. Setup event listeners according to the W3C Web Monetization specification
    const handleStart = () => {
      setState('streaming');
      console.log(`[WebMonetization] Flow active to ${creatorName}`);
    };

    const handleProgress = (event: any) => {
      setState('streaming');
      if (event.detail && event.detail.amount) {
        const value = parseFloat(event.detail.amount);
        setAmountSent((prev) => prev + value);
        if (event.detail.assetCode) {
          setCurrency(event.detail.assetCode);
        }
      }
    };

    const handleStop = () => {
      setState('paused');
      console.log(`[WebMonetization] Flow stopped to ${creatorName}`);
    };

    // Attach listeners to the injected link element
    link.addEventListener('monetizationstart', handleStart);
    link.addEventListener('monetizationprogress', handleProgress);
    link.addEventListener('monetizationstop', handleStop);

    // 4. Cleanup function on route transition/component unmount
    return () => {
      if (link) {
        link.removeEventListener('monetizationstart', handleStart);
        link.removeEventListener('monetizationprogress', handleProgress);
        link.removeEventListener('monetizationstop', handleStop);
        
        // Remove href target to safely close payment pipes before setting a new pointer
        link.removeAttribute('href');
      }
      setAmountSent(0);
      setState('idle');
    };
  }, [paymentPointer, creatorName]);

  return {
    state,
    isStreaming: state === 'streaming',
    amountSent,
    currency
  };
}

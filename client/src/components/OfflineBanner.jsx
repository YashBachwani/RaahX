import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsSyncing(true);
      
      // Simulate sync delay
      setTimeout(() => {
        setIsSyncing(false);
        setJustSynced(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => setJustSynced(false), 3000);
      }, 1500);
    };
    
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) setIsOffline(true);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && !isSyncing && !justSynced) return null;

  return (
    <div className={clsx(
      'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 rounded-lg shadow-lg border px-4 py-3 flex items-center space-x-3 transition-all duration-300 font-inter text-sm w-max max-w-[90vw]',
      {
        'bg-white text-raahx-navy border-raahx-border': isOffline,
        'bg-amber-50 text-amber-800 border-amber-200': isSyncing,
        'bg-green-50 text-green-800 border-green-200': justSynced
      }
    )}>
      {isOffline && (
        <>
          <WifiOff size={18} className="text-raahx-gray" />
          <span>You are offline. Changes will sync automatically when connection returns.</span>
        </>
      )}
      
      {isSyncing && (
        <>
          <RefreshCw size={18} className="animate-spin text-amber-600" />
          <span>Syncing offline changes...</span>
        </>
      )}

      {justSynced && (
        <>
          <CheckCircle2 size={18} className="text-green-600" />
          <span>All changes synced successfully.</span>
        </>
      )}
    </div>
  );
};

export default OfflineBanner;

import { useEffect, useState } from 'react';

type NetworkStatus = {
  isOnline: boolean;
  changedAt: number;
};

function getInitialOnlineState(): boolean {
  if (typeof navigator === 'undefined') {
    return true;
  }

  return navigator.onLine;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(getInitialOnlineState);
  const [changedAt, setChangedAt] = useState<number>(() => Date.now());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setChangedAt(Date.now());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setChangedAt(Date.now());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    changedAt,
  };
}

'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export function useBackendStatus() {
  const [status, setStatus] = useState({
    current: '',
    primary: '',
    fallback: '',
    health: { primary: false, fallback: false }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const backendStatus = apiClient.getBackendStatus();
        const health = await apiClient.checkBackendHealth();
        
        setStatus({
          ...backendStatus,
          health
        });
      } catch (error) {
        console.error('Failed to check backend status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { status, isLoading };
}
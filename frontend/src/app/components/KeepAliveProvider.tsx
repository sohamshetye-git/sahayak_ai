'use client';

import { useEffect } from 'react';
import { keepAliveService } from '../../lib/services/keep-alive.service';

/**
 * Keep-Alive Provider Component
 * Automatically starts/stops the keep-alive service based on page visibility
 */
export default function KeepAliveProvider() {
  useEffect(() => {
    // Start the service when component mounts
    keepAliveService.start();

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        keepAliveService.stop();
      } else {
        keepAliveService.start();
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      keepAliveService.stop();
    };
  }, []);

  // This component doesn't render anything
  return null;
}
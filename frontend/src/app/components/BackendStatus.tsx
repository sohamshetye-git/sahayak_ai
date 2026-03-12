'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export default function BackendStatus() {
  const [status, setStatus] = useState<{
    current: string;
    primary: string;
    fallback: string;
    health?: { primary: boolean; fallback: boolean };
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Get initial status
    const initialStatus = apiClient.getBackendStatus();
    setStatus(initialStatus);

    // Check health of both backends
    apiClient.checkBackendHealth().then(health => {
      setStatus(prev => prev ? { ...prev, health } : null);
    });
  }, []);

  if (!status) return null;

  const getCurrentBackendName = () => {
    if (status.current === status.primary) return 'Vercel';
    if (status.current === status.fallback) return 'Render';
    return 'Unknown';
  };

  const getHealthIcon = (isHealthy?: boolean) => {
    if (isHealthy === undefined) return '⏳';
    return isHealthy ? '✅' : '❌';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full shadow-lg text-sm font-medium transition-colors"
        title="Backend Status"
      >
        🔗 {getCurrentBackendName()}
      </button>

      {/* Status Panel */}
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-[300px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Backend Status</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current:</span>
              <span className="font-medium text-blue-600">
                {getCurrentBackendName()}
              </span>
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Vercel:</span>
                <span className="flex items-center gap-1">
                  {getHealthIcon(status.health?.primary)}
                  <span className="text-xs text-gray-500">Primary</span>
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Render:</span>
                <span className="flex items-center gap-1">
                  {getHealthIcon(status.health?.fallback)}
                  <span className="text-xs text-gray-500">Fallback</span>
                </span>
              </div>
            </div>
            
            <div className="border-t pt-2 text-xs text-gray-500">
              <p>Automatic failover enabled</p>
              <p>Primary: Vercel (faster)</p>
              <p>Fallback: Render (reliable)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
/**
 * Service Centers Data Hook
 * React hook for accessing service centers from JSON
 */

import { useState, useEffect } from 'react';
import { serviceCentersDataService, ServiceCenter } from '../services/service-centers-data.service';

export function useServiceCentersData() {
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await serviceCentersDataService.loadCenters();
      const allCenters = serviceCentersDataService.getAllCenters();
      setCenters(allCenters);
    } catch (err) {
      console.error('Error loading service centers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load service centers');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    centers,
    isLoading,
    error,
    refetch: loadCenters,
  };
}

export function useCenterDetails(centerId: string) {
  const [center, setCenter] = useState<ServiceCenter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCenter();
  }, [centerId]);

  const loadCenter = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await serviceCentersDataService.loadCenters();
      const foundCenter = serviceCentersDataService.getCenterById(centerId);
      setCenter(foundCenter || null);
      if (!foundCenter) {
        setError('Center not found');
      }
    } catch (err) {
      console.error('Error loading center:', err);
      setError(err instanceof Error ? err.message : 'Failed to load center');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    center,
    isLoading,
    error,
  };
}

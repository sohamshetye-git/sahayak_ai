/**
 * Service Centers Hook
 * React hook for finding service centers
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../api-client';

export interface ServiceCenter {
  id: string;
  name: string;
  nameHi?: string;
  district: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  contactPhone?: string;
  contactEmail?: string;
  operatingHours?: string;
  servicesOffered?: string[];
  distance?: number;
}

export interface ServiceCentersResponse {
  serviceCenters: ServiceCenter[];
  total: number;
}

export interface ServiceCenterFilters {
  district?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  language?: string;
}

export function useServiceCenters(initialFilters: ServiceCenterFilters = {}) {
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ServiceCenterFilters>(initialFilters);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchServiceCenters = useCallback(async (newFilters?: ServiceCenterFilters) => {
    setIsLoading(true);
    setError(null);

    const currentFilters = { ...filters, ...newFilters };
    const params = new URLSearchParams();

    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    try {
      const response = await apiClient.get<ServiceCentersResponse>(
        `/api/service-centers?${params.toString()}`
      );

      setServiceCenters(response.serviceCenters);
      setTotal(response.total);
      setFilters(currentFilters);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch service centers';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: ServiceCenterFilters) => {
    fetchServiceCenters(newFilters);
  }, [fetchServiceCenters]);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        fetchServiceCenters({
          latitude: location.lat,
          longitude: location.lng,
          radius: 50, // 50km radius
        });
      },
      (err) => {
        setError('Unable to get your location: ' + err.message);
        setIsLoading(false);
      }
    );
  }, [fetchServiceCenters]);

  // Initial fetch
  useEffect(() => {
    fetchServiceCenters();
  }, []);

  return {
    serviceCenters,
    total,
    isLoading,
    error,
    filters,
    userLocation,
    updateFilters,
    getUserLocation,
    refetch: fetchServiceCenters,
  };
}

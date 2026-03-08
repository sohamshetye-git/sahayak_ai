/**
 * Schemes Data Hook
 * React hook for accessing schemes from JSON dataset
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { schemesDataService, SchemeData } from '../services/schemes-data.service';

export function useSchemesData() {
  const [schemes, setSchemes] = useState<SchemeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    try {
      setIsLoading(true);
      await schemesDataService.loadSchemes();
      setSchemes(schemesDataService.getAllSchemes());
      setError(null);
    } catch (err) {
      setError('Failed to load schemes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSchemeById = useCallback((schemeId: string) => {
    return schemesDataService.getSchemeById(schemeId);
  }, []);

  const filterSchemes = useCallback((filters: {
    category?: string;
    state?: string;
    beneficiary?: string;
    search?: string;
  }) => {
    return schemesDataService.filterSchemes(filters);
  }, []);

  const searchSchemes = useCallback((query: string) => {
    return schemesDataService.searchSchemes(query);
  }, []);

  const getFeaturedSchemes = useCallback(() => {
    return schemesDataService.getFeaturedSchemes();
  }, []);

  const getPopularSchemes = useCallback((limit?: number) => {
    return schemesDataService.getPopularSchemes(limit);
  }, []);

  return {
    schemes,
    isLoading,
    error,
    getSchemeById,
    filterSchemes,
    searchSchemes,
    getFeaturedSchemes,
    getPopularSchemes,
    reload: loadSchemes,
  };
}

export function useSchemeDetails(schemeId: string) {
  const [scheme, setScheme] = useState<SchemeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadScheme = async () => {
      try {
        setIsLoading(true);
        await schemesDataService.loadSchemes();
        const schemeData = schemesDataService.getSchemeById(schemeId);
        
        if (schemeData) {
          setScheme(schemeData);
          setError(null);
        } else {
          setError('Scheme not found');
        }
      } catch (err) {
        setError('Failed to load scheme');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadScheme();
  }, [schemeId]);

  return {
    scheme,
    isLoading,
    error,
    reload: () => {
      setIsLoading(true);
      schemesDataService.loadSchemes().then(() => {
        const schemeData = schemesDataService.getSchemeById(schemeId);
        if (schemeData) {
          setScheme(schemeData);
          setError(null);
        } else {
          setError('Scheme not found');
        }
        setIsLoading(false);
      });
    },
  };
}

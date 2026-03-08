/**
 * Schemes Hook
 * React hook for browsing and searching schemes
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../api-client';

export interface Scheme {
  schemeId: string;
  name: string;
  nameHi?: string;
  description: string;
  descriptionHi?: string;
  category: string;
  state?: string;
  eligibility: any;
  benefit: {
    amount?: number;
    type: string;
  };
  applicationUrl?: string;
}

export interface SchemesResponse {
  schemes: Scheme[];
  total: number;
  page: number;
  limit: number;
}

export interface SchemeFilters {
  category?: string;
  state?: string;
  beneficiary?: string;
  search?: string;
  page?: number;
  limit?: number;
  language?: string;
}

export function useSchemes(initialFilters: SchemeFilters = {}) {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialFilters.page || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SchemeFilters>(initialFilters);

  const fetchSchemes = useCallback(async (newFilters?: SchemeFilters) => {
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
      const response = await apiClient.get<SchemesResponse>(
        `/api/schemes?${params.toString()}`
      );

      setSchemes(response.schemes);
      setTotal(response.total);
      setPage(response.page);
      setFilters(currentFilters);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch schemes';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: SchemeFilters) => {
    fetchSchemes({ ...filters, ...newFilters, page: 1 });
  }, [filters, fetchSchemes]);

  const nextPage = useCallback(() => {
    fetchSchemes({ page: page + 1 });
  }, [page, fetchSchemes]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      fetchSchemes({ page: page - 1 });
    }
  }, [page, fetchSchemes]);

  // Initial fetch
  useEffect(() => {
    fetchSchemes();
  }, []);

  return {
    schemes,
    total,
    page,
    isLoading,
    error,
    filters,
    updateFilters,
    nextPage,
    prevPage,
    refetch: fetchSchemes,
  };
}

export function useSchemeDetails(schemeId: string, language: string = 'en') {
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScheme = useCallback(async () => {
    if (!schemeId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<Scheme>(
        `/api/schemes/${schemeId}?language=${language}`
      );
      setScheme(response);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch scheme details';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [schemeId, language]);

  useEffect(() => {
    fetchScheme();
  }, [fetchScheme]);

  return {
    scheme,
    isLoading,
    error,
    refetch: fetchScheme,
  };
}

/**
 * Eligibility Hook
 * React hook for checking scheme eligibility
 */

'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '../api-client';
import { Scheme } from './use-schemes';

export interface EligibilityResult {
  eligibleSchemes: Array<Scheme & { relevanceScore: number }>;
  totalEligible: number;
}

export function useEligibility() {
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = useCallback(async (
    userProfile: any,
    language: string = 'en'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<EligibilityResult>(
        '/api/check-eligibility',
        { userProfile, language }
      );

      setResult(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to check eligibility';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    result,
    isLoading,
    error,
    checkEligibility,
  };
}

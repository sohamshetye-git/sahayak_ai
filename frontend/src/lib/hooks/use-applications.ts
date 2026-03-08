/**
 * Applications Hook
 * React hook for managing user applications
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../api-client';

export interface Application {
  applicationId: string;
  userId: string;
  schemeId: string;
  schemeName: string;
  status: 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  progress: number;
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  submittedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface ApplicationsResponse {
  applications: Application[];
  total: number;
}

export function useApplications(userId: string, status?: Application['status']) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ userId });
    if (status) {
      params.append('status', status);
    }

    try {
      const response = await apiClient.get<ApplicationsResponse>(
        `/api/applications?${params.toString()}`
      );

      setApplications(response.applications);
      setTotal(response.total);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch applications';
      setError(errorMessage);
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, status]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    total,
    isLoading,
    error,
    refetch: fetchApplications,
  };
}

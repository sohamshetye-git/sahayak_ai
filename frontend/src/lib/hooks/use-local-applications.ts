/**
 * Local Applications Hook
 * Manages applications stored in localStorage
 */

import { useState, useEffect } from 'react';

export type ApplicationStatus = 
  | 'intent_to_apply' 
  | 'submitted_self_reported' 
  | 'under_review' 
  | 'approved' 
  | 'rejected';

export type ApplicationMode = 'online' | 'offline';

export interface LocalApplication {
  application_id: string;
  user_id: string;
  scheme_id: string;
  application_mode: ApplicationMode;
  status: ApplicationStatus;
  progress: number;
  current_stage: string;
  submission_mode?: string;
  submitted_at?: string;
  submission_date?: string;
  reference_id?: string;
  created_at: string;
  updated_at?: string;
}

export function useLocalApplications() {
  const [applications, setApplications] = useState<LocalApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = () => {
    try {
      const keys = Object.keys(localStorage);
      const appKeys = keys.filter(key => key.startsWith('application_'));
      const apps: LocalApplication[] = [];
      
      appKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          apps.push(JSON.parse(data));
        }
      });
      
      // Sort by created_at descending
      apps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = (
    applicationId: string, 
    status: ApplicationStatus,
    additionalData?: Partial<LocalApplication>
  ) => {
    const app = applications.find(a => a.application_id === applicationId);
    if (!app) return;

    let progress = app.progress;
    let current_stage = app.current_stage;

    // Update progress based on status
    if (status === 'under_review') {
      progress = 75;
      current_stage = 'under_review';
    } else if (status === 'approved') {
      progress = 100;
      current_stage = 'approved';
    } else if (status === 'rejected') {
      progress = 100;
      current_stage = 'rejected';
    }

    const updated: LocalApplication = {
      ...app,
      status,
      progress,
      current_stage,
      updated_at: new Date().toISOString(),
      ...additionalData,
    };

    localStorage.setItem(`application_${app.scheme_id}`, JSON.stringify(updated));
    loadApplications();
  };

  const deleteApplication = (applicationId: string) => {
    const app = applications.find(a => a.application_id === applicationId);
    if (app) {
      localStorage.removeItem(`application_${app.scheme_id}`);
      loadApplications();
    }
  };

  return {
    applications,
    isLoading,
    updateApplicationStatus,
    deleteApplication,
    refetch: loadApplications,
  };
}

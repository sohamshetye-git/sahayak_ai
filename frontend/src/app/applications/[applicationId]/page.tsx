/**
 * Application Workflow Detail Page
 * Displays detailed workflow for a single application with step-by-step progress
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/lib/context/language-context';
import { translations } from '@/lib/i18n/translations';
import { apiClient } from '@/lib/api-client';
import { Application } from '@/lib/hooks/use-applications';
import { Home } from 'lucide-react';

interface WorkflowStep {
  stepNumber: number;
  stepName: string;
  stepNameHi?: string;
  description: string;
  descriptionHi?: string;
  requiredDocuments: string[];
  estimatedTimeDays: number;
}

export default function ApplicationWorkflowPage() {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();
  const t = translations[language];
  const applicationId = params.applicationId as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fetchApplicationAndWorkflow = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch application details
      const appResponse = await apiClient.get<{ application: Application }>(
        `/api/applications/${applicationId}`
      );
      setApplication(appResponse.application);

      // Fetch workflow for the scheme
      const workflowResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/schemes/${appResponse.application.schemeId}/workflow?language=${language}`
      );
      
      if (workflowResponse.ok) {
        const workflowData = await workflowResponse.json();
        setWorkflow(workflowData.workflow || []);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load application details';
      setError(errorMessage);
      console.error('Error fetching application:', err);
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, language]);

  useEffect(() => {
    fetchApplicationAndWorkflow();
  }, [fetchApplicationAndWorkflow]);

  const handleSaveProgress = async () => {
    if (!application) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await apiClient.put(`/api/applications/${applicationId}`, {
        status: application.status,
        currentStep: application.currentStep,
        completedSteps: application.completedSteps,
        updatedAt: Date.now(),
      });

      setSaveMessage(
        language === 'en' 
          ? 'Progress saved successfully!' 
          : 'प्रगति सफलतापूर्वक सहेजी गई!'
      );

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: unknown) {
      setSaveMessage(
        language === 'en' 
          ? 'Failed to save progress' 
          : 'प्रगति सहेजने में विफल'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStep = (stepNumber: number) => {
    if (!application) return;

    const stepStr = String(stepNumber);
    const isCompleted = application.completedSteps.includes(stepStr);

    let newCompletedSteps: string[];
    if (isCompleted) {
      // Remove step from completed
      newCompletedSteps = application.completedSteps.filter(s => s !== stepStr);
    } else {
      // Add step to completed
      newCompletedSteps = [...application.completedSteps, stepStr];
    }

    // Calculate new progress
    const newProgress = Math.round((newCompletedSteps.length / application.totalSteps) * 100);

    // Update current step to the next incomplete step
    let newCurrentStep = application.currentStep;
    if (!isCompleted && stepNumber === application.currentStep) {
      newCurrentStep = Math.min(stepNumber + 1, application.totalSteps);
    }

    setApplication({
      ...application,
      completedSteps: newCompletedSteps,
      progress: newProgress,
      currentStep: newCurrentStep,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.error}</h2>
          <p className="text-gray-600 mb-4">{error || 'Application not found'}</p>
          <button
            onClick={() => router.push('/applications')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {language === 'en' ? 'Back to Applications' : 'आवेदनों पर वापस जाएं'}
          </button>
        </div>
      </div>
    );
  }

  const statusColors: Record<Application['status'], string> = {
    draft: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    submitted: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<'en' | 'hi', Record<Application['status'], string>> = {
    en: {
      draft: 'Draft',
      in_progress: 'In Progress',
      submitted: 'Submitted',
      approved: 'Approved',
      rejected: 'Rejected',
    },
    hi: {
      draft: 'ड्राफ्ट',
      in_progress: 'प्रगति में',
      submitted: 'जमा किया गया',
      approved: 'स्वीकृत',
      rejected: 'अस्वीकृत',
    },
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 70%, #f0fdf4 100%)' }}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-2"
            >
              <Home size={20} />
              {language === 'hi' ? 'होम' : 'Home'}
            </button>
            <span className="text-gray-400">•</span>
            <button
              onClick={() => router.push('/applications')}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-2"
            >
              ← {language === 'en' ? 'Back to Applications' : 'आवेदनों पर वापस'}
            </button>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {application.schemeName}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <span>
                  {language === 'en' ? 'Application ID:' : 'आवेदन आईडी:'} {application.applicationId.slice(0, 8)}
                </span>
                <span className="text-gray-400">•</span>
                <span>
                  {language === 'en' ? 'Updated' : 'अपडेट किया गया'}: {formatDate(application.updatedAt)}
                </span>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                statusColors[application.status]
              }`}
            >
              {statusLabels[language][application.status]}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'en' ? 'Application Progress' : 'आवेदन प्रगति'}
            </h2>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {application.progress}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-4 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${application.progress}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-600 font-medium">
            {language === 'en'
              ? `${application.completedSteps.length} of ${application.totalSteps} steps completed`
              : `${application.totalSteps} में से ${application.completedSteps.length} चरण पूर्ण`}
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {language === 'en' ? 'Application Steps' : 'आवेदन चरण'}
          </h2>

          {workflow.length > 0 ? (
            <div className="space-y-6">
              {workflow.map((step, index) => {
                const isCompleted = application.completedSteps.includes(String(step.stepNumber));
                const isCurrent = step.stepNumber === application.currentStep;
                const canToggle = application.status === 'draft' || application.status === 'in_progress';

                return (
                  <div key={step.stepNumber} className="relative">
                    {/* Connector Line */}
                    {index < workflow.length - 1 && (
                      <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-transparent"></div>
                    )}

                    <div className="flex gap-4">
                      {/* Step Number/Checkbox */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => canToggle && handleToggleStep(step.stepNumber)}
                          disabled={!canToggle}
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all shadow-sm ${
                            isCompleted
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-200'
                              : isCurrent
                              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-200'
                              : 'bg-gray-200 text-gray-600'
                          } ${canToggle ? 'cursor-pointer hover:scale-110 hover:shadow-md' : 'cursor-not-allowed'}`}
                        >
                          {isCompleted ? '✓' : step.stepNumber}
                        </button>
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {language === 'hi' && step.stepNameHi ? step.stepNameHi : step.stepName}
                          </h3>
                          {isCurrent && !isCompleted && (
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                              {language === 'en' ? 'Current' : 'वर्तमान'}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {language === 'hi' && step.descriptionHi ? step.descriptionHi : step.description}
                        </p>

                        {/* Required Documents */}
                        {step.requiredDocuments && step.requiredDocuments.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                              {language === 'en' ? 'Required Documents:' : 'आवश्यक दस्तावेज़:'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {step.requiredDocuments.map((doc, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1 font-medium"
                                >
                                  📄 {doc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Estimated Time */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <span>⏱️</span>
                          <span>
                            {language === 'en' ? 'Estimated time:' : 'अनुमानित समय:'}{' '}
                            {step.estimatedTimeDays}{' '}
                            {language === 'en' 
                              ? step.estimatedTimeDays === 1 ? 'day' : 'days'
                              : 'दिन'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {language === 'en' 
                ? 'No workflow steps available for this scheme' 
                : 'इस योजना के लिए कोई वर्कफ़्लो चरण उपलब्ध नहीं है'}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {(application.status === 'draft' || application.status === 'in_progress') && (
              <>
                <button
                  onClick={handleSaveProgress}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {isSaving 
                    ? (language === 'en' ? 'Saving...' : 'सहेजा जा रहा है...')
                    : (language === 'en' ? 'Save Progress' : 'प्रगति सहेजें')}
                </button>
                
                {application.progress === 100 && (
                  <button
                    onClick={() => {
                      // In a real app, this would submit the application
                      alert(language === 'en' 
                        ? 'Application submission functionality would be implemented here' 
                        : 'आवेदन जमा करने की कार्यक्षमता यहां लागू की जाएगी');
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-sm hover:shadow-md"
                  >
                    {language === 'en' ? 'Submit Application' : 'आवेदन जमा करें'}
                  </button>
                )}
              </>
            )}
            
            <button
              onClick={() => router.push(`/schemes/${application.schemeId}`)}
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold"
            >
              {language === 'en' ? 'View Scheme Details' : 'योजना विवरण देखें'}
            </button>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`mt-4 p-4 rounded-xl text-center font-medium ${
              saveMessage.includes('success') || saveMessage.includes('सफलतापूर्वक')
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-200'
                : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border border-red-200'
            }`}>
              {saveMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

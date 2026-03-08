'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '../../../../lib/context/language-context';
import { useSchemeDetails } from '../../../../lib/hooks/use-schemes-data';
import { Check, ExternalLink, MapPin, Calendar, AlertCircle, FileText, Building2 } from 'lucide-react';

type ApplicationMode = 'online' | 'offline';
type ApplicationStatus = 'intent_to_apply' | 'submitted_self_reported' | 'under_review' | 'approved' | 'rejected';

interface ApplicationData {
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
}

export default function ApplicationWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();
  const schemeId = params.schemeId as string;
  
  const { scheme, isLoading, error } = useSchemeDetails(schemeId);
  const [applicationMode, setApplicationMode] = useState<ApplicationMode | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submissionDate, setSubmissionDate] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);

  useEffect(() => {
    // Check if application already exists
    const existingApp = localStorage.getItem(`application_${schemeId}`);
    if (existingApp) {
      setApplicationData(JSON.parse(existingApp));
    } else {
      // Create new application record
      const newApp: ApplicationData = {
        application_id: `APP_${Date.now()}`,
        user_id: 'USER_001', // In real app, get from auth
        scheme_id: schemeId,
        application_mode: scheme?.application_mode === 'Online' ? 'online' : scheme?.application_mode === 'Offline' ? 'offline' : 'online',
        status: 'intent_to_apply',
        progress: 10,
        current_stage: 'documents_ready',
        created_at: new Date().toISOString(),
      };
      setApplicationData(newApp);
      localStorage.setItem(`application_${schemeId}`, JSON.stringify(newApp));
    }
  }, [schemeId, scheme]);

  const handleModeSelect = (mode: ApplicationMode) => {
    setApplicationMode(mode);
    if (applicationData) {
      const updated = { ...applicationData, application_mode: mode };
      setApplicationData(updated);
      localStorage.setItem(`application_${schemeId}`, JSON.stringify(updated));
    }
  };

  const handleSubmissionConfirm = () => {
    if (!applicationData) return;
    
    const updated: ApplicationData = {
      ...applicationData,
      status: 'submitted_self_reported',
      progress: 50,
      current_stage: 'submitted',
      submission_mode: applicationMode === 'online' ? 'online_portal' : 'offline_center',
      submitted_at: new Date().toISOString(),
      submission_date: submissionDate,
      reference_id: referenceId || undefined,
    };
    
    setApplicationData(updated);
    localStorage.setItem(`application_${schemeId}`, JSON.stringify(updated));
    
    // Redirect to applications list
    setTimeout(() => {
      router.push('/applications');
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 70%, #f0fdf4 100%)' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 70%, #f0fdf4 100%)' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-xl text-gray-800 mb-4">Error loading scheme</p>
            <button
              onClick={() => router.push('/schemes')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold"
            >
              Back to Schemes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const schemeName = language === 'hi' && scheme.scheme_name_hi ? scheme.scheme_name_hi : scheme.scheme_name;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 70%, #f0fdf4 100%)' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button 
            onClick={() => router.push(`/schemes/${schemeId}`)} 
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-2"
          >
            ← {language === 'hi' ? 'योजना विवरण पर वापस जाएं' : 'Back to Scheme Details'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Application Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-start justify-between gap-6">
            <div className="flex gap-4 flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                {scheme.category === 'Education' && '🎓'}
                {scheme.category === 'Health' && '🏥'}
                {scheme.category === 'Agriculture' && '🌾'}
                {scheme.category === 'Housing' && '🏠'}
                {scheme.category === 'Employment' && '💼'}
                {scheme.category === 'Social Welfare' && '🤝'}
                {scheme.category === 'Financial Assistance' && '💰'}
                {!['Education', 'Health', 'Agriculture', 'Housing', 'Employment', 'Social Welfare', 'Financial Assistance'].includes(scheme.category) && '📋'}
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{schemeName}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FileText size={16} />
                    {language === 'hi' ? 'आवेदन आईडी' : 'Application ID'}: {applicationData?.application_id}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    applicationData?.status === 'intent_to_apply' ? 'bg-blue-100 text-blue-700' :
                    applicationData?.status === 'submitted_self_reported' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {applicationData?.status === 'intent_to_apply' && (language === 'hi' ? 'आवेदन करने का इरादा' : 'Intent to Apply')}
                    {applicationData?.status === 'submitted_self_reported' && (language === 'hi' ? 'सबमिट किया गया' : 'Submitted')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            {language === 'hi' ? 'आवेदन प्रगति' : 'Application Progress'}
          </h2>
          
          <div className="relative">
            <div className="flex items-center justify-between">
              {/* Stage 1 */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  applicationData && applicationData.progress >= 10 ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <Check size={20} className="text-white" />
                </div>
                <p className="text-xs text-center mt-2 font-medium">
                  {language === 'hi' ? 'दस्तावेज़ तैयार' : 'Documents Ready'}
                </p>
              </div>

              {/* Connector */}
              <div className={`flex-1 h-1 ${applicationData && applicationData.progress >= 50 ? 'bg-green-500' : 'bg-gray-300'}`}></div>

              {/* Stage 2 */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  applicationData && applicationData.progress >= 50 ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {applicationData && applicationData.progress >= 50 ? <Check size={20} className="text-white" /> : <span className="text-white text-sm">2</span>}
                </div>
                <p className="text-xs text-center mt-2 font-medium">
                  {language === 'hi' ? 'आवेदन सबमिट' : 'Application Submitted'}
                </p>
              </div>

              {/* Connector */}
              <div className={`flex-1 h-1 ${applicationData && applicationData.progress >= 75 ? 'bg-green-500' : 'bg-gray-300'}`}></div>

              {/* Stage 3 */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  applicationData && applicationData.progress >= 75 ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {applicationData && applicationData.progress >= 75 ? <Check size={20} className="text-white" /> : <span className="text-white text-sm">3</span>}
                </div>
                <p className="text-xs text-center mt-2 font-medium">
                  {language === 'hi' ? 'समीक्षाधीन' : 'Under Review'}
                </p>
              </div>

              {/* Connector */}
              <div className={`flex-1 h-1 ${applicationData && applicationData.progress >= 100 ? 'bg-green-500' : 'bg-gray-300'}`}></div>

              {/* Stage 4 */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  applicationData && applicationData.progress >= 100 ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {applicationData && applicationData.progress >= 100 ? <Check size={20} className="text-white" /> : <span className="text-white text-sm">4</span>}
                </div>
                <p className="text-xs text-center mt-2 font-medium">
                  {language === 'hi' ? 'स्वीकृत/अस्वीकृत' : 'Approved/Rejected'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Mode Selection or Confirmation */}
        {applicationData?.status === 'intent_to_apply' && !showConfirmation && (
          <div className="space-y-6">
            {/* Choose Application Method */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {language === 'hi' ? 'आवेदन विधि चुनें' : 'Choose Application Method'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Online Application */}
                {(scheme.application_mode === 'Online' || scheme.application_mode === 'Both') && (
                  <div 
                    onClick={() => handleModeSelect('online')}
                    className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                      applicationMode === 'online' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl mb-4">
                      💻
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {language === 'hi' ? 'ऑनलाइन आवेदन करें' : 'Apply Online'}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {language === 'hi' 
                        ? 'आधिकारिक पोर्टल पर जाएं और ऑनलाइन आवेदन करें।' 
                        : 'Visit the official portal and apply online.'}
                    </p>
                    
                    {applicationMode === 'online' && (
                      <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <Check size={20} />
                        {language === 'hi' ? 'चयनित' : 'Selected'}
                      </div>
                    )}
                  </div>
                )}

                {/* Offline Application */}
                {(scheme.application_mode === 'Offline' || scheme.application_mode === 'Both') && (
                  <div 
                    onClick={() => handleModeSelect('offline')}
                    className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                      applicationMode === 'offline' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-400'
                    }`}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-4">
                      🏢
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {language === 'hi' ? 'निकटतम केंद्र पर जाएं' : 'Visit Nearest Center'}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {language === 'hi' 
                        ? 'अपने नजदीकी सेवा केंद्र पर जाएं और व्यक्तिगत रूप से आवेदन करें।' 
                        : 'Visit your nearest service center and apply in person.'}
                    </p>
                    
                    {applicationMode === 'offline' && (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <Check size={20} />
                        {language === 'hi' ? 'चयनित' : 'Selected'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Online Instructions */}
            {applicationMode === 'online' && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {language === 'hi' ? 'ऑनलाइन आवेदन चरण' : 'Online Application Steps'}
                </h2>
                
                <div className="space-y-4 mb-6">
                  {scheme.application_steps_online?.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 pt-1">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 text-sm mb-1">
                        {language === 'hi' ? 'महत्वपूर्ण' : 'Important'}
                      </p>
                      <p className="text-amber-800 text-sm">
                        {language === 'hi' 
                          ? 'आवेदन पूरा करने के बाद, इस पेज पर वापस आएं और अपनी सबमिशन की पुष्टि करें।' 
                          : 'After completing the application, return to this page and confirm your submission.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <a
                    href={scheme.online_apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold"
                  >
                    {language === 'hi' ? 'आधिकारिक पोर्टल पर जाएं' : 'Go to Official Portal'}
                    <ExternalLink size={18} />
                  </a>
                  
                  <button
                    onClick={() => setShowConfirmation(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold"
                  >
                    {language === 'hi' ? 'मैंने आवेदन कर दिया' : 'I Have Applied'}
                  </button>
                </div>
              </div>
            )}

            {/* Offline Instructions */}
            {applicationMode === 'offline' && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {language === 'hi' ? 'ऑफलाइन आवेदन चरण' : 'Offline Application Steps'}
                </h2>
                
                <div className="space-y-4 mb-6">
                  {scheme.application_steps_offline?.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 pt-1">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Service Centers */}
                {scheme.submission_locations && scheme.submission_locations.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 text-sm mb-3 flex items-center gap-2">
                      <Building2 size={18} />
                      {language === 'hi' ? 'सबमिशन स्थान' : 'Submission Locations'}
                    </h3>
                    <div className="space-y-2">
                      {scheme.submission_locations.map((loc, index) => (
                        <div key={index} className="text-sm text-blue-800">
                          <span className="font-medium">{loc.office_type}</span> - {loc.department_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 text-sm mb-1">
                        {language === 'hi' ? 'महत्वपूर्ण' : 'Important'}
                      </p>
                      <p className="text-amber-800 text-sm">
                        {language === 'hi' 
                          ? 'केंद्र पर आवेदन जमा करने के बाद, इस पेज पर वापस आएं और अपनी सबमिशन की पुष्टि करें।' 
                          : 'After submitting the application at the center, return to this page and confirm your submission.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => router.push('/service-centers')}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold"
                  >
                    <MapPin size={18} />
                    {language === 'hi' ? 'निकटतम केंद्र खोजें' : 'Find Nearest Center'}
                  </button>
                  
                  <button
                    onClick={() => setShowConfirmation(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold"
                  >
                    {language === 'hi' ? 'मैंने जमा कर दिया' : 'I Have Submitted'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submission Confirmation Dialog */}
        {showConfirmation && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {language === 'hi' ? 'सबमिशन की पुष्टि करें' : 'Confirm Submission'}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'hi' ? 'सबमिशन तिथि' : 'Submission Date'}
                </label>
                <input
                  type="date"
                  value={submissionDate}
                  onChange={(e) => setSubmissionDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'hi' ? 'संदर्भ/पावती संख्या (वैकल्पिक)' : 'Reference/Acknowledgement Number (Optional)'}
                </label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder={language === 'hi' ? 'यदि उपलब्ध हो तो दर्ज करें' : 'Enter if available'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              
              <button
                onClick={handleSubmissionConfirm}
                disabled={!submissionDate}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  submissionDate
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {language === 'hi' ? 'पुष्टि करें' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {applicationData?.status === 'submitted_self_reported' && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900 mb-2">
                  {language === 'hi' ? 'आवेदन सफलतापूर्वक सबमिट किया गया!' : 'Application Successfully Submitted!'}
                </h3>
                <p className="text-sm text-green-800 mb-4">
                  {language === 'hi' 
                    ? 'आपका आवेदन रिकॉर्ड कर लिया गया है। आप इसे "मेरे आवेदन" में ट्रैक कर सकते हैं।' 
                    : 'Your application has been recorded. You can track it in "My Applications".'}
                </p>
                <button
                  onClick={() => router.push('/applications')}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold"
                >
                  {language === 'hi' ? 'मेरे आवेदन देखें' : 'View My Applications'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

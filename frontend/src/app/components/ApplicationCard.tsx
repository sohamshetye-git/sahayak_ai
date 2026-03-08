'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LocalApplication, ApplicationStatus } from '@/lib/hooks/use-local-applications';
import { useSchemeDetails } from '@/lib/hooks/use-schemes-data';
import { Check, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ApplicationCardProps {
  application: LocalApplication;
  language: 'en' | 'hi';
  onStatusUpdate: (applicationId: string, status: ApplicationStatus) => void;
}

export function ApplicationCard({ application, language, onStatusUpdate }: ApplicationCardProps) {
  const router = useRouter();
  const { scheme, isLoading } = useSchemeDetails(application.scheme_id);
  const [showDetails, setShowDetails] = useState(false);

  if (isLoading || !scheme) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const schemeName = language === 'hi' && scheme.scheme_name_hi ? scheme.scheme_name_hi : scheme.scheme_name;

  const getStatusBadge = () => {
    switch (application.status) {
      case 'intent_to_apply':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            {language === 'hi' ? 'आवेदन करने का इरादा' : 'Intent to Apply'}
          </span>
        );
      case 'submitted_self_reported':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            {language === 'hi' ? 'सबमिट किया गया' : 'Submitted'}
          </span>
        );
      case 'under_review':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
            {language === 'hi' ? 'समीक्षाधीन' : 'Under Review'}
          </span>
        );
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
            <Check size={14} />
            {language === 'hi' ? 'स्वीकृत' : 'Approved'}
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            {language === 'hi' ? 'अस्वीकृत' : 'Rejected'}
          </span>
        );
    }
  };

  const getModeBadge = () => {
    if (application.application_mode === 'online') {
      return (
        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium">
          💻 {language === 'hi' ? 'ऑनलाइन' : 'Online'}
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-green-50 text-green-600 rounded-md text-xs font-medium">
          🏢 {language === 'hi' ? 'ऑफलाइन' : 'Offline'}
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          {/* Scheme Icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
            {scheme.category === 'Education' && '🎓'}
            {scheme.category === 'Health' && '🏥'}
            {scheme.category === 'Agriculture' && '🌾'}
            {scheme.category === 'Housing' && '🏠'}
            {scheme.category === 'Employment' && '💼'}
            {scheme.category === 'Social Welfare' && '🤝'}
            {scheme.category === 'Financial Assistance' && '💰'}
            {!['Education', 'Health', 'Agriculture', 'Housing', 'Employment', 'Social Welfare', 'Financial Assistance'].includes(scheme.category) && '📋'}
          </div>

          {/* Scheme Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{schemeName}</h3>
              {getStatusBadge()}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                {scheme.category}
              </span>
              {getModeBadge()}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{language === 'hi' ? 'आवेदन आईडी' : 'App ID'}: {application.application_id.slice(-8)}</span>
              <span>{language === 'hi' ? 'आवेदन किया' : 'Applied'}: {new Date(application.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold text-gray-700">
              {language === 'hi' ? 'प्रगति' : 'Progress'}
            </span>
            <span className="font-bold text-blue-600">{application.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${application.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Stage Timeline */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex flex-col items-center flex-1 ${application.progress >= 10 ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              application.progress >= 10 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {application.progress >= 10 ? <Check size={16} /> : '1'}
            </div>
            <span className="text-xs mt-1 text-center">{language === 'hi' ? 'तैयार' : 'Ready'}</span>
          </div>

          <div className={`flex-1 h-1 ${application.progress >= 50 ? 'bg-green-500' : 'bg-gray-300'}`}></div>

          <div className={`flex flex-col items-center flex-1 ${application.progress >= 50 ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              application.progress >= 50 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {application.progress >= 50 ? <Check size={16} /> : '2'}
            </div>
            <span className="text-xs mt-1 text-center">{language === 'hi' ? 'सबमिट' : 'Submit'}</span>
          </div>

          <div className={`flex-1 h-1 ${application.progress >= 75 ? 'bg-green-500' : 'bg-gray-300'}`}></div>

          <div className={`flex flex-col items-center flex-1 ${application.progress >= 75 ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              application.progress >= 75 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {application.progress >= 75 ? <Check size={16} /> : '3'}
            </div>
            <span className="text-xs mt-1 text-center">{language === 'hi' ? 'समीक्षा' : 'Review'}</span>
          </div>

          <div className={`flex-1 h-1 ${application.progress >= 100 ? 'bg-green-500' : 'bg-gray-300'}`}></div>

          <div className={`flex flex-col items-center flex-1 ${application.progress >= 100 ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              application.progress >= 100 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {application.progress >= 100 ? <Check size={16} /> : '4'}
            </div>
            <span className="text-xs mt-1 text-center">{language === 'hi' ? 'पूर्ण' : 'Done'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {application.status === 'intent_to_apply' && (
            <button
              onClick={() => router.push(`/applications/apply/${application.scheme_id}`)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-sm"
            >
              {language === 'hi' ? 'आवेदन जारी रखें' : 'Resume Application'}
            </button>
          )}

          <button
            onClick={() => router.push(`/schemes/${application.scheme_id}`)}
            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold text-sm"
          >
            {language === 'hi' ? 'योजना देखें' : 'View Scheme'}
          </button>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold text-sm"
          >
            {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div className="border-t border-gray-100 p-6 bg-gray-50">
          <div className="space-y-4">
            {/* Submission Details */}
            {application.submitted_at && (
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">
                  {language === 'hi' ? 'सबमिशन विवरण' : 'Submission Details'}
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{language === 'hi' ? 'सबमिशन तिथि' : 'Submission Date'}: {application.submission_date || new Date(application.submitted_at).toLocaleDateString()}</p>
                  {application.reference_id && (
                    <p>{language === 'hi' ? 'संदर्भ संख्या' : 'Reference ID'}: {application.reference_id}</p>
                  )}
                  <p>{language === 'hi' ? 'सबमिशन मोड' : 'Submission Mode'}: {application.submission_mode === 'online_portal' ? (language === 'hi' ? 'ऑनलाइन पोर्टल' : 'Online Portal') : (language === 'hi' ? 'ऑफलाइन केंद्र' : 'Offline Center')}</p>
                </div>
              </div>
            )}

            {/* Status Update */}
            {application.status === 'submitted_self_reported' && (
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">
                  {language === 'hi' ? 'स्थिति अपडेट करें' : 'Update Status'}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => onStatusUpdate(application.application_id, 'under_review')}
                    className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                  >
                    <Clock size={14} className="inline mr-1" />
                    {language === 'hi' ? 'समीक्षाधीन' : 'Under Review'}
                  </button>
                  <button
                    onClick={() => onStatusUpdate(application.application_id, 'approved')}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    <Check size={14} className="inline mr-1" />
                    {language === 'hi' ? 'स्वीकृत' : 'Approved'}
                  </button>
                  <button
                    onClick={() => onStatusUpdate(application.application_id, 'rejected')}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    <AlertCircle size={14} className="inline mr-1" />
                    {language === 'hi' ? 'अस्वीकृत' : 'Rejected'}
                  </button>
                </div>
              </div>
            )}

            {application.status === 'under_review' && (
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">
                  {language === 'hi' ? 'अंतिम स्थिति अपडेट करें' : 'Update Final Status'}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => onStatusUpdate(application.application_id, 'approved')}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    <Check size={14} className="inline mr-1" />
                    {language === 'hi' ? 'स्वीकृत' : 'Approved'}
                  </button>
                  <button
                    onClick={() => onStatusUpdate(application.application_id, 'rejected')}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    <AlertCircle size={14} className="inline mr-1" />
                    {language === 'hi' ? 'अस्वीकृत' : 'Rejected'}
                  </button>
                </div>
              </div>
            )}

            {/* Guidance */}
            {application.status === 'intent_to_apply' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <AlertCircle size={14} className="inline mr-1" />
                  {language === 'hi' 
                    ? 'अपना आवेदन पूरा करने के लिए "आवेदन जारी रखें" पर क्लिक करें।' 
                    : 'Click "Resume Application" to complete your application.'}
                </p>
              </div>
            )}

            {application.status === 'submitted_self_reported' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <Check size={14} className="inline mr-1" />
                  {language === 'hi' 
                    ? 'आपका आवेदन सबमिट हो गया है। कुछ दिनों बाद स्थिति जांचें।' 
                    : 'Your application has been submitted. Check status after a few days.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

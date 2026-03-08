'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useLanguage } from '../../../lib/context/language-context';
import { useSchemeDetails as useSchemeDetailsData } from '../../../lib/hooks/use-schemes-data';
import { Check, FileText, ExternalLink, MapPin, Calendar, AlertCircle, ArrowLeft, MessageCircle } from 'lucide-react';

interface Document {
  name: string;
  required: boolean;
  helperText: string;
  sampleLink?: string;
  checked: boolean;
}

type TabType = 'overview' | 'documents' | 'apply';

export default function SchemeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();
  const schemeId = params.schemeId as string;
  
  // Check if coming from chat
  const fromChat = searchParams.get('from') === 'chat';
  const chatSessionId = searchParams.get('sessionId');
  
  console.log('[SchemeDetailsPage] Loading scheme:', schemeId);
  const { scheme, isLoading, error } = useSchemeDetailsData(schemeId);
  console.log('[SchemeDetailsPage] Scheme data:', { scheme: scheme?.scheme_id, isLoading, error });
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [documents, setDocuments] = useState<Document[]>([]);

  // Handle back to chat
  const handleBackToChat = () => {
    // Preserve chat session by navigating back
    if (chatSessionId) {
      router.push(`/chat?sessionId=${chatSessionId}`);
    } else {
      router.push('/chat');
    }
  };

  // Check for tab query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab');
      if (tabParam === 'documents' || tabParam === 'apply') {
        setActiveTab(tabParam as TabType);
      }
    }
  }, []);

  useEffect(() => {
    if (scheme) {
      const docList: Document[] = (scheme.REQUIRED_DOCUMENTS || []).map(doc => {
        // Handle both old string format and new object format
        if (typeof doc === 'string') {
          return {
            name: doc,
            required: true,
            helperText: language === 'hi' ? 'कृपया मूल दस्तावेज़ की स्कैन की गई प्रति अपलोड करें' : 'Please upload scanned copy of original document',
            checked: false
          };
        } else {
          return {
            name: doc.document_name,
            required: doc.required_or_optional?.toLowerCase() === 'required',
            helperText: doc.description || (language === 'hi' ? 'कृपया मूल दस्तावेज़ की स्कैन की गई प्रति अपलोड करें' : 'Please upload scanned copy of original document'),
            checked: false
          };
        }
      });
      setDocuments(docList);
    }
  }, [scheme, language]);

  const toggleDocument = (index: number) => {
    setDocuments(prev => prev.map((doc, i) => 
      i === index ? { ...doc, checked: !doc.checked } : doc
    ));
  };

  const checkedCount = documents.filter(d => d.checked).length;
  const totalDocs = documents.length;
  const progressPercent = totalDocs > 0 ? Math.round((checkedCount / totalDocs) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 70%, #f0fdf4 100%)' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl text-gray-600">{t('loading')}</p>
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
            <p className="text-xl text-gray-800 mb-4">{t('error')}</p>
            <p className="text-gray-600 mb-6">{error || 'Scheme not found'}</p>
            <button
              onClick={() => router.push('/schemes')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold"
            >
              {language === 'hi' ? 'योजनाओं पर वापस जाएं' : 'Back to Schemes'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const schemeName = language === 'hi' && scheme.scheme_name_hi ? scheme.scheme_name_hi : scheme.scheme_name;
  const schemeDescription = language === 'hi' ? scheme.detailed_description : scheme.detailed_description;
  const isOpen = scheme.status === 'Active';
  const deadline = scheme.last_date !== 'Not Specified' ? scheme.last_date : (language === 'hi' ? 'निर्दिष्ट नहीं' : 'Not Specified');

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 70%, #f0fdf4 100%)' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Conditional Back Button */}
          {fromChat ? (
            <button 
              onClick={handleBackToChat} 
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-2"
            >
              <MessageCircle size={20} />
              {language === 'hi' ? 'चैट पर वापस जाएं' : 'Back to Chat'}
            </button>
          ) : (
            <button 
              onClick={() => router.push('/schemes')} 
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              {language === 'hi' ? 'सभी योजनाएं' : 'All Schemes'}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-start justify-between gap-6">
            {/* Left: Icon + Info */}
            <div className="flex gap-4 flex-1">
              {/* Scheme Icon */}
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

              {/* Scheme Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                    {scheme.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isOpen 
                      ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700' 
                      : 'bg-gradient-to-r from-red-100 to-red-50 text-red-700'
                  }`}>
                    {isOpen 
                      ? (language === 'hi' ? '✓ खुला' : '✓ Open')
                      : (language === 'hi' ? '✕ बंद' : '✕ Closed')
                    }
                  </span>
                  {scheme.geographic_criteria && scheme.geographic_criteria !== 'All India' && (
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 rounded-full text-xs font-semibold flex items-center gap-1">
                      <MapPin size={12} /> {scheme.geographic_criteria}
                    </span>
                  )}
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                  {schemeName}
                </h1>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span className="font-medium">
                    {language === 'hi' ? 'अंतिम तिथि:' : 'Deadline:'} {deadline}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Benefit Highlight */}
            {scheme.financial_assistance && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 text-center min-w-[160px]">
                <p className="text-xs text-green-700 font-semibold mb-1">
                  {language === 'hi' ? 'लाभ' : 'Benefit'}
                </p>
                <p className="text-xl font-bold text-green-700 mb-1">
                  {scheme.financial_assistance}
                </p>
                <p className="text-xs text-green-600">
                  {scheme.benefit_type}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm p-2 mb-6 border border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {language === 'hi' ? 'अवलोकन' : 'Overview'}
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'documents'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText size={16} className="inline mr-2" />
              {language === 'hi' ? 'दस्तावेज़' : 'Documents'}
            </button>
            <button
              onClick={() => setActiveTab('apply')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'apply'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {language === 'hi' ? 'आवेदन करें' : 'Apply'}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: About Scheme */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {language === 'hi' ? 'योजना के बारे में' : 'About Scheme'}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {schemeDescription}
                </p>
                
                {/* Deadline Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 text-sm mb-1">
                      {language === 'hi' ? 'महत्वपूर्ण तिथि' : 'Important Date'}
                    </p>
                    <p className="text-amber-800 text-sm">
                      {language === 'hi' 
                        ? `आवेदन की अंतिम तिथि: ${deadline}` 
                        : `Application deadline: ${deadline}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Eligibility Criteria */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {language === 'hi' ? 'पात्रता मानदंड' : 'Eligibility Criteria'}
                </h2>
                <div className="space-y-3">
                  {scheme.age_criteria && scheme.age_criteria !== 'Not Specified' && (
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {language === 'hi' ? 'आयु सीमा' : 'Age Criteria'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {scheme.age_criteria}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {scheme.gender_criteria && scheme.gender_criteria !== 'All' && (
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {language === 'hi' ? 'लिंग' : 'Gender'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {scheme.gender_criteria}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {scheme.income_criteria && scheme.income_criteria !== 'Not Specified' && (
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {language === 'hi' ? 'आय मानदंड' : 'Income Criteria'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {scheme.income_criteria}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {scheme.category_criteria && scheme.category_criteria !== 'All' && (
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {language === 'hi' ? 'श्रेणी' : 'Category'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {scheme.category_criteria}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {scheme.occupation_criteria && scheme.occupation_criteria !== 'All' && (
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {language === 'hi' ? 'व्यवसाय' : 'Occupation'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {scheme.occupation_criteria}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Application Steps Section */}
            {(scheme.application_steps_online?.length > 0 || scheme.application_steps_offline?.length > 0) && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {language === 'hi' ? 'आवेदन चरण' : 'Application Steps'}
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Offline Steps */}
                  {scheme.application_steps_offline && scheme.application_steps_offline.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        🏢 {language === 'hi' ? 'व्यक्तिगत आवेदन' : 'In-Person Application'}
                      </h3>
                      <div className="space-y-4">
                        {scheme.application_steps_offline.map((step, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">
                                {step}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Online Steps */}
                  {scheme.application_steps_online && scheme.application_steps_online.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        💻 {language === 'hi' ? 'ऑनलाइन आवेदन' : 'Online Application'}
                      </h3>
                      <div className="space-y-4">
                        {scheme.application_steps_online.map((step, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">
                                {step}
                              </p>
                              {index === 0 && scheme.online_apply_link && (
                                <a
                                  href={scheme.online_apply_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-1"
                                >
                                  {language === 'hi' ? 'पोर्टल खोलें' : 'Open Portal'}
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="sticky bottom-4 bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
              <button
                onClick={() => setActiveTab('documents')}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-sm"
              >
                {language === 'hi' ? 'आवश्यक दस्तावेज़ देखें' : 'Check Documents Required'} →
              </button>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'hi' ? 'दस्तावेज़ चेकलिस्ट' : 'Document Checklist'}
                </h2>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {checkedCount}/{totalDocs}
                  </p>
                  <p className="text-xs text-gray-600">
                    {language === 'hi' ? 'तैयार' : 'Ready'}
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Document List */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="space-y-4">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleDocument(index)}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        doc.checked
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {doc.checked && <Check size={16} className="text-white" />}
                    </button>

                    {/* Document Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                          doc.required
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {doc.required 
                            ? (language === 'hi' ? 'आवश्यक' : 'Required')
                            : (language === 'hi' ? 'वैकल्पिक' : 'Optional')
                          }
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{doc.helperText}</p>
                      
                      {doc.sampleLink && (
                        <a
                          href={doc.sampleLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          {language === 'hi' ? 'नमूना देखें' : 'View Sample'}
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning for Pending Docs */}
            {checkedCount < totalDocs && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm mb-1">
                    {language === 'hi' ? 'लंबित दस्तावेज़' : 'Pending Documents'}
                  </p>
                  <p className="text-amber-800 text-sm">
                    {language === 'hi' 
                      ? `कृपया आगे बढ़ने से पहले सभी ${totalDocs - checkedCount} आवश्यक दस्तावेज़ तैयार करें।` 
                      : `Please prepare all ${totalDocs - checkedCount} required documents before proceeding.`}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="sticky bottom-4 bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
              <button
                onClick={() => setActiveTab('apply')}
                disabled={checkedCount < totalDocs}
                className={`w-full py-3 rounded-xl font-semibold shadow-sm transition-all ${
                  checkedCount >= totalDocs
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {language === 'hi' ? 'आवेदन करने के लिए आगे बढ़ें' : 'Proceed to Apply'} →
              </button>
            </div>
          </div>
        )}

        {/* Apply Tab */}
        {activeTab === 'apply' && (
          <div className="space-y-6">
            {/* Documents Ready */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'hi' ? 'दस्तावेज़ तैयार' : 'Documents Ready'}
                </h2>
                <button
                  onClick={() => setActiveTab('documents')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← {language === 'hi' ? 'दस्तावेज़ों पर वापस जाएं' : 'Back to Documents'}
                </button>
              </div>
              
              {/* Selected Document Chips */}
              <div className="flex flex-wrap gap-2 mb-3">
                {documents.filter(d => d.checked).map((doc, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    <Check size={14} />
                    {doc.name}
                  </span>
                ))}
              </div>
              
              <p className="text-sm text-gray-600">
                {language === 'hi' 
                  ? `${checkedCount} दस्तावेज़ तैयार हैं` 
                  : `${checkedCount} documents ready`}
              </p>
            </div>

            {/* Choose Application Method */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {language === 'hi' ? 'आवेदन विधि चुनें' : 'Choose Application Method'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Apply Online Card */}
                <div className="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-400 transition-all cursor-pointer group">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl mb-4">
                    💻
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {language === 'hi' ? 'ऑनलाइन आवेदन करें' : 'Apply Online'}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {language === 'hi' 
                      ? 'आधिकारिक पोर्टल पर जाएं और ऑनलाइन आवेदन करें। तेज़ और सुविधाजनक।' 
                      : 'Visit the official portal and apply online. Fast and convenient.'}
                  </p>
                  
                  {scheme.online_apply_link ? (
                    <a
                      href={scheme.online_apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-sm"
                    >
                      {language === 'hi' ? 'पोर्टल पर जाएं' : 'Go to Portal'}
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-500 rounded-xl font-semibold text-sm cursor-not-allowed"
                    >
                      {language === 'hi' ? 'जल्द आ रहा है' : 'Coming Soon'}
                    </button>
                  )}
                </div>

                {/* Visit Center Card */}
                <div className="border-2 border-gray-200 rounded-2xl p-6 hover:border-green-400 transition-all cursor-pointer group">
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
                  
                  <button
                    onClick={() => router.push('/service-centers')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold text-sm"
                  >
                    {language === 'hi' ? 'केंद्र खोजें' : 'Find Centers'}
                    <MapPin size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <div className="text-2xl">💬</div>
              <div>
                <p className="font-semibold text-blue-900 text-sm mb-1">
                  {language === 'hi' ? 'मदद चाहिए?' : 'Need Help?'}
                </p>
                <p className="text-blue-800 text-sm mb-3">
                  {language === 'hi' 
                    ? 'हमारे AI सहायक से बात करें और आवेदन प्रक्रिया में मार्गदर्शन प्राप्त करें।' 
                    : 'Talk to our AI assistant and get guidance on the application process.'}
                </p>
                <button
                  onClick={() => router.push('/chat')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                >
                  {language === 'hi' ? 'सहायक से पूछें' : 'Ask Assistant'}
                </button>
              </div>
            </div>

            {/* Apply Now Button */}
            <div className="sticky bottom-4 bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
              <button
                onClick={() => router.push(`/applications/apply/${schemeId}`)}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold text-lg shadow-sm transition-all"
              >
                {language === 'hi' ? 'अभी आवेदन करें' : 'Apply Now'} →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

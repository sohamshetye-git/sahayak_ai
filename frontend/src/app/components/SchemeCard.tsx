'use client';

import { useRouter } from 'next/navigation';
import { FileText, ExternalLink } from 'lucide-react';

interface SchemeCardProps {
  scheme: {
    scheme_id: string;
    scheme_name: string;
    scheme_name_hi?: string;
    category: string;
    financial_assistance?: string;
    benefit_type?: string;
    short_description?: string;
    matchPercentage?: number;
    eligibilityReason?: string;
    geographic_criteria?: string;
    theme_color?: string;
    icon_keyword?: string;
  };
  language: 'en' | 'hi';
  fromChat?: boolean;
  chatSessionId?: string;
}

export function SchemeCard({ scheme, language, fromChat, chatSessionId }: SchemeCardProps) {
  const router = useRouter();

  const schemeName = language === 'hi' && scheme.scheme_name_hi ? scheme.scheme_name_hi : scheme.scheme_name;
  const matchPercentage = scheme.matchPercentage || 75;

  // Build URL with context
  const buildSchemeUrl = (tab?: string) => {
    const baseUrl = `/schemes/${scheme.scheme_id}`;
    const params = new URLSearchParams();
    
    if (fromChat) {
      params.set('from', 'chat');
      if (chatSessionId) {
        params.set('sessionId', chatSessionId);
      }
    }
    
    if (tab) {
      params.set('tab', tab);
    }
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // Extract amount from financial_assistance string
  const extractAmount = (assistance: string): number | null => {
    const match = assistance?.match(/₹?([\d,]+)/);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''));
    }
    return null;
  };

  const benefitAmount = scheme.financial_assistance ? extractAmount(scheme.financial_assistance) : null;

  // Category icons
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Education': '🎓',
      'Health': '🏥',
      'Agriculture': '🌾',
      'Housing': '🏠',
      'Employment': '💼',
      'Social Welfare': '🤝',
      'Financial Assistance': '💰',
    };
    return icons[category] || '📋';
  };

  // Category colors
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Education': 'from-blue-500 to-indigo-600',
      'Health': 'from-red-500 to-pink-600',
      'Agriculture': 'from-green-500 to-emerald-600',
      'Housing': 'from-purple-500 to-violet-600',
      'Employment': 'from-orange-500 to-amber-600',
      'Social Welfare': 'from-teal-500 to-cyan-600',
      'Financial Assistance': 'from-yellow-500 to-orange-600',
    };
    return colors[category] || 'from-gray-500 to-slate-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Banner with Icon */}
      <div 
        className="h-24 relative"
        style={{ 
          background: scheme.theme_color 
            ? `linear-gradient(135deg, ${scheme.theme_color} 0%, ${scheme.theme_color}dd 100%)`
            : `linear-gradient(135deg, ${getCategoryColor(scheme.category)})`
        }}
      >
        <div className="absolute -bottom-6 left-6">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl border-4 border-white">
            {getCategoryIcon(scheme.category)}
          </div>
        </div>
        {/* Match Badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
            <span className="text-sm font-bold text-green-600">
              {matchPercentage}% {language === 'hi' ? 'मेल' : 'Match'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-8">
        {/* Category Tag */}
        <div className="mb-3">
          <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-full text-xs font-semibold">
            {scheme.category}
          </span>
          {scheme.geographic_criteria && scheme.geographic_criteria !== 'All India' && (
            <span className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 rounded-full text-xs font-semibold">
              📍 {scheme.geographic_criteria}
            </span>
          )}
        </div>

        {/* Scheme Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight line-clamp-2">
          {schemeName}
        </h3>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">
              {language === 'hi' ? 'पात्रता मेल' : 'Eligibility Match'}
            </span>
            <span className="text-xs font-bold text-gray-900">{matchPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${matchPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Benefits Highlight */}
        {scheme.financial_assistance && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-200">
            <p className="text-xs text-green-700 font-semibold mb-1">
              {language === 'hi' ? '💰 मुख्य लाभ' : '💰 Key Benefit'}
            </p>
            {benefitAmount && (
              <p className="text-xl font-bold text-green-700 mb-1">
                ₹{benefitAmount.toLocaleString()}
              </p>
            )}
            <p className="text-sm text-green-600">{scheme.benefit_type || scheme.financial_assistance}</p>
          </div>
        )}

        {/* Eligibility Notes */}
        {scheme.eligibilityReason && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
            <p className="text-xs font-semibold text-blue-900 mb-1">
              {language === 'hi' ? '✓ आप पात्र क्यों हैं' : '✓ Why You\'re Eligible'}
            </p>
            <p className="text-sm text-blue-700 leading-relaxed">
              {scheme.eligibilityReason}
            </p>
          </div>
        )}

        {/* Short Description */}
        {!scheme.eligibilityReason && scheme.short_description && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
              {scheme.short_description}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push(buildSchemeUrl('documents'))}
            className="flex-1 px-4 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold text-sm flex items-center justify-center gap-2"
          >
            <FileText size={16} />
            {language === 'hi' ? 'दस्तावेज़' : 'Documents'}
          </button>
          <button
            onClick={() => router.push(buildSchemeUrl())}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            {language === 'hi' ? 'विवरण देखें' : 'View Details'}
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

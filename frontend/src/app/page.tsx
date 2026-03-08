'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '../lib/context/language-context';

const languages = [
  { code: 'hi', label: 'हिंदी', sub: 'Hindi', flag: '🇮🇳' },
  { code: 'en', label: 'English', sub: '', flag: '🌐' },
];

export default function LanguageSelection() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();

  const handleLanguageSelect = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    router.push('/home');
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 50%, #e0f2fe 100%)' }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <img 
            src="/logo.png" 
            alt="Sahayak AI Logo" 
            className="h-12 w-auto"
            style={{ objectFit: 'contain' }}
          />
          <span className="text-3xl font-semibold text-blue-700">
            Sahayak AI
          </span>
        </div>
        <p className="text-gray-600 text-sm">Government Schemes Made Simple</p>
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-3xl text-gray-900 mb-1">Select Your Language</h1>
        <h2 className="text-2xl text-gray-800">अपनी भाषा चुनें</h2>
      </div>

      {/* Language Grid */}
      <div className="grid grid-cols-2 gap-3 max-w-md w-full mb-6">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code as 'en' | 'hi')}
            className={`relative flex flex-col items-center justify-center py-6 px-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
              language === lang.code
                ? 'border-blue-400 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            {lang.flag && (
              <span className="absolute top-2 right-2 text-base">
                {lang.flag}
              </span>
            )}
            <span className="text-2xl text-gray-800 mb-1">{lang.label}</span>
            {lang.sub && <span className="text-sm text-gray-500">{lang.sub}</span>}
          </button>
        ))}
      </div>

      {/* Continue Button */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => router.push('/home')}
          className="mt-4 px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors text-sm shadow-md"
        >
          Continue →
        </button>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-xs text-gray-400 text-center">
        This service is free and secure. यह सेवा निःशुल्क और सुरक्षित है।
      </p>
    </div>
  );
}

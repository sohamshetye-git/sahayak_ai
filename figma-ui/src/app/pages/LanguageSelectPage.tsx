import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mic, MicOff } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';

const languages = [
  { code: 'Hindi', label: 'हिंदी', sub: 'Hindi', flag: '🇮🇳', map: '🗺️' },
  { code: 'Kannada', label: 'ಕನ್ನಡ', sub: 'Kannada', flag: '', map: '🗺️' },
  { code: 'Tamil', label: 'தமிழ்', sub: 'Tamil', flag: '', map: '🗺️' },
  { code: 'Telugu', label: 'తెలుగు', sub: 'Telugu', flag: '', map: '🗺️' },
  { code: 'Bengali', label: 'বাংলা', sub: 'Bengali', flag: '', map: '🗺️' },
  { code: 'Marathi', label: 'मराठी', sub: 'Marathi', flag: '', map: '🗺️' },
  { code: 'Gujarati', label: 'ગુજરાતી', sub: 'Gujarati', flag: '', map: '🗺️' },
  { code: 'English', label: 'English', sub: '', flag: '🌐', map: '' },
];

export default function LanguageSelectPage() {
  const { language, setLanguage } = useAppContext();
  const navigate = useNavigate();
  const [speaking, setSpeaking] = useState(false);
  const [selected, setSelected] = useState(language);

  const handleSelect = (code: string) => {
    setSelected(code as any);
    setLanguage(code as any);
  };

  const handleContinue = () => {
    navigate('/home');
  };

  const handleSpeak = () => {
    setSpeaking((s) => !s);
    if (!speaking) {
      setTimeout(() => setSpeaking(false), 3000);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 50%, #e0f2fe 100%)' }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-lg">
            🤲
          </div>
          <span className="text-2xl text-blue-700">
            <span className="text-blue-500">Sahayak</span> <span className="text-blue-700">AI</span>
          </span>
        </div>
        <p className="text-gray-500 text-sm">Government Schemes Made Simple</p>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl text-gray-900 mb-1">Select Your Language</h1>
        <h2 className="text-2xl text-gray-800">अपनी भाषा चुनें</h2>
      </motion.div>

      {/* Language Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl w-full mb-6"
      >
        {languages.map((lang, i) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
            onClick={() => handleSelect(lang.code)}
            className={`relative flex flex-col items-center justify-center py-5 px-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
              selected === lang.code
                ? 'border-blue-400 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            {(lang.flag || lang.map) && (
              <span className="absolute top-2 right-2 text-base">
                {lang.flag || lang.map}
              </span>
            )}
            <span className="text-2xl text-gray-800 mb-1">{lang.label}</span>
            {lang.sub && <span className="text-sm text-gray-500">{lang.sub}</span>}
          </motion.button>
        ))}
      </motion.div>

      {/* Speak Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="flex flex-col items-center gap-3"
      >
        <button
          onClick={handleSpeak}
          className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-200 ${
            speaking
              ? 'bg-red-50 border-red-300 text-red-600'
              : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600'
          }`}
        >
          {speaking ? <MicOff size={18} /> : <Mic size={18} />}
          <span className="text-sm">
            {speaking ? 'Listening...' : 'Speak to Select Language'}
          </span>
        </button>
        <p className="text-sm text-gray-500">
          Press and say your language <span className="text-gray-700">अपनी भाषा बोलें</span>
        </p>

        <button
          onClick={handleContinue}
          className="mt-4 px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors text-sm shadow-md"
        >
          Continue →
        </button>
      </motion.div>

      {/* Footer note */}
      <p className="mt-8 text-xs text-gray-400 text-center">
        This service is free and secure. यह सेवा निःशुल्क और सुरक्षित है।
      </p>
    </div>
  );
}

import { useState, useRef } from 'react';
import { Mic, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';

const featureCards = [
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="8" fill="#EFF6FF"/>
        <path d="M10 14h16M10 18h10M10 22h12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="27" cy="24" r="4" fill="#3B82F6"/>
        <path d="M26 24l1 1 2-2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Smart Scheme Matching',
    desc: 'AI-powered personalized eligibility check',
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="8" fill="#EFF6FF"/>
        <circle cx="18" cy="18" r="7" stroke="#3B82F6" strokeWidth="2"/>
        <path d="M18 11v7l4 2" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
        <path d="M11 25c1.5-1.5 3.5-2.5 7-2.5s5.5 1 7 2.5" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Multilingual Voice Support',
    desc: 'Speak in your local language',
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="8" fill="#EFF6FF"/>
        <path d="M18 10c-3.866 0-7 3.134-7 7 0 5.25 7 11 7 11s7-5.75 7-11c0-3.866-3.134-7-7-7z" stroke="#3B82F6" strokeWidth="2"/>
        <circle cx="18" cy="17" r="2.5" stroke="#3B82F6" strokeWidth="1.8"/>
      </svg>
    ),
    title: 'Nearest Service Center Locator',
    desc: 'Find government offices near you instantly',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { language } = useAppContext();
  const [inputVal, setInputVal] = useState('');
  const [pulsing, setPulsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMicClick = () => {
    setPulsing(true);
    setTimeout(() => {
      setPulsing(false);
      navigate('/chat');
    }, 1200);
  };

  const handleSearch = () => {
    if (inputVal.trim()) {
      navigate('/chat', { state: { initialQuery: inputVal.trim() } });
    } else {
      navigate('/chat');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex flex-col"
      style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 70%, #f0fdf4 100%)' }}
    >
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-12 pb-6 relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #bfdbfe, transparent)', transform: 'translate(-30%, -30%)' }} />
        <div className="absolute bottom-20 right-0 w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #bae6fd, transparent)', transform: 'translate(30%, 20%)' }} />

        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left / Center Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center lg:items-center text-center col-span-1 lg:col-span-2"
          >
            {/* Heading */}
            <div className="lg:max-w-4xl w-full grid lg:grid-cols-5 gap-6 items-center">
              <div className="lg:col-span-3 flex flex-col items-center lg:items-center">
                <h1 className="text-4xl sm:text-5xl text-blue-700 mb-3" style={{ fontWeight: 700, lineHeight: 1.15 }}>
                  Voice-First Access to<br />Government Schemes
                </h1>
                <p className="text-gray-600 text-lg mb-8">
                  Discover, understand, and apply for welfare schemes in your language.
                </p>

                {/* Mic Button */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    {/* Ripple rings */}
                    {pulsing && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-orange-400"
                          initial={{ scale: 1, opacity: 0.8 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-orange-300"
                          initial={{ scale: 1, opacity: 0.6 }}
                          animate={{ scale: 2.8, opacity: 0 }}
                          transition={{ duration: 1, delay: 0.2, repeat: Infinity }}
                        />
                      </>
                    )}
                    {/* Outer glow ring */}
                    <div className="w-28 h-28 rounded-full flex items-center justify-center" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
                      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(251, 191, 36, 0.25)' }}>
                        <motion.button
                          onClick={handleMicClick}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                          style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
                        >
                          <Mic size={26} className="text-white" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700 text-base">Click to Speak or Type Your Question</p>
                </div>

                {/* Search Bar */}
                <div className="w-full max-w-lg flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about farming schemes, pension, health insurance..."
                      className="w-full pl-5 pr-10 py-3.5 rounded-xl border border-blue-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 shadow-sm"
                    />
                    <button
                      onClick={handleSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <Search size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right — Illustration */}
              <div className="hidden lg:flex lg:col-span-2 items-center justify-center">
                <div className="relative">
                  {/* Chat bubble */}
                  <motion.div
                    initial={{ opacity: 0, x: 20, y: -10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="absolute -top-4 -right-4 bg-white rounded-2xl rounded-bl-sm shadow-lg px-3 py-2 z-10 border border-blue-100"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">😊</span>
                      <span className="text-xs text-gray-600">Namaste!</span>
                    </div>
                  </motion.div>
                  {/* Document icon */}
                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="absolute top-8 -right-12 bg-white rounded-xl shadow-md p-3 z-10 border border-blue-100"
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-sm">📋</span>
                      <span className="text-xs text-blue-600">PM-KISAN</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-xs text-green-600">Eligible</span>
                    </div>
                  </motion.div>
                  <img
                    src="https://images.unsplash.com/photo-1589292144899-2f43a71a1b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBmYXJtZXIlMjBlbGRlcmx5JTIwbWFuJTIwZGlnaXRhbCUyMHRhYmxldCUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzcyNDYxMjE1fDA&ixlib=rb-4.1.0&q=80&w=400"
                    alt="Citizen using Sahayak AI"
                    className="w-52 h-64 object-cover rounded-2xl shadow-xl border-4 border-white"
                    style={{ objectPosition: 'center top' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-6xl mx-auto w-full px-4 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {featureCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
              className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
              onClick={() => {
                if (i === 1) navigate('/chat');
                else if (i === 2) navigate('/service-center');
                else navigate('/chat');
              }}
            >
              {card.icon}
              <div>
                <p className="text-sm text-gray-900">{card.title}</p>
                <p className="text-xs text-gray-500">{card.desc}</p>
              </div>
              <ChevronRight size={14} className="text-gray-300 ml-auto shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

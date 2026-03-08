'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { Layout } from '../components/Layout';
import { Mic, Search, ChevronRight } from 'lucide-react';

const featureCards = [
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="8" fill="#EFF6FF" />
        <path d="M10 14h16M10 18h10M10 22h12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="27" cy="24" r="4" fill="#3B82F6" />
        <path d="M26 24l1 1 2-2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Smart Scheme Matching',
    desc: 'AI-powered personalized eligibility check',
    path: '/chat',
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="8" fill="#EFF6FF" />
        <circle cx="18" cy="18" r="7" stroke="#3B82F6" strokeWidth="2" />
        <path d="M18 11v7l4 2" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        <path d="M11 25c1.5-1.5 3.5-2.5 7-2.5s5.5 1 7 2.5" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Multilingual Voice Support',
    desc: 'Speak in your local language',
    path: '/chat',
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="8" fill="#EFF6FF" />
        <path d="M18 10c-3.866 0-7 3.134-7 7 0 5.25 7 11 7 11s7-5.75 7-11c0-3.866-3.134-7-7-7z" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="18" cy="17" r="2.5" stroke="#3B82F6" strokeWidth="1.8" />
      </svg>
    ),
    title: 'Nearest Service Center Locator',
    desc: 'Find government offices near you instantly',
    path: '/service-centers',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [inputVal, setInputVal] = useState('');
  const [pulsing, setPulsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMicClick = () => {
    setPulsing(true);
    setTimeout(() => {
      setPulsing(false);
      router.push('/chat');
    }, 1200);
  };

  const handleSearch = () => {
    if (inputVal.trim()) {
      router.push('/chat');
    } else {
      router.push('/chat');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <Layout>
      <div
        className="min-h-[calc(100vh-4rem)] flex flex-col"
        style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 70%, #f0fdf4 100%)' }}
      >
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-8 relative overflow-hidden">
          {/* Background decorative circles */}
          <div
            className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #bfdbfe, transparent)', transform: 'translate(-30%, -30%)' }}
          />
          <div
            className="absolute bottom-20 right-0 w-80 h-80 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #bae6fd, transparent)', transform: 'translate(30%, 20%)' }}
          />

          <div className="max-w-7xl w-full mx-auto flex items-center justify-center gap-12 relative">
            {/* Center Column - Voice Interaction Block */}
            <div className="flex flex-col items-center text-center max-w-2xl">
              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl text-blue-700 mb-4" style={{ fontWeight: 700, lineHeight: 1.15 }}>
                Voice-First Access to Government Schemes
              </h1>
              
              {/* Subtitle */}
              <p className="text-gray-600 text-lg mb-12 max-w-xl">
                Discover, understand, and apply for welfare schemes in your language. AI-powered assistance for every citizen.
              </p>

              {/* CTA Label */}
              <p className="text-gray-700 text-base font-semibold mb-3">Start Voice Conversation</p>

              {/* Microphone Button - PRIMARY FOCUS */}
              <div className="relative mb-4">
                {/* Subtle outer glow */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ 
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent)',
                    width: '140px',
                    height: '140px',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                {pulsing && (
                  <>
                    <div
                      className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping"
                      style={{ animationDuration: '1.2s' }}
                    />
                    <div
                      className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping"
                      style={{ animationDuration: '1.2s', animationDelay: '0.3s' }}
                    />
                  </>
                )}
                <button
                  onClick={handleMicClick}
                  className="relative rounded-full flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
                  style={{ 
                    width: '104px',
                    height: '104px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 6px 24px rgba(37, 99, 235, 0.35)'
                  }}
                >
                  <Mic size={38} className="text-white" strokeWidth={2.5} />
                </button>
              </div>

              {/* Help Text */}
              <p className="text-gray-500 text-sm mb-10">Click the microphone or type your question below</p>

              {/* Search Bar */}
              <div className="w-full max-w-xl">
                <div className="relative">
                  <input
                    ref={inputRef}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about farming schemes, pension, health insurance..."
                    className="w-full pl-5 pr-12 py-3.5 rounded-xl border-2 border-blue-200 bg-white text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Supporting Hero Image - Right Side */}
            <div className="hidden xl:block flex-shrink-0">
              <div 
                className="bg-white rounded-2xl p-4 shadow-sm"
                style={{ 
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
                }}
              >
                <img
                  src="/hero-image.png"
                  alt="Government Schemes Assistance"
                  className="rounded-xl"
                  style={{
                    width: '320px',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="max-w-7xl mx-auto w-full px-4 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {featureCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-200"
                onClick={() => router.push(card.path)}
              >
                {card.icon}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">{card.title}</p>
                  <p className="text-xs text-gray-500">{card.desc}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

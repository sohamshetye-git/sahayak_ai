'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, Menu, X, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../lib/context/language-context';
// import { translations } from '../../lib/i18n/translations';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
];

export function Navbar() {
  const { language, setLanguage } = useLanguage();
  // const t = translations[language];
  const pathname = usePathname();
  const router = useRouter();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: language === 'hi' ? 'होम' : 'Home', path: '/home' },
    { label: language === 'hi' ? 'चैट सहायक' : 'AI Chat', path: '/chat' },
    { label: language === 'hi' ? 'योजनाएं देखें' : 'Explore Schemes', path: '/schemes' },
    { label: language === 'hi' ? 'सेवा केंद्र' : 'Service Centers', path: '/service-centers' },
    { label: language === 'hi' ? 'मेरे आवेदन' : 'My Applications', path: '/applications' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className="sticky top-0 z-50 shadow-sm"
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e3a5f 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-3 shrink-0">
            <img 
              src="/logo.png" 
              alt="Sahayak AI Logo" 
              className="h-10 w-auto"
              style={{ objectFit: 'contain' }}
            />
            <span className="text-lg font-semibold" style={{ color: '#ffffff', letterSpacing: '-0.01em' }}>
              Sahayak AI
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="relative px-4 py-2 text-sm rounded-lg transition-all"
                style={{
                  color: isActive(link.path) ? '#ffffff' : 'rgba(199,210,254,0.8)',
                  backgroundColor: isActive(link.path) ? 'rgba(255,255,255,0.12)' : 'transparent',
                  fontWeight: isActive(link.path) ? 600 : 400,
                }}
              >
                {link.label}
                {isActive(link.path) && (
                  <span
                    className="absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full"
                    style={{ backgroundColor: '#86efac' }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{
                  color: '#c7d2fe',
                  border: '1px solid rgba(199,210,254,0.25)',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                }}
              >
                <Globe size={14} />
                {language === 'en' ? 'English' : 'हिंदी'}
                <ChevronDown size={13} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        router.push('/');
                        setLangOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs border-b border-gray-100 transition-colors hover:bg-indigo-50"
                      style={{ color: '#4338ca', fontWeight: 600 }}
                    >
                      🌐 Change Language Page
                    </button>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as 'en' | 'hi');
                          setLangOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                        style={{
                          color: language === lang.code ? '#15803d' : '#374151',
                          fontWeight: language === lang.code ? 600 : 400,
                        }}
                      >
                        {language === lang.code && <span style={{ color: '#15803d' }}>✓</span>} {lang.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#c7d2fe', backgroundColor: 'rgba(255,255,255,0.06)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden overflow-hidden"
          style={{ backgroundColor: '#1e1b4b', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{
                  color: isActive(link.path) ? '#ffffff' : 'rgba(199,210,254,0.8)',
                  backgroundColor: isActive(link.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                  fontWeight: isActive(link.path) ? 600 : 400,
                }}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                className="flex-1 text-sm rounded-lg px-2 py-1.5"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#c7d2fe',
                  border: '1px solid rgba(199,210,254,0.2)',
                }}
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} style={{ backgroundColor: '#1e1b4b' }}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

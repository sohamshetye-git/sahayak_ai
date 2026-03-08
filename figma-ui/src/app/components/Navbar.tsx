import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { User, ChevronDown, Menu, X, Globe, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { AnimatePresence, motion } from 'motion/react';

const languages = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Kannada', 'Gujarati'];

export function Navbar() {
  const { language, setLanguage, isLoggedIn, setIsLoggedIn } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/home' },
    { label: 'AI Chat', path: '/chat' },
    { label: 'Explore Schemes', path: '/explore' },
    { label: 'Find Service Center', path: '/service-center' },
    { label: 'My Applications', path: '/my-applications' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 shadow-sm"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e3a5f 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2.5 shrink-0" aria-label="Sahayak AI Home">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shadow-md"
              style={{ background: 'linear-gradient(135deg, #f97316, #4338ca)' }}>
              🤲
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>
              <span style={{ color: '#86efac' }}>Sahayak</span>{' '}
              <span style={{ color: '#c7d2fe' }}>AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative px-4 py-2 text-sm rounded-lg transition-all"
                style={{
                  color: isActive(link.path) ? '#ffffff' : 'rgba(199,210,254,0.8)',
                  backgroundColor: isActive(link.path) ? 'rgba(255,255,255,0.12)' : 'transparent',
                  fontWeight: isActive(link.path) ? 600 : 400,
                }}
                aria-current={isActive(link.path) ? 'page' : undefined}>
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full" style={{ backgroundColor: '#86efac' }} />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => { setLangOpen(!langOpen); setProfileOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{ color: '#c7d2fe', border: '1px solid rgba(199,210,254,0.25)', backgroundColor: 'rgba(255,255,255,0.06)' }}
                aria-label={`Language: ${language}. Click to change.`}
                aria-expanded={langOpen}>
                <Globe size={14} aria-hidden="true" />
                {language}
                <ChevronDown size={13} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden" role="menu">
                  <button onClick={() => { navigate('/'); setLangOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs border-b border-gray-100 transition-colors hover:bg-indigo-50"
                    style={{ color: '#4338ca', fontWeight: 600 }} role="menuitem">
                    🌐 Change Language Page
                  </button>
                  {languages.map((lang) => (
                    <button key={lang} onClick={() => { setLanguage(lang as any); setLangOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2" role="menuitem"
                      style={{ color: language === lang ? '#15803d' : '#374151', fontWeight: language === lang ? 600 : 400 }}>
                      {language === lang && <span style={{ color: '#15803d' }}>✓</span>} {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login / Profile */}
            {isLoggedIn ? (
              <div className="relative">
                <button onClick={() => { setProfileOpen(!profileOpen); setLangOpen(false); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
                  style={{ border: '1px solid rgba(199,210,254,0.25)', backgroundColor: 'rgba(255,255,255,0.06)' }}
                  aria-expanded={profileOpen} aria-label="Open profile menu">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c7d2fe' }}>
                    <User size={13} style={{ color: '#3730a3' }} aria-hidden="true" />
                  </div>
                  <span className="text-sm" style={{ color: '#c7d2fe' }}>Profile</span>
                  <ChevronDown size={12} className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} style={{ color: '#c7d2fe' }} aria-hidden="true" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden" role="menu">
                    <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: '#f8f9ff' }}>
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm" style={{ color: '#1e1b4b', fontWeight: 600 }}>Citizen User</p>
                    </div>
                    <button onClick={() => { navigate('/my-applications'); setProfileOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors" role="menuitem">
                      <FileIcon /> My Applications
                    </button>
                    <button onClick={() => { setIsLoggedIn(false); setProfileOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2 transition-colors" style={{ color: '#dc2626' }} role="menuitem">
                      <LogOut size={14} aria-hidden="true" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setIsLoggedIn(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{ color: '#c7d2fe', border: '1px solid rgba(199,210,254,0.25)', backgroundColor: 'rgba(255,255,255,0.06)' }}
                aria-label="Login with OTP">
                <User size={14} aria-hidden="true" /> Login / OTP Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#c7d2fe', backgroundColor: 'rgba(255,255,255,0.06)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
            style={{ backgroundColor: '#1e1b4b', borderTop: '1px solid rgba(255,255,255,0.08)' }}
            role="navigation" aria-label="Mobile navigation">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors"
                  style={{
                    color: isActive(link.path) ? '#ffffff' : 'rgba(199,210,254,0.8)',
                    backgroundColor: isActive(link.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                    fontWeight: isActive(link.path) ? 600 : 400,
                  }}
                  aria-current={isActive(link.path) ? 'page' : undefined}>
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <select value={language} onChange={(e) => setLanguage(e.target.value as any)}
                  className="flex-1 text-sm rounded-lg px-2 py-1.5"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#c7d2fe', border: '1px solid rgba(199,210,254,0.2)' }}
                  aria-label="Select language">
                  {languages.map((l) => <option key={l} style={{ backgroundColor: '#1e1b4b' }}>{l}</option>)}
                </select>
                {isLoggedIn ? (
                  <button onClick={() => { setIsLoggedIn(false); setMobileOpen(false); }}
                    className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                    style={{ color: '#fca5a5', border: '1px solid rgba(252,165,165,0.3)' }}>
                    Sign Out
                  </button>
                ) : (
                  <button onClick={() => { setIsLoggedIn(true); setMobileOpen(false); }}
                    className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                    style={{ color: '#c7d2fe', border: '1px solid rgba(199,210,254,0.25)' }}>
                    Login / OTP
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(langOpen || profileOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setLangOpen(false); setProfileOpen(false); }} aria-hidden="true" />
      )}
    </nav>
  );
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}
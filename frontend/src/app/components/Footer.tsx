'use client';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left - Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Sahayak AI Logo" 
              className="h-8 w-auto"
              style={{ objectFit: 'contain' }}
            />
            <span className="text-base font-semibold text-gray-900">Sahayak AI</span>
          </div>

          {/* Center - Description */}
          <p className="text-sm text-gray-600 text-center">
            AI-powered Government Scheme Assistance Platform
          </p>

          {/* Right - Powered By */}
          <p className="text-sm text-gray-500">
            Powered by AI on Cloud Infrastructure
          </p>
        </div>
      </div>
    </footer>
  );
}

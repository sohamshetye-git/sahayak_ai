import { Outlet } from 'react-router';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-4 text-center">
        <div className="flex items-center justify-center gap-6 text-xs text-blue-600 mb-1.5">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Data Protection Notice</a>
          <a href="#" className="hover:underline">Help & Support</a>
        </div>
        <p className="text-xs text-gray-500">Powered by AI on Cloud</p>
        <p className="text-xs text-gray-400">Government Digital Inclusion Initiative — Empowering Citizens with Technology</p>
      </footer>
    </div>
  );
}
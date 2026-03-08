import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '../lib/context/language-context';

export const metadata: Metadata = {
  title: 'Sahayak AI - Government Scheme Assistant',
  description: 'Voice-first AI assistant for discovering government welfare schemes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

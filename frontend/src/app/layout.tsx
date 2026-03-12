import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '../lib/context/language-context';
import Script from 'next/script';

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
        
        {/* Script to remove Vercel branding */}
        <Script id="remove-vercel-branding" strategy="afterInteractive">
          {`
            // Remove Vercel branding elements
            function removeVercelBranding() {
              // Remove Vercel toolbar
              const toolbar = document.querySelector('[data-vercel-toolbar]');
              if (toolbar) toolbar.remove();
              
              // Remove any Vercel badges or links
              const vercelElements = document.querySelectorAll('[class*="vercel"], [id*="vercel"], a[href*="vercel.com"]');
              vercelElements.forEach(el => el.remove());
              
              // Remove "Powered by Vercel" text
              const textNodes = document.evaluate(
                "//text()[contains(., 'Powered by Vercel') or contains(., 'vercel')]",
                document,
                null,
                XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
                null
              );
              
              for (let i = 0; i < textNodes.snapshotLength; i++) {
                const node = textNodes.snapshotItem(i);
                if (node && node.parentNode) {
                  node.parentNode.removeChild(node);
                }
              }
            }
            
            // Run immediately and on DOM changes
            removeVercelBranding();
            
            // Observer for dynamically added elements
            const observer = new MutationObserver(removeVercelBranding);
            observer.observe(document.body, { childList: true, subtree: true });
            
            // Run after page load
            window.addEventListener('load', removeVercelBranding);
          `}
        </Script>
      </body>
    </html>
  );
}

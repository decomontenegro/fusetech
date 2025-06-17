/**
 * FUSEtech Lite - Simplified Layout
 * 
 * Minimal layout without complex providers for MVP testing
 * Bypasses AuthProvider and FeatureFlagProvider dependencies
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FUSEtech Lite - MVP',
  description: 'Simplified fitness token rewards - MVP for market validation',
  viewport: 'width=device-width, initial-scale=1',
};

export default function LiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>FUSEtech Lite - MVP</title>
      </head>
      <body className="bg-gray-50">
        {/* Simplified layout without complex providers */}
        <div id="lite-app">
          {children}
        </div>
        
        {/* Development indicator */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-50">
            MVP Mode
          </div>
        )}
      </body>
    </html>
  );
}

'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { VoiceInteractionModal } from '@/components/voice/VoiceInteractionModal';
import { Mic } from 'lucide-react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <html lang="ta" className="dark">
      <head>
        <title>LivelihoodSaathi AI — Your Skills. Your Future. Your Voice.</title>
        <meta
          name="description"
          content="AI-powered multilingual career and livelihood guidance platform for youth across India. Speech-to-text in Tamil, English and Tanglish."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#090909] text-white antialiased selection:bg-[#E98AE0] selection:text-black">
        <AuthProvider>
          <LanguageProvider>
            {/* Top Navigation - shown on app pages, hidden on dedicated split-screen auth */}
            {!isAuthPage && <Navbar onOpenVoiceModal={() => setVoiceModalOpen(true)} />}

            {/* Main Application Area */}
            <main className="flex-1 w-full">{children}</main>

            {/* Footer - shown on app pages */}
            {!isAuthPage && <Footer />}

            {/* Global Voice Assistant Floating Action Button */}
            {!isAuthPage && (
              <aside aria-label="Voice Assistant Floating Action" className="fixed bottom-6 right-6 z-40">
                <button
                  onClick={() => setVoiceModalOpen(true)}
                  className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#E98AE0] via-[#C049D9] to-[#7928CA] text-white shadow-xl shadow-[#E98AE0]/25 ring-2 ring-white/20 hover:scale-110 hover:shadow-[0_0_30px_rgba(233,138,224,0.6)] transition-all duration-300"
                  aria-label="Open Voice Career Assistant"
                >
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E98AE0] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#F29AD9] border-2 border-[#090909]"></span>
                  </span>
                  <Mic className="h-6 w-6 transition-transform group-hover:scale-110" />
                  <span className="sr-only">Voice Guide</span>
                </button>
              </aside>
            )}

            {/* Global Voice Assistant Modal */}
            <VoiceInteractionModal
              isOpen={voiceModalOpen}
              onClose={() => setVoiceModalOpen(false)}
            />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

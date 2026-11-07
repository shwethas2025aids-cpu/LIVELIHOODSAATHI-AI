'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Shield, Award, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-white/10 bg-[#090909] text-[#A7A7A7]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#160B24] border border-[#E98AE0]/30 shadow-[0_0_15px_rgba(233,138,224,0.2)]">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#E98AE0]">
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    stroke="url(#footEmblemGrad)"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" fill="#E98AE0" fillOpacity="0.4" />
                  <defs>
                    <linearGradient id="footEmblemGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#E98AE0" />
                      <stop offset="0.5" stopColor="#C049D9" />
                      <stop offset="1" stopColor="#7928CA" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                LIVELIHOOD<span className="text-[#E98AE0]">SAATHI</span>{' '}
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#E98AE0] to-[#7928CA] font-bold text-white shadow-xs">
                  AI
                </span>
              </span>
            </div>
            <p className="text-xs text-[#A7A7A7] leading-relaxed max-w-md">
              LivelihoodSaathi AI bridges the digital divide for rural and urban youth across India.
              Using multilingual voice AI in Tamil and English, we provide actionable guidance, skill diagnostics,
              and direct links to accredited government-subsidized learning pathways.
            </p>
            <div className="flex items-center gap-3 text-xs text-[#A7A7A7] pt-1">
              <span className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-amber-400" /> PMKVY &amp; SWAYAM Aligned
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-[#E98AE0]" /> Verified Certifications
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="text-[#A7A7A7] hover:text-[#E98AE0] transition">
                  {t('nav_dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/voice-assistant" className="hover:text-[#E98AE0] transition flex items-center gap-1 text-[#F29AD9]">
                  <Sparkles className="h-3 w-3" /> {t('nav_voice')}
                </Link>
              </li>
              <li>
                <Link href="/assessment" className="text-[#A7A7A7] hover:text-[#E98AE0] transition">
                  {t('nav_assessment')}
                </Link>
              </li>
              <li>
                <Link href="/skills" className="text-[#A7A7A7] hover:text-[#E98AE0] transition">
                  {t('nav_skills')}
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-[#A7A7A7] hover:text-[#E98AE0] transition">
                  {t('nav_courses')}
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-[#A7A7A7] hover:text-[#E98AE0] transition">
                  {t('nav_roadmap')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Languages & Inclusion */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Multilingual Voice
            </h4>
            <ul className="space-y-2 text-xs text-[#A7A7A7]">
              <li>தமிழ் (Tamil) Speech STT &amp; TTS</li>
              <li>Indian English Career Mentoring</li>
              <li>Tamil-English (Tanglish) Natural Interaction</li>
              <li>Dialect-tolerant real-time acoustic pipeline</li>
            </ul>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-[#A7A7A7]/70">
              Low-bandwidth optimized (16 kHz PCM, 32ms frames).
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A7A7A7] gap-3">
          <p>© {new Date().getFullYear()} LIVELIHOODSAATHI AI. Empowering India&apos;s youth with skills and future-ready livelihoods.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-[#E98AE0] fill-[#E98AE0]" /> for inclusive education &amp; employment
          </p>
        </div>
      </div>
    </footer>
  );
};

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Mic,
  Compass,
  BookOpen,
  Sparkles,
  User as UserIcon,
  Menu,
  X,
  Bookmark,
  History,
  Settings,
  GraduationCap,
  Globe,
  LogOut,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';

interface NavbarProps {
  onOpenVoiceModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenVoiceModal }) => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { currentLanguage, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: t('nav_dashboard'), icon: Compass },
    { href: '/voice-assistant', label: t('nav_voice'), icon: Mic, highlight: true },
    { href: '/chat', label: t('nav_chat'), icon: Sparkles },
    { href: '/skills', label: t('nav_skills'), icon: Layers },
    { href: '/courses', label: t('nav_courses'), icon: BookOpen },
    { href: '/roadmap', label: t('nav_roadmap'), icon: Compass },
    { href: '/assessment', label: t('nav_assessment'), icon: GraduationCap },
  ];

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090909]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#160B24] border border-[#E98AE0]/30 shadow-[0_0_15px_rgba(233,138,224,0.2)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(233,138,224,0.4)]">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#E98AE0]">
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                stroke="url(#navEmblemGrad)"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" fill="#E98AE0" fillOpacity="0.4" />
              <defs>
                <linearGradient id="navEmblemGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E98AE0" />
                  <stop offset="0.5" stopColor="#C049D9" />
                  <stop offset="1" stopColor="#7928CA" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white">
                LIVELIHOOD<span className="text-[#E98AE0]">SAATHI</span>
              </span>
              <span className="rounded-md bg-gradient-to-r from-[#E98AE0] to-[#7928CA] px-1.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[10px] font-medium text-[#A7A7A7] hidden sm:block">
              {t('brand_tagline')}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white/10 text-[#E98AE0] font-bold border border-[#E98AE0]/30 shadow-xs'
                    : 'text-[#A7A7A7] hover:bg-white/5 hover:text-white'
                } ${link.highlight ? 'text-[#F29AD9] hover:text-[#E98AE0]' : ''}`}
              >
                <Icon className={`h-4 w-4 ${link.highlight ? 'text-[#E98AE0]' : ''}`} />
                <span>{link.label}</span>
                {link.highlight && (
                  <span className="flex h-2 w-2 rounded-full bg-[#E98AE0] animate-ping" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Voice Trigger Pill */}
          <button
            onClick={() => onOpenVoiceModal?.()}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E98AE0] via-[#C049D9] to-[#7928CA] px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(233,138,224,0.3)] hover:shadow-[0_0_20px_rgba(233,138,224,0.5)] transition-all hover:scale-102"
            title="Start Voice Assistant"
          >
            <Mic className="h-3.5 w-3.5 text-white animate-pulse" />
            <span>Voice Guide</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setUserDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#080808] px-2.5 py-1.5 text-xs font-medium text-white hover:border-[#E98AE0]/40 transition"
              aria-label="Select Language"
            >
              <Globe className="h-3.5 w-3.5 text-[#E98AE0]" />
              <span>{currentLangObj.nativeLabel}</span>
              <ChevronDown className="h-3 w-3 text-[#A7A7A7]" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-[#121118] py-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1 text-[10px] font-bold text-[#A7A7A7] uppercase tracking-wider">
                  Select Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs text-left transition ${
                      currentLanguage === lang.code
                        ? 'bg-[#E98AE0]/15 font-bold text-[#E98AE0]'
                        : 'text-[#A7A7A7] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeLabel}</span>
                    </div>
                    <span className="text-[10px] text-[#A7A7A7]">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Auth */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setLangDropdownOpen(false);
                }}
                className="flex items-center gap-2 rounded-full border border-white/15 p-1 hover:border-[#E98AE0]/60 transition"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#160B24] to-[#7928CA] font-bold text-[#E98AE0] text-xs border border-[#E98AE0]/40">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#121118] py-2 shadow-2xl backdrop-blur-xl z-50">
                  <div className="border-b border-white/10 px-3 pb-2">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-[#A7A7A7] truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-[#A7A7A7] hover:bg-white/5 hover:text-white transition"
                    >
                      <UserIcon className="h-3.5 w-3.5 text-[#E98AE0]" />
                      <span>My Profile &amp; Skills</span>
                    </Link>
                    <Link
                      href="/saved"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-[#A7A7A7] hover:bg-white/5 hover:text-white transition"
                    >
                      <Bookmark className="h-3.5 w-3.5 text-[#E98AE0]" />
                      <span>{t('nav_saved')}</span>
                    </Link>
                    <Link
                      href="/history"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-[#A7A7A7] hover:bg-white/5 hover:text-white transition"
                    >
                      <History className="h-3.5 w-3.5 text-[#E98AE0]" />
                      <span>{t('nav_history')}</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-[#A7A7A7] hover:bg-white/5 hover:text-white transition"
                    >
                      <Settings className="h-3.5 w-3.5 text-[#E98AE0]" />
                      <span>{t('nav_settings')}</span>
                    </Link>
                  </div>
                  <div className="border-t border-white/10 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-[#A7A7A7] hover:text-white hover:bg-white/5 transition"
              >
                {t('login_btn')}
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#7928CA] px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(233,138,224,0.3)] hover:scale-102 transition"
              >
                {t('register_btn')}
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden items-center justify-center rounded-xl p-2 text-[#A7A7A7] hover:text-white hover:bg-white/5"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#090909] px-4 pt-3 pb-6 space-y-1 shadow-2xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? 'bg-white/10 text-[#E98AE0] font-bold border border-[#E98AE0]/30'
                    : 'text-[#A7A7A7] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <Link
              href="/saved"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[#A7A7A7] hover:bg-white/5 hover:text-white"
            >
              <Bookmark className="h-4 w-4" />
              <span>{t('nav_saved')}</span>
            </Link>
            <Link
              href="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[#A7A7A7] hover:bg-white/5 hover:text-white"
            >
              <History className="h-4 w-4" />
              <span>{t('nav_history')}</span>
            </Link>
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[#A7A7A7] hover:bg-white/5 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              <span>{t('nav_settings')}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

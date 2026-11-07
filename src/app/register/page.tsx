'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Globe,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  Award,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { LanguageCode } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [lang, setLang] = useState<LanguageCode>('ta-IN');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const isFormValid = name.trim().length > 0 && email.trim().length > 0 && password.length >= 6;

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Name, email, and password are required.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const success = await register(name, email, password, phone);
      if (success) {
        router.push('/onboarding');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090909] text-white flex flex-col lg:flex-row overflow-x-hidden selection:bg-[#E98AE0] selection:text-black">
      {/* =========================================================================
          LEFT PANEL - DARK REGISTRATION
          ========================================================================= */}
      <div className="w-full lg:w-[48%] xl:w-[45%] bg-[#090909] border-r border-white/5 flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative z-10 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 w-full">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#160B24] border border-[#E98AE0]/30 shadow-[0_0_20px_rgba(233,138,224,0.25)] transition-all duration-300 group-hover:scale-105">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-[#E98AE0]">
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  stroke="url(#regEmblemGrad)"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" fill="#E98AE0" fillOpacity="0.4" />
                <defs>
                  <linearGradient id="regEmblemGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E98AE0" />
                    <stop offset="0.5" stopColor="#C049D9" />
                    <stop offset="1" stopColor="#7928CA" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-white font-sans">
                  LIVELIHOODSAATHI
                </span>
                <span className="rounded-md bg-gradient-to-r from-[#E98AE0] to-[#7928CA] px-1.5 py-0.5 text-[10px] font-black text-white tracking-widest shadow-xs">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#A7A7A7]">
                Your Skills. Your Future. Your Voice.
              </p>
            </div>
          </Link>

          {/* Language Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#080808] px-3 py-1.5 text-xs font-medium text-white hover:border-[#E98AE0]/40 transition"
              aria-label="Select Language"
            >
              <Globe className="h-3.5 w-3.5 text-[#E98AE0]" />
              <span className="text-xs">{currentLangObj.nativeLabel}</span>
              <ChevronDown className="h-3 w-3 text-[#A7A7A7]" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-[#121118] py-1.5 shadow-2xl backdrop-blur-xl z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-[#A7A7A7] uppercase tracking-wider">
                  Choose Language
                </div>
                {SUPPORTED_LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setLanguage(item.code);
                      setLang(item.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs text-left transition ${
                      currentLanguage === item.code
                        ? 'bg-[#E98AE0]/15 font-bold text-[#E98AE0]'
                        : 'text-[#A7A7A7] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.flag}</span>
                      <span>{item.nativeLabel}</span>
                    </div>
                    <span className="text-[10px] text-[#A7A7A7]">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Main Register Form Container */}
        <div className="my-auto py-8 sm:py-10 max-w-md w-full mx-auto animate-fade-in-up">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Create Your Account
            </h1>
            <p className="mt-2 text-sm text-[#A7A7A7] leading-relaxed">
              Start your personalized livelihood pathway with multilingual AI guidance.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#A7A7A7] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#A7A7A7]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shwetha S"
                  className="w-full rounded-2xl border border-white/10 bg-[#080808] py-3 pl-10 pr-4 text-sm text-white placeholder:text-[#A7A7A7]/50 focus:border-[#E98AE0] focus:bg-[#0c0c0e] focus:outline-none focus:ring-2 focus:ring-[#E98AE0]/30 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#A7A7A7] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#A7A7A7]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-[#080808] py-3 pl-10 pr-4 text-sm text-white placeholder:text-[#A7A7A7]/50 focus:border-[#E98AE0] focus:bg-[#0c0c0e] focus:outline-none focus:ring-2 focus:ring-[#E98AE0]/30 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-[#A7A7A7] mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[#A7A7A7]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-2xl border border-white/10 bg-[#080808] py-3 pl-10 pr-4 text-sm text-white placeholder:text-[#A7A7A7]/50 focus:border-[#E98AE0] focus:bg-[#0c0c0e] focus:outline-none focus:ring-2 focus:ring-[#E98AE0]/30 transition-all duration-200"
                />
              </div>
            </div>

            {/* Primary Language */}
            <div>
              <label className="block text-xs font-semibold text-[#A7A7A7] mb-1">
                Preferred Language for Voice Assistant
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-[#A7A7A7]" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as LanguageCode)}
                  className="w-full rounded-2xl border border-white/10 bg-[#080808] py-3 pl-10 pr-4 text-sm text-white focus:border-[#E98AE0] focus:bg-[#0c0c0e] focus:outline-none focus:ring-2 focus:ring-[#E98AE0]/30 transition-all duration-200"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-[#121118] text-white">
                      {l.flag} {l.nativeLabel} ({l.label})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#A7A7A7] mb-1">
                Password (minimum 6 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#A7A7A7]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-[#080808] py-3 pl-10 pr-11 text-sm text-white placeholder:text-[#A7A7A7]/50 focus:border-[#E98AE0] focus:bg-[#0c0c0e] focus:outline-none focus:ring-2 focus:ring-[#E98AE0]/30 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#A7A7A7] hover:text-[#E98AE0] transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-[#2a0e1b] p-3 text-xs text-[#ff8ba7] border border-[#ff4d6d]/30 animate-fade-in-up">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#ff4d6d]" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2.5 rounded-2xl py-3.5 px-4 text-sm font-bold transition-all duration-300 ${
                isFormValid
                  ? 'bg-gradient-to-r from-[#E98AE0] via-[#C049D9] to-[#7928CA] text-white shadow-[0_0_25px_rgba(233,138,224,0.35)] hover:shadow-[0_0_35px_rgba(233,138,224,0.55)] hover:scale-[1.01]'
                  : 'bg-[#18181c] text-[#A7A7A7] border border-white/10 hover:bg-[#202026] hover:text-white'
              } disabled:opacity-60 cursor-pointer`}
            >
              <span>{isLoading ? 'Creating Account...' : 'Continue to Profile Setup'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#A7A7A7]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-[#F29AD9] hover:text-white hover:underline transition"
            >
              Sign In here
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-6 border-t border-white/5 flex items-center justify-between text-[11px] text-[#A7A7A7]">
          <span>© {new Date().getFullYear()} LIVELIHOODSAATHI AI</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-[#E98AE0]" /> 100% Free &amp; Government Aligned
          </span>
        </footer>
      </div>

      {/* =========================================================================
          RIGHT PANEL - SHOWCASE
          ========================================================================= */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-10 lg:p-14 relative overflow-hidden bg-gradient-to-br from-[#160B24] via-[#0c0617] to-[#090909]">
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-radial-gradient from-[#E98AE0]/15 via-[#7928CA]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#E98AE0]" />
            <span className="font-semibold text-white">Youth Employment &amp; Upskilling</span>
          </div>
          <span className="text-xs text-[#A7A7A7] font-mono">Tamil Nadu SRLM Supported</span>
        </div>

        <div className="relative z-10 my-auto py-6 max-w-xl">
          <div className="space-y-3">
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Unlock your true potential.
            </h2>
            <div className="text-3xl lg:text-5xl font-black tracking-tight leading-[1.15] bg-gradient-to-r from-[#E98AE0] via-[#F29AD9] to-[#C049D9] bg-clip-text text-transparent">
              Smart career roadmaps await.
            </div>
            <p className="text-[#A7A7A7] text-sm lg:text-base leading-relaxed pt-2">
              Join thousands of learners discovering subsidized courses, hands-on portfolios, and real jobs powered by AI.
            </p>
          </div>

          {/* Benefits Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
            <div className="rounded-2xl border border-white/10 bg-[#121118]/80 p-4 backdrop-blur-md">
              <Award className="h-5 w-5 text-[#E98AE0] mb-2" />
              <h4 className="text-xs font-bold text-white">Government Subsidies</h4>
              <p className="text-[11px] text-[#A7A7A7] mt-1">Direct access to TNSDC, SWAYAM, and PMKVY programs.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#121118]/80 p-4 backdrop-blur-md">
              <Zap className="h-5 w-5 text-amber-400 mb-2" />
              <h4 className="text-xs font-bold text-white">AI Skill Diagnostics</h4>
              <p className="text-[11px] text-[#A7A7A7] mt-1">Get custom roadmaps tailored to regional salary trends.</p>
            </div>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#E98AE0] via-[#C049D9] to-[#7928CA] px-7 py-3.5 text-xs font-bold text-white shadow-[0_0_25px_rgba(233,138,224,0.4)] hover:shadow-[0_0_35px_rgba(233,138,224,0.6)] hover:scale-105 transition-all duration-300"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-[#A7A7A7]">
          <span>Free Forever For Learners</span>
          <span>Verified Skill Certificates</span>
        </div>
      </div>
    </div>
  );
}

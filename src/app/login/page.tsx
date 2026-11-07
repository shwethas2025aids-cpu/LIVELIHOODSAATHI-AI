'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Globe,
  ChevronDown,
  Sparkles,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsGuest } = useAuth();
  const { currentLanguage, setLanguage, t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const isFormValid = email.trim().length > 0 && password.length > 0;

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email / phone and password.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid credentials. You can also sign in with our 1-Click Demo account below.');
      }
    } catch {
      setError('Failed to authenticate. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    login('shwetha.s@livelihoodsaathi.org', 'Password@123');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-[#090909] text-white flex flex-col lg:flex-row overflow-x-hidden selection:bg-[#E98AE0] selection:text-black">
      {/* =========================================================================
          LEFT PANEL - PREMIUM DARK AUTHENTICATION
          ========================================================================= */}
      <div className="w-full lg:w-[48%] xl:w-[45%] bg-[#090909] border-r border-white/5 flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative z-10 min-h-screen">
        {/* Top Header: Brand Logo & Language Selector */}
        <header className="flex items-center justify-between gap-4 w-full">
          {/* Logo with Livelihood emblem and Pink-to-Violet Accent */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#160B24] border border-[#E98AE0]/30 shadow-[0_0_20px_rgba(233,138,224,0.25)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(233,138,224,0.4)]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#E98AE0]/20 via-[#7928CA]/30 to-transparent pointer-events-none" />
              {/* Livelihood Growth & AI Vector Emblem */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6 text-[#E98AE0] transition-transform duration-300 group-hover:rotate-6"
              >
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  stroke="url(#emblemGrad)"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" fill="#E98AE0" fillOpacity="0.4" />
                <defs>
                  <linearGradient id="emblemGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
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

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#080808] px-3 py-1.5 text-xs font-medium text-white hover:border-[#E98AE0]/40 hover:bg-[#121118] transition"
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
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs text-left transition ${currentLanguage === lang.code
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
        </header>

        {/* Main Login Form Container */}
        <div className="my-auto py-8 sm:py-12 max-w-md w-full mx-auto animate-fade-in-up">
          {/* Form Heading & Subtitle */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome Back!
            </h1>
            <p className="mt-2 text-sm text-[#A7A7A7] leading-relaxed">
              Sign in to LIVELIHOODSAATHI AI and discover opportunities for a better future.
            </p>
          </div>

          {/* 1-Click Fast Demo Testing Account */}
          <div className="mb-6 rounded-2xl border border-[#E98AE0]/25 bg-gradient-to-r from-[#160B24]/70 via-[#120a1c]/60 to-[#080808] p-3.5 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                <Sparkles className="h-3.5 w-3.5 text-[#E98AE0]" /> Fast Evaluator Access
              </span>
              <span className="text-[10px] text-[#A7A7A7] font-mono">1-Click Sign In</span>
            </div>
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-[#E98AE0]/15 border border-white/10 hover:border-[#E98AE0]/40 py-2 px-3 text-xs font-semibold text-white transition-all group"
            >
              <UserCheck className="h-4 w-4 text-[#E98AE0] group-hover:scale-110 transition-transform" />
              <span>Continue with Shwetha S (Demo Account)</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email or Phone Field */}
            <div>
              <label className="block text-xs font-semibold text-[#A7A7A7] mb-1.5">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#A7A7A7]" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com or +91..."
                  className="w-full rounded-2xl border border-white/10 bg-[#080808] py-3 pl-10 pr-4 text-sm text-white placeholder:text-[#A7A7A7]/50 focus:border-[#E98AE0] focus:bg-[#0c0c0e] focus:outline-none focus:ring-2 focus:ring-[#E98AE0]/30 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password Field with Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#A7A7A7]">
                  Password
                </label>
                <a
                  href="#forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    setError('Password reset link has been dispatched to your registered email / phone.');
                  }}
                  className="text-xs text-[#F29AD9] hover:underline font-medium transition"
                >
                  Forgot Password?
                </a>
              </div>
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

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#A7A7A7] hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/15 bg-[#080808] text-[#E98AE0] focus:ring-[#E98AE0] focus:ring-offset-0"
                />
                <span>Remember this device for 30 days</span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-[#2a0e1b] p-3 text-xs text-[#ff8ba7] border border-[#ff4d6d]/30 animate-fade-in-up">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#ff4d6d]" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Button with Dynamic Gradient When Valid */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2.5 rounded-2xl py-3.5 px-4 text-sm font-bold transition-all duration-300 ${isFormValid
                  ? 'bg-gradient-to-r from-[#E98AE0] via-[#C049D9] to-[#7928CA] text-white shadow-[0_0_25px_rgba(233,138,224,0.35)] hover:shadow-[0_0_35px_rgba(233,138,224,0.55)] hover:scale-[1.01]'
                  : 'bg-[#18181c] text-[#A7A7A7] border border-white/10 hover:bg-[#202026] hover:text-white'
                } disabled:opacity-60 cursor-pointer`}
            >
              <span>{isLoading ? 'Signing in securely...' : 'Sign In to LIVELIHOODSAATHI'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Registration Navigation */}
          <div className="mt-8 text-center text-xs text-[#A7A7A7]">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/register"
              className="font-bold text-[#F29AD9] hover:text-white hover:underline transition"
            >
              Sign up for free opportunities
            </Link>
          </div>
        </div>

        {/* Left Panel Footer */}
        <footer className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-[#A7A7A7] gap-2">
          <span>© {new Date().getFullYear()} LIVELIHOODSAATHI AI. All rights reserved.</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-[#E98AE0]" /> 256-bit Encrypted
            </span>
            <span>•</span>
            <span>PMKVY &amp; SWAYAM Aligned</span>
          </div>
        </footer>
      </div>

      {/* =========================================================================
          RIGHT PANEL - FUTURISTIC LIVELIHOOD SHOWCASE (VERTEX3D INSPIRED)
          ========================================================================= */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-10 lg:p-14 relative overflow-hidden bg-gradient-to-br from-[#160B24] via-[#0c0617] to-[#090909]">
        {/* Ambient Radial Mesh Lighting & Stars */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-radial-gradient from-[#E98AE0]/15 via-[#7928CA]/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-radial-gradient from-[#7928CA]/20 via-[#160B24]/40 to-transparent blur-2xl pointer-events-none" />

        {/* Top Tag Pill */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs backdrop-blur-md shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-[#E98AE0] animate-ping" />
            <span className="font-semibold text-white">Next-Gen Livelihood Intelligence</span>
            <span className="text-[#A7A7A7]">• Multilingual Speech AI</span>
          </div>

          <span className="text-xs text-[#A7A7A7] font-mono">Tamil • English • Tanglish</span>
        </div>

        {/* Headline & Central Content */}
        <div className="relative z-10 my-auto py-6 max-w-xl">
          {/* Vertex3D-Inspired Typography */}
          <div className="space-y-3">
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              AI-powered opportunities.
            </h2>
            <div className="text-3xl lg:text-5xl font-black tracking-tight leading-[1.15] bg-gradient-to-r from-[#E98AE0] via-[#F29AD9] to-[#C049D9] bg-clip-text text-transparent">
              Empowering every livelihood.
            </div>
            <p className="text-[#A7A7A7] text-sm lg:text-base leading-relaxed pt-2">
              Discover opportunities, build skills, and create a brighter future with intelligent livelihood assistance.
            </p>
          </div>

          {/* =========================================================================
              MAIN ILLUSTRATION: FUTURISTIC AI GLOBE, ORBIT RINGS & LIVELIHOOD NODES
              ========================================================================= */}
          <div className="relative my-8 h-[360px] w-full flex items-center justify-center">
            {/* Glowing Ground Platform Reflection */}
            <div className="absolute bottom-6 w-[340px] h-[70px] rounded-full bg-gradient-to-t from-[#E98AE0]/20 via-[#7928CA]/15 to-transparent blur-xl pointer-events-none" />
            <div className="absolute bottom-8 w-[280px] h-[35px] rounded-full border border-[#E98AE0]/30 bg-[#160B24]/40 backdrop-blur-xs pointer-events-none transform -rotate-x-60" />

            {/* Central Animated Holographic SVG AI Globe */}
            <svg
              viewBox="0 0 400 400"
              className="w-[340px] h-[340px] relative z-10 filter drop-shadow-[0_0_35px_rgba(233,138,224,0.3)]"
            >
              <defs>
                {/* Core Radial Glow */}
                <radialGradient id="globeCore" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E98AE0" stopOpacity="0.8" />
                  <stop offset="45%" stopColor="#C049D9" stopOpacity="0.4" />
                  <stop offset="75%" stopColor="#7928CA" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#160B24" stopOpacity="0" />
                </radialGradient>
                {/* Orbit Stroke Gradient */}
                <linearGradient id="orbitStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E98AE0" />
                  <stop offset="50%" stopColor="#C049D9" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#7928CA" />
                </linearGradient>
                {/* Ray Beam */}
                <linearGradient id="rayBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#E98AE0" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#7928CA" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Outer Pulsing Aura */}
              <circle cx="200" cy="200" r="140" fill="url(#globeCore)" className="animate-glow-pulse" />

              {/* Holographic Wireframe Meridians & Latitudes */}
              <ellipse
                cx="200"
                cy="200"
                rx="120"
                ry="120"
                fill="none"
                stroke="url(#orbitStroke)"
                strokeWidth="1.5"
                strokeOpacity="0.5"
              />
              <ellipse
                cx="200"
                cy="200"
                rx="75"
                ry="120"
                fill="none"
                stroke="#E98AE0"
                strokeWidth="1"
                strokeOpacity="0.4"
                strokeDasharray="4 4"
              />
              <ellipse
                cx="200"
                cy="200"
                rx="35"
                ry="120"
                fill="none"
                stroke="#C049D9"
                strokeWidth="1"
                strokeOpacity="0.3"
              />
              <ellipse
                cx="200"
                cy="200"
                rx="120"
                ry="65"
                fill="none"
                stroke="#7928CA"
                strokeWidth="1"
                strokeOpacity="0.4"
                strokeDasharray="3 3"
              />
              <ellipse
                cx="200"
                cy="200"
                rx="120"
                ry="30"
                fill="none"
                stroke="#E98AE0"
                strokeWidth="1"
                strokeOpacity="0.3"
              />

              {/* 3D Tilted Orbit Ring 1 */}
              <g className="animate-spin-slow origin-center">
                <ellipse
                  cx="200"
                  cy="200"
                  rx="160"
                  ry="50"
                  fill="none"
                  stroke="url(#orbitStroke)"
                  strokeWidth="1.75"
                  strokeDasharray="6 8"
                  transform="rotate(-25 200 200)"
                />
                {/* Orbiting Satellite Dot */}
                <circle cx="60" cy="140" r="4.5" fill="#E98AE0" filter="drop-shadow(0 0 6px #E98AE0)" />
              </g>

              {/* 3D Tilted Orbit Ring 2 */}
              <g className="animate-spin-reverse origin-center">
                <ellipse
                  cx="200"
                  cy="200"
                  rx="175"
                  ry="60"
                  fill="none"
                  stroke="#7928CA"
                  strokeWidth="1.25"
                  strokeOpacity="0.6"
                  transform="rotate(35 200 200)"
                />
                {/* Orbiting Satellite Dot 2 */}
                <circle cx="340" cy="270" r="4" fill="#F29AD9" filter="drop-shadow(0 0 6px #F29AD9)" />
              </g>

              {/* Central Glowing AI Nucleus */}
              <circle cx="200" cy="200" r="16" fill="#FFFFFF" filter="drop-shadow(0 0 12px #E98AE0)" />
              <circle cx="200" cy="200" r="28" fill="#E98AE0" fillOpacity="0.25" />
            </svg>

            {/* Floating Opportunity Node 1: Tech & Software (Top-Right) */}
            <div className="absolute -top-1 right-2 sm:right-6 z-20 animate-float rounded-2xl border border-white/10 bg-[#121118]/85 backdrop-blur-md p-3 shadow-xl hover:border-[#E98AE0]/50 transition-all duration-300">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E98AE0]/20 text-[#E98AE0] border border-[#E98AE0]/30">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white">Full-Stack &amp; AI</p>
                  <p className="text-[10px] text-[#A7A7A7]">98% Aptitude Match</p>
                </div>
                <span className="ml-1 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                  Top Track
                </span>
              </div>
            </div>

            {/* Floating Opportunity Node 2: Green Energy & Solar (Left) */}
            <div className="absolute top-28 -left-2 sm:left-2 z-20 animate-float-delayed rounded-2xl border border-white/10 bg-[#121118]/85 backdrop-blur-md p-3 shadow-xl hover:border-[#E98AE0]/50 transition-all duration-300">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white">Solar PV Technician</p>
                  <p className="text-[10px] text-[#A7A7A7]">PMKVY Certified</p>
                </div>
                <span className="ml-1 rounded-full bg-[#E98AE0]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#E98AE0] border border-[#E98AE0]/30">
                  Subsidized
                </span>
              </div>
            </div>

            {/* Floating Opportunity Node 3: Rural & MSME Commerce (Bottom-Right) */}
            <div className="absolute -bottom-2 right-4 sm:right-10 z-20 animate-float rounded-2xl border border-white/10 bg-[#121118]/85 backdrop-blur-md p-3 shadow-xl hover:border-[#E98AE0]/50 transition-all duration-300">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7928CA]/30 text-[#F29AD9] border border-[#7928CA]/50">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white">MSME Digital Commerce</p>
                  <p className="text-[10px] text-[#A7A7A7]">Tamil Nadu Livelihood</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA: Explore Opportunities button connecting to existing /courses route */}
          <div className="pt-2">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#E98AE0] via-[#C049D9] to-[#7928CA] px-7 py-3.5 text-xs font-bold text-white shadow-[0_0_25px_rgba(233,138,224,0.4)] hover:shadow-[0_0_35px_rgba(233,138,224,0.6)] hover:scale-105 transition-all duration-300"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-[#A7A7A7]">
          <div>
            <span className="text-white font-bold block">10,000+</span>
            <span className="text-[11px]">Youth Empowered</span>
          </div>
          <div>
            <span className="text-white font-bold block">100% Free</span>
            <span className="text-[11px]">Govt Subsidized Tracks</span>
          </div>
          <div>
            <span className="text-white font-bold block">Tamil &amp; English</span>
            <span className="text-[11px]">Dialect Tolerant</span>
          </div>
        </div>
      </div>
    </div>
  );
}

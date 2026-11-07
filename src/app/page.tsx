'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mic,
  Sparkles,
  ArrowRight,
  GraduationCap,
  TrendingUp,
  Award,
  ShieldCheck,
  CheckCircle2,
  Play,
  Volume2,
  Compass,
  Cpu,
  SunMedium,
  Zap,
  ShoppingBag,
  HeartPulse,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { VoiceInteractionModal } from '@/components/voice/VoiceInteractionModal';
import { AudioRecorderModal } from '@/components/audio/AudioRecorderModal';
import { INITIAL_SKILLS, INITIAL_COURSES, INITIAL_PATHWAYS } from '@/lib/constants';
import { SkillCard } from '@/components/cards/SkillCard';
import { CourseCard } from '@/components/cards/CourseCard';
import { PathwayCard } from '@/components/cards/PathwayCard';

export default function HomePage() {
  const { currentLanguage, t } = useLanguage();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isAudioUploadOpen, setIsAudioUploadOpen] = useState(false);

  const samplePrompts = [
    {
      lang: 'தமிழ்',
      query: 'எனக்கு IT துறையில் நல்ல சம்பளத்துடன் வேலை கிடைக்க என்னென்ன திறன்கள் தேவை?',
      intent: 'Data & Software Track',
    },
    {
      lang: 'English',
      query: 'How can I become a certified Solar & Green Energy Technician through PMKVY?',
      intent: 'Renewable Energy',
    },
    {
      lang: 'Tanglish',
      query: 'College mudichuten, EV vehicle maintenance course enga free ah padikkalam?',
      intent: 'EV & Smart Mobility',
    },
    {
      lang: 'தமிழ்',
      query: 'டிஜிட்டல் மார்க்கெட்டிங் மூலம் உள்ளூர் சிறு தொழில்களுக்கு விளம்பரம் செய்வது எப்படி?',
      intent: 'MSME Commerce',
    },
  ];

  return (
    <div className="space-y-20 pb-20 bg-[#090909] text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-white/10">
        {/* Futuristic Ambient Violet Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-gradient-to-b from-[#9333EA]/20 via-[#E98AE0]/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E98AE0]/30 bg-[#160B24]/80 backdrop-blur-md px-4 py-1.5 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#E98AE0] animate-ping" />
              <span className="text-xs font-semibold text-[#E98AE0]">
                AI Multilingual Career &amp; Livelihood Guidance Platform
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
              LIVELIHOOD<span className="bg-gradient-to-r from-[#E98AE0] to-[#A855F7] bg-clip-text text-transparent">SAATHI</span> AI
            </h1>

            <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-[#E98AE0] to-[#C084FC] bg-clip-text text-transparent">
              {t('brand_tagline')}
            </p>

            <p className="text-base text-[#A7A7A7] max-w-2xl mx-auto leading-relaxed">
              Communicate naturally via <strong className="text-white">Voice</strong> or <strong className="text-white">Text</strong> in Tamil, English, and Tanglish.
              Discover your hidden aptitudes, master high-demand future skills, and unlock certified government-subsidized employment roadmaps.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#E98AE0] via-[#C084FC] to-[#9333EA] px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-pink-500/20 hover:opacity-95 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Mic className="h-5 w-5 text-black animate-pulse" />
                <span>Start Speaking (குரல் வழிகாட்டி)</span>
              </button>

              <Link
                href="/assessment"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#121118] px-6 py-3.5 text-sm font-semibold text-white shadow-xs hover:border-[#E98AE0]/50 hover:bg-[#1A1824] transition-all"
              >
                <GraduationCap className="h-5 w-5 text-[#E98AE0]" />
                <span>{t('start_assessment')}</span>
              </Link>

              <button
                onClick={() => setIsAudioUploadOpen(true)}
                className="w-full sm:w-auto text-xs font-medium text-[#A7A7A7] hover:text-[#E98AE0] py-2 sm:py-0 transition"
              >
                Record or Upload Audio File
              </button>
            </div>

            {/* Trust badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#A7A7A7]">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#E98AE0]" /> 16kHz PCM Real-time STT
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#E98AE0]" /> SWAYAM &amp; PMKVY Free Courses
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#E98AE0]" /> Tamil &amp; English Speech Synthesis
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE VOICE PROMPTS SHOWCASE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-[#121118] p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#160B24] rounded-full blur-3xl opacity-50 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative z-10">
            <div>
              <span className="rounded-full bg-[#160B24] border border-[#E98AE0]/30 px-3 py-1 text-xs font-semibold text-[#E98AE0]">
                Interactive Voice Prompts
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                Ask in your mother tongue. Hear the future.
              </h2>
              <p className="text-xs sm:text-sm text-[#A7A7A7] mt-1">
                Click any real user question below to launch the voice assistant and experience personalized recommendations.
              </p>
            </div>
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#9333EA] px-4 py-2.5 text-xs font-bold text-black hover:opacity-90 transition cursor-pointer"
            >
              <Mic className="h-4 w-4 text-black" />
              <span>Open Voice Studio</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {samplePrompts.map((p, i) => (
              <div
                key={i}
                onClick={() => setIsVoiceOpen(true)}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0A090D] p-5 hover:border-[#E98AE0]/50 hover:bg-[#160B24]/40 hover:shadow-lg hover:shadow-purple-950/30 cursor-pointer transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="rounded bg-[#1A1823] px-2 py-0.5 font-bold text-[#E98AE0] border border-white/10 text-[10px]">
                      {p.lang}
                    </span>
                    <span className="text-[11px] font-semibold text-[#A7A7A7]">
                      {p.intent}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white group-hover:text-[#E98AE0] transition">
                    &ldquo;{p.query}&rdquo;
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-[#E98AE0] font-bold">
                  <span className="flex items-center gap-1">
                    <Play className="h-3 w-3 fill-current" /> Ask Voice Assistant
                  </span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FUTURE-READY LIVELIHOOD DOMAINS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="rounded-full bg-[#160B24] border border-[#E98AE0]/30 px-3 py-1 text-xs font-semibold text-[#E98AE0]">
            High Growth Sectors
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Targeting India&apos;s Fastest-Growing Livelihood Tracks
          </h2>
          <p className="text-xs sm:text-sm text-[#A7A7A7] mt-1">
            Carefully curated industries with massive government support, private investment, and urgent talent shortages.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-[#121118] p-6 space-y-3 hover:border-[#E98AE0]/40 transition group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#160B24] text-[#E98AE0] border border-[#E98AE0]/20 group-hover:scale-105 transition">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Information Technology &amp; AI</h3>
            <p className="text-xs text-[#A7A7A7] leading-relaxed">
              Python automation, web development, cloud computing, and prompt engineering tailored for high school and diploma graduates.
            </p>
            <span className="inline-block text-[11px] font-bold text-[#E98AE0]">+45% Salary Growth</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121118] p-6 space-y-3 hover:border-[#E98AE0]/40 transition group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#160B24] text-emerald-400 border border-emerald-400/20 group-hover:scale-105 transition">
              <SunMedium className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Solar &amp; Renewable Energy</h3>
            <p className="text-xs text-[#A7A7A7] leading-relaxed">
              PM Surya Ghar rooftop solar technician roles, inverter engineering, and self-employed green contracting businesses.
            </p>
            <span className="inline-block text-[11px] font-bold text-emerald-400">+34% Annual Demand</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121118] p-6 space-y-3 hover:border-[#E98AE0]/40 transition group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#160B24] text-amber-400 border border-amber-400/20 group-hover:scale-105 transition">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Electric Vehicles &amp; Smart Mobility</h3>
            <p className="text-xs text-[#A7A7A7] leading-relaxed">
              Lithium battery diagnostics, EV 2-wheeler and 4-wheeler workshop mechanics, and charging station maintenance.
            </p>
            <span className="inline-block text-[11px] font-bold text-amber-400">+50% Hiring Spike</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121118] p-6 space-y-3 hover:border-[#E98AE0]/40 transition group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#160B24] text-sky-400 border border-sky-400/20 group-hover:scale-105 transition">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">MSME Digital &amp; Social Commerce</h3>
            <p className="text-xs text-[#A7A7A7] leading-relaxed">
              Google My Business, local SEO, Instagram boutique sales, WhatsApp catalog marketing, and micro-entrepreneurship.
            </p>
            <span className="inline-block text-[11px] font-bold text-sky-400">Immediate Freelance Income</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121118] p-6 space-y-3 hover:border-[#E98AE0]/40 transition group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#160B24] text-rose-400 border border-rose-400/20 group-hover:scale-105 transition">
              <HeartPulse className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Healthcare &amp; Patient Assistance</h3>
            <p className="text-xs text-[#A7A7A7] leading-relaxed">
              General duty assistant, geriatric home healthcare, and hospital support roles with high stability and dignity of work.
            </p>
            <span className="inline-block text-[11px] font-bold text-rose-400">Recession-Proof Demand</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121118] p-6 space-y-3 hover:border-[#E98AE0]/40 transition group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#160B24] text-[#E98AE0] border border-[#E98AE0]/20 group-hover:scale-105 transition">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Custom AI Diagnostic</h3>
            <p className="text-xs text-[#A7A7A7] leading-relaxed">
              Not sure which one fits? Complete our 3-minute diagnostic assessment to map your natural strengths to exact courses.
            </p>
            <Link
              href="/assessment"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E98AE0] hover:underline"
            >
              Start Free Assessment <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURED SKILLS & COURSES PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Skills Row */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Trending High-Demand Skills
              </h2>
              <p className="text-xs text-[#A7A7A7] mt-0.5">
                Acquire these in 4 to 10 weeks to unlock substantial income leaps.
              </p>
            </div>
            <Link
              href="/skills"
              className="text-xs font-bold text-[#E98AE0] hover:underline flex items-center gap-1"
            >
              View all skills <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_SKILLS.slice(0, 3).map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onExploreSkill={() => setIsVoiceOpen(true)}
              />
            ))}
          </div>
        </div>

        {/* Courses Row */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Verified Free &amp; Subsidized Courses
              </h2>
              <p className="text-xs text-[#A7A7A7] mt-0.5">
                Accredited programs delivered in Tamil and English with recognized certifications.
              </p>
            </div>
            <Link
              href="/courses"
              className="text-xs font-bold text-[#E98AE0] hover:underline flex items-center gap-1"
            >
              Browse all courses <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_COURSES.slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. ROADMAP PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Featured Step-by-Step Career Roadmap
            </h2>
            <p className="text-xs text-[#A7A7A7] mt-0.5">
              Clear milestone progression from beginner to job-ready professional.
            </p>
          </div>
          <Link
            href="/roadmap"
            className="text-xs font-bold text-[#E98AE0] hover:underline flex items-center gap-1"
          >
            Explore all roadmaps <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PathwayCard pathway={INITIAL_PATHWAYS[0]} />
          <PathwayCard pathway={INITIAL_PATHWAYS[1]} />
        </div>
      </section>

      {/* 6. BOTTOM CTA BANNER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#160B24] via-[#210E36] to-[#121118] border border-white/10 px-6 py-12 sm:px-12 sm:py-16 text-center shadow-2xl text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#E98AE0]/15 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="rounded-full bg-[#160B24] px-3 py-1 text-xs font-semibold text-[#E98AE0] border border-[#E98AE0]/30">
              100% Free for Learners &amp; Job Seekers
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Discover Your True Career Potential?
            </h2>
            <p className="text-xs sm:text-sm text-[#A7A7A7] leading-relaxed">
              Start with our multilingual voice assistant or complete our 3-minute diagnostic skills test to get instant, tailored guidance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#9333EA] px-6 py-3 text-xs font-bold text-black shadow-lg shadow-pink-500/20 hover:opacity-90 transition cursor-pointer"
              >
                <Mic className="h-4 w-4 text-black" />
                <span>Speak Now in Tamil or English</span>
              </button>
              <Link
                href="/assessment"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-xs font-bold text-white hover:bg-white/10 hover:border-[#E98AE0]/40 transition"
              >
                <GraduationCap className="h-4 w-4 text-[#E98AE0]" />
                <span>Take Skills Assessment</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <VoiceInteractionModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

      <AudioRecorderModal
        isOpen={isAudioUploadOpen}
        onClose={() => setIsAudioUploadOpen(false)}
        onTranscriptSubmitted={() => setIsVoiceOpen(true)}
      />
    </div>
  );
}

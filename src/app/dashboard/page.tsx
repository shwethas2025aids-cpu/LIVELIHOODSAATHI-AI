'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mic,
  Sparkles,
  Compass,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { INITIAL_SKILLS, INITIAL_COURSES, INITIAL_PATHWAYS } from '@/lib/constants';
import { VoiceInteractionModal } from '@/components/voice/VoiceInteractionModal';
import { SkillCard } from '@/components/cards/SkillCard';
import { CourseCard } from '@/components/cards/CourseCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const activePathway = INITIAL_PATHWAYS[0];
  const completedStagesCount = activePathway.stages.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedStagesCount / activePathway.stages.length) * 100);

  const quickPrompts = [
    'எனக்கு பொருத்தமான குறுகிய கால பயிற்சிகள் என்ன?',
    'What skills are trending in Tamil Nadu tech sector?',
    'How do I apply for PMKVY certified solar technician training?',
    'Next.js and React full roadmap for beginners',
  ];

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* 1. TOP GREETING & VOICE LAUNCH HERO */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#160B24] via-[#1a0c2e] to-[#090909] border border-[#E98AE0]/25 p-6 sm:p-10 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-radial-gradient from-[#E98AE0]/15 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/15">
                <Sparkles className="h-3.5 w-3.5 text-[#E98AE0]" />
                <span className="text-white">AI Career Command Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Vanakkam, {user?.name || 'Friend'}!
              </h1>
              <p className="text-xs sm:text-sm text-[#A7A7A7] leading-relaxed">
                Your personalized livelihood track is active for{' '}
                <span className="font-bold text-white underline decoration-[#E98AE0]">
                  {user?.targetCareer || 'Technology & Digital Skills'}
                </span>
                . Speak with Saathi anytime to discover new opportunities, courses, or step-by-step guidance.
              </p>

              {/* Quick Voice Assistant Trigger Button */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsVoiceOpen(true)}
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#E98AE0] via-[#C049D9] to-[#7928CA] px-5 py-3 text-xs font-bold text-white shadow-[0_0_20px_rgba(233,138,224,0.35)] hover:shadow-[0_0_30px_rgba(233,138,224,0.55)] transition-all hover:scale-102"
                >
                  <Mic className="h-4 w-4 text-white animate-pulse" />
                  <span>Talk to Voice Assistant (பேசி அறியவும்)</span>
                </button>

                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-xs font-bold text-white backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition"
                >
                  <Sparkles className="h-4 w-4 text-[#E98AE0]" />
                  <span>Open Text Chat</span>
                </Link>
              </div>
            </div>

            {/* Readiness Score Card */}
            <div className="rounded-2xl bg-[#121118]/80 p-5 backdrop-blur-md border border-white/15 text-center space-y-2 min-w-[220px]">
              <span className="text-[11px] font-bold text-[#A7A7A7] uppercase tracking-wider block">
                Skill Readiness Score
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-black text-white">82%</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  Strong
                </span>
              </div>
              <p className="text-[11px] text-[#A7A7A7]">
                {completedStagesCount} of {activePathway.stages.length} Roadmap Milestones Done
              </p>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#E98AE0] to-[#7928CA] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. QUICK PROMPT PILLS */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-bold text-[#A7A7A7] shrink-0">Try asking Saathi:</span>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => setIsVoiceOpen(true)}
                className="rounded-xl border border-white/10 bg-[#121118] px-3 py-1.5 text-xs text-[#A7A7A7] hover:border-[#E98AE0]/50 hover:bg-[#160B24] hover:text-white transition shadow-xs font-medium"
              >
                &ldquo;{qp}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* 3. ACTIVE ROADMAP PROGRESS BANNER */}
        <div className="rounded-3xl border border-white/10 bg-[#121118]/90 p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <span className="rounded-xl bg-[#160B24] border border-[#E98AE0]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#E98AE0]">
                In-Progress Career Pathway
              </span>
              <h2 className="text-lg font-bold text-white mt-1">
                {activePathway.title}
              </h2>
              <p className="text-xs text-[#A7A7A7]">{activePathway.sector} • Starting Pay {activePathway.avgStartingSalary}</p>
            </div>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F29AD9] hover:text-white transition"
            >
              Full Interactive Roadmap <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Milestone Steps Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {activePathway.stages.map((stage) => (
              <div
                key={stage.step}
                className={`rounded-2xl p-4 border transition ${
                  stage.completed
                    ? 'border-emerald-500/30 bg-emerald-950/20'
                    : 'border-white/10 bg-[#090909]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-[#A7A7A7]">
                    Step {stage.step}
                  </span>
                  {stage.completed ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Done
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-[#A7A7A7]">
                      {stage.timeframe}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-2">
                  {stage.title}
                </h4>
                <p className="text-[11px] text-[#A7A7A7] line-clamp-2 mt-1">
                  {stage.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. RECOMMENDED SKILLS & COURSES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Recommended Skills (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Recommended Skill Upgrades
                </h3>
                <p className="text-xs text-[#A7A7A7]">Based on high industry demand in your region</p>
              </div>
              <Link
                href="/skills"
                className="text-xs font-bold text-[#F29AD9] hover:text-white flex items-center gap-1 transition"
              >
                All Skills <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INITIAL_SKILLS.slice(0, 4).map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onExploreSkill={() => setIsVoiceOpen(true)}
                />
              ))}
            </div>
          </div>

          {/* Right: Curated Courses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Top Subsidized Courses
                </h3>
                <p className="text-xs text-[#A7A7A7]">Free government programs</p>
              </div>
              <Link
                href="/courses"
                className="text-xs font-bold text-[#F29AD9] hover:text-white flex items-center gap-1 transition"
              >
                All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {INITIAL_COURSES.slice(0, 2).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </div>

        {/* Voice Assistant Modal */}
        <VoiceInteractionModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
        />
      </div>
    </div>
  );
}

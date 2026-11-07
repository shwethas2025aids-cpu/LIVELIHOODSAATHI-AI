'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Compass,
  CheckCircle2,
  Circle,
  TrendingUp,
  IndianRupee,
  Clock,
  BookOpen,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Award,
} from 'lucide-react';
import { INITIAL_PATHWAYS, INITIAL_COURSES } from '@/lib/constants';
import { CareerPathway, RoadmapStage } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

function RoadmapContent() {
  const searchParams = useSearchParams();
  const { currentLanguage } = useLanguage();

  const [pathways, setPathways] = useState<CareerPathway[]>(INITIAL_PATHWAYS);
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>(
    searchParams.get('id') || INITIAL_PATHWAYS[0].id
  );

  useEffect(() => {
    const idFromParam = searchParams.get('id');
    if (idFromParam && pathways.some((p) => p.id === idFromParam)) {
      setSelectedPathwayId(idFromParam);
    }
  }, [searchParams, pathways]);

  const activePathway =
    pathways.find((p) => p.id === selectedPathwayId) || pathways[0];

  const handleToggleStageCompletion = (stageStep: number) => {
    const updatedStages = activePathway.stages.map((st) =>
      st.step === stageStep ? { ...st, completed: !st.completed } : st
    );

    const updatedPathway = { ...activePathway, stages: updatedStages };
    setPathways(pathways.map((p) => (p.id === activePathway.id ? updatedPathway : p)));
  };

  const completedCount = activePathway.stages.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / activePathway.stages.length) * 100);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#090909] text-white min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#160B24] border border-[#E98AE0]/30 px-3 py-1 text-xs font-semibold text-[#E98AE0] mb-2">
          <Compass className="h-3.5 w-3.5" />
          <span>Interactive Career Pathways</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Step-by-Step Livelihood Roadmap
        </h1>
        <p className="text-xs sm:text-sm text-[#A7A7A7] mt-1">
          A clear, milestone-driven trajectory from initial basics to certified employment. Check off milestones as you learn.
        </p>
      </div>

      {/* Pathway Switcher Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {pathways.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPathwayId(p.id)}
            className={`shrink-0 rounded-2xl px-4 py-3 text-left border transition cursor-pointer ${
              selectedPathwayId === p.id
                ? 'border-[#E98AE0] bg-[#160B24] shadow-lg shadow-purple-950/40 text-white'
                : 'border-white/10 bg-[#121118] text-slate-300 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase text-[#A7A7A7]">
                {p.sector}
              </span>
              <span className="text-[11px] font-bold text-[#E98AE0]">
                {p.matchScore}% Match
              </span>
            </div>
            <p className="text-xs font-bold text-white mt-1">{p.title}</p>
          </button>
        ))}
      </div>

      {/* Active Pathway Overview Card */}
      <div className="rounded-3xl bg-gradient-to-tr from-[#160B24] via-[#210E36] to-[#121118] border border-white/10 p-6 sm:p-8 text-white shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E98AE0]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="rounded-lg bg-[#090909] px-2.5 py-0.5 text-xs font-bold text-[#E98AE0] border border-[#E98AE0]/30">
              {activePathway.sector}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold mt-2 text-white">
              {activePathway.title}
            </h2>
            <p className="text-xs text-[#A7A7A7] max-w-2xl mt-1 leading-relaxed">
              {activePathway.description}
            </p>
          </div>

          {/* Progress stats */}
          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10 text-center min-w-[180px]">
            <span className="text-[10px] uppercase font-bold text-[#E98AE0] tracking-wider">
              Roadmap Progress
            </span>
            <div className="text-3xl font-extrabold mt-0.5 text-white">{progressPercent}%</div>
            <p className="text-[11px] text-[#A7A7A7]">
              {completedCount} of {activePathway.stages.length} Milestones Done
            </p>
          </div>
        </div>

        {/* Salary & Growth Badges */}
        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs relative z-10">
          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <IndianRupee className="h-4 w-4" /> Starting Pay: {activePathway.avgStartingSalary}
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1 font-semibold text-[#E98AE0]">
            <TrendingUp className="h-4 w-4" /> Sector Growth: {activePathway.growthRate}
          </span>
        </div>
      </div>

      {/* Interactive Milestone Stages Timeline */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white">
          Milestone Breakdown
        </h3>

        <div className="relative border-l-2 border-[#E98AE0]/25 ml-4 pl-6 space-y-8">
          {activePathway.stages.map((stage) => {
            const matchingCourses = INITIAL_COURSES.filter((c) =>
              stage.recommendedCourseIds?.includes(c.id)
            );

            return (
              <div key={stage.step} className="relative group">
                {/* Checkbox Orb on Timeline */}
                <button
                  onClick={() => handleToggleStageCompletion(stage.step)}
                  className={`absolute -left-[35px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 transition hover:scale-110 shadow-sm cursor-pointer ${
                    stage.completed
                      ? 'border-[#E98AE0] bg-gradient-to-r from-[#E98AE0] to-[#9333EA] text-black font-bold'
                      : 'border-white/20 bg-[#121118] text-[#A7A7A7] hover:border-[#E98AE0]'
                  }`}
                  title="Toggle Completion"
                >
                  {stage.completed ? (
                    <CheckCircle2 className="h-4 w-4 fill-current text-black" />
                  ) : (
                    <span className="text-[10px] font-bold text-white">{stage.step}</span>
                  )}
                </button>

                {/* Stage Content Card */}
                <div
                  className={`rounded-2xl border p-5 transition ${
                    stage.completed
                      ? 'border-[#E98AE0]/40 bg-[#160B24]/40 shadow-md'
                      : 'border-white/10 bg-[#121118] hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#E98AE0]">
                      Stage {stage.step} • {stage.timeframe}
                    </span>
                    <button
                      onClick={() => handleToggleStageCompletion(stage.step)}
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                        stage.completed
                          ? 'bg-[#160B24] text-[#E98AE0] border-[#E98AE0]/40'
                          : 'bg-[#1A1823] text-slate-300 border-white/10 hover:border-[#E98AE0]/40'
                      }`}
                    >
                      {stage.completed ? 'Completed ✓' : 'Mark as Complete'}
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-white">
                    {stage.title}
                  </h4>
                  <p className="mt-1 text-xs text-[#A7A7A7] leading-relaxed">
                    {stage.description}
                  </p>

                  {/* Key Actions List */}
                  <div className="mt-4 rounded-xl bg-[#090909] p-3.5 border border-white/10 space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A7A7A7] block">
                      Key Deliverables &amp; Practice:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {stage.keyActions.map((act, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#E98AE0] shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {matchingCourses.length > 0 && (
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-[#160B24] p-3 border border-white/10 text-xs">
                      <div>
                        <span className="font-bold text-white block">
                          Recommended Learning: {matchingCourses[0].title}
                        </span>
                        <span className="text-[11px] text-[#A7A7A7]">
                          {matchingCourses[0].provider} • {matchingCourses[0].duration}
                        </span>
                      </div>
                      <a
                        href={matchingCourses[0].platformUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#E98AE0] to-[#9333EA] px-3 py-1 text-black font-bold text-[11px] hover:opacity-90 transition"
                      >
                        Enroll <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-xs text-[#A7A7A7] bg-[#090909]">
          Loading Career Roadmap...
        </div>
      }
    >
      <RoadmapContent />
    </Suspense>
  );
}

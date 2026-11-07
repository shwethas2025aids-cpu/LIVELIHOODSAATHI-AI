'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, TrendingUp, IndianRupee, ArrowRight } from 'lucide-react';
import { CareerPathway } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface PathwayCardProps {
  pathway: CareerPathway;
}

export const PathwayCard: React.FC<PathwayCardProps> = ({ pathway }) => {
  const { currentLanguage } = useLanguage();

  const isTamil = currentLanguage === 'ta-IN';
  const displayTitle = isTamil && pathway.titleTa ? pathway.titleTa : pathway.title;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121118]/80 hover:bg-[#181622] p-6 shadow-lg hover:border-[#E98AE0]/40 hover:shadow-[0_0_25px_rgba(233,138,224,0.15)] transition-all duration-300">
      <div>
        {/* Top Header: Sector & Match Score */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="rounded-xl bg-[#160B24] border border-[#E98AE0]/30 px-3 py-1 text-[11px] font-bold text-[#E98AE0]">
            {pathway.sector}
          </span>

          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{pathway.matchScore}% Match</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white leading-snug">
          {displayTitle}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs text-[#A7A7A7] leading-relaxed">
          {pathway.description}
        </p>

        {/* Key Metrics: Starting Salary & Growth */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-3 border border-white/5 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#A7A7A7] block tracking-wider">
              Starting Pay
            </span>
            <span className="font-bold text-white text-xs flex items-center gap-0.5 mt-0.5">
              <IndianRupee className="h-3 w-3 text-[#E98AE0]" />
              {pathway.avgStartingSalary}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#A7A7A7] block tracking-wider">
              Sector Growth
            </span>
            <span className="font-bold text-emerald-400 text-xs flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="h-3 w-3" />
              {pathway.growthRate}
            </span>
          </div>
        </div>

        {/* Step Preview Timeline */}
        <div className="mt-5 space-y-2">
          <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
            Milestone Roadmap ({pathway.stages.length} Stages):
          </span>
          <div className="space-y-2">
            {pathway.stages.slice(0, 3).map((stage) => (
              <div key={stage.step} className="flex items-start gap-2.5 text-xs">
                {stage.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-[#E98AE0] shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-4 w-4 text-white/30 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <span className="font-semibold text-white">{stage.title}</span>
                  <span className="text-[11px] text-[#A7A7A7] ml-1.5 font-mono">({stage.timeframe})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <Link
          href={`/roadmap?id=${pathway.id}`}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#7928CA] py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(233,138,224,0.3)] hover:scale-102 transition"
        >
          <span>Explore Complete Interactive Roadmap</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};

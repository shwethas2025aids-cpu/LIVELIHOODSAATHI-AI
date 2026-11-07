'use client';

import React, { useState } from 'react';
import { Bookmark, Clock, TrendingUp, Sparkles, Check, ArrowRight } from 'lucide-react';
import { SkillItem } from '@/types';
import { apiService } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';

interface SkillCardProps {
  skill: SkillItem;
  onExploreSkill?: (skill: SkillItem) => void;
  isInitiallySaved?: boolean;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  onExploreSkill,
  isInitiallySaved = false,
}) => {
  const { currentLanguage } = useLanguage();
  const [isSaved, setIsSaved] = useState(isInitiallySaved);

  const handleSaveToggle = () => {
    if (isSaved) {
      apiService.removeSavedItem(skill.id);
      setIsSaved(false);
    } else {
      apiService.saveItem({
        type: 'skill',
        itemId: skill.id,
        itemData: skill,
      });
      setIsSaved(true);
    }
  };

  const isTamil = currentLanguage === 'ta-IN';
  const displayName = isTamil && skill.nameTa ? skill.nameTa : skill.name;
  const displayDesc = isTamil && skill.descriptionTa ? skill.descriptionTa : skill.description;

  const categoryColor = {
    Tech: 'bg-[#160B24] text-[#E98AE0] border-[#E98AE0]/30',
    'Green Skills': 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
    Vocational: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
    Business: 'bg-blue-950/60 text-blue-300 border-blue-500/30',
    Healthcare: 'bg-rose-950/60 text-rose-300 border-rose-500/30',
    Creative: 'bg-purple-950/60 text-purple-300 border-purple-500/30',
  }[skill.category] || 'bg-white/5 text-[#A7A7A7] border-white/10';

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121118]/80 hover:bg-[#181622] p-5 shadow-lg hover:border-[#E98AE0]/40 hover:shadow-[0_0_25px_rgba(233,138,224,0.15)] transition-all duration-300">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`rounded-xl px-2.5 py-0.5 text-[11px] font-bold border ${categoryColor}`}>
            {skill.category}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-3 w-3" /> {skill.demandLevel} Demand
            </span>
            <button
              onClick={handleSaveToggle}
              className={`rounded-lg p-1.5 transition ${
                isSaved
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-[#A7A7A7] hover:bg-white/5 hover:text-white'
              }`}
              title={isSaved ? 'Saved to Bookmarks' : 'Save Skill'}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-white group-hover:text-[#E98AE0] transition-colors">
          {displayName}
        </h4>

        {/* Description */}
        <p className="mt-2 text-xs text-[#A7A7A7] line-clamp-3 leading-relaxed">
          {displayDesc}
        </p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skill.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] font-medium text-[#A7A7A7]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="mt-5 border-t border-white/10 pt-3">
        <div className="flex items-center justify-between text-xs text-[#A7A7A7] mb-3">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="h-3.5 w-3.5 text-[#E98AE0]" /> {skill.learningDurationWeeks} Weeks
          </span>
          <span className="rounded-lg bg-[#E98AE0]/15 border border-[#E98AE0]/30 px-2 py-0.5 text-[11px] font-bold text-[#F29AD9]">
            {skill.avgSalaryBoost} Salary Boost
          </span>
        </div>

        <button
          onClick={() => onExploreSkill?.(skill)}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white hover:bg-gradient-to-r hover:from-[#E98AE0] hover:to-[#7928CA] hover:border-transparent transition-all duration-300"
        >
          <span>View Curriculum &amp; Courses</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { Bookmark, Star, Users, ExternalLink, Award, Globe } from 'lucide-react';
import { CourseItem } from '@/types';
import { apiService } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';

interface CourseCardProps {
  course: CourseItem;
  isInitiallySaved?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isInitiallySaved = false,
}) => {
  const { currentLanguage } = useLanguage();
  const [isSaved, setIsSaved] = useState(isInitiallySaved);

  const handleSaveToggle = () => {
    if (isSaved) {
      apiService.removeSavedItem(course.id);
      setIsSaved(false);
    } else {
      apiService.saveItem({
        type: 'course',
        itemId: course.id,
        itemData: course,
      });
      setIsSaved(true);
    }
  };

  const isTamil = currentLanguage === 'ta-IN';
  const displayTitle = isTamil && course.titleTa ? course.titleTa : course.title;

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121118]/80 hover:bg-[#181622] p-5 shadow-lg hover:border-[#E98AE0]/40 hover:shadow-[0_0_25px_rgba(233,138,224,0.15)] transition-all duration-300">
      <div>
        {/* Top bar: Provider & Subsidized tags */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-lg bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-white border border-white/5">
              {course.provider}
            </span>
            {course.isGovtSubsidized && (
              <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                Govt Subsidized
              </span>
            )}
            {course.isFree && (
              <span className="rounded-lg bg-[#E98AE0]/15 px-2 py-0.5 text-[10px] font-bold text-[#F29AD9] border border-[#E98AE0]/30">
                100% Free
              </span>
            )}
          </div>

          <button
            onClick={handleSaveToggle}
            className={`rounded-lg p-1.5 transition ${
              isSaved
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-[#A7A7A7] hover:bg-white/5 hover:text-white'
            }`}
            title={isSaved ? 'Saved to Bookmarks' : 'Save Course'}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>

        {/* Course Title */}
        <h4 className="text-sm font-bold text-white group-hover:text-[#E98AE0] transition-colors leading-snug">
          {displayTitle}
        </h4>

        {/* Meta Stats: Rating, Enrolled, Language */}
        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-[#A7A7A7]">
          <span className="flex items-center gap-1 font-semibold text-amber-400">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {course.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-[#A7A7A7]" />
            {course.enrolledCount.toLocaleString()} learners
          </span>
          <span className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-[#A7A7A7]" />
            {course.language}
          </span>
        </div>

        <p className="mt-2 text-xs text-[#A7A7A7] line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {/* Skills learned pills */}
        <div className="mt-3 flex flex-wrap gap-1">
          {course.skillsTaught.map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] font-medium text-[#F29AD9]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-white/10 pt-3 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium text-[#A7A7A7] block">Duration</span>
          <span className="text-xs font-bold text-white">{course.duration}</span>
        </div>

        <a
          href={course.platformUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#7928CA] px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(233,138,224,0.3)] hover:scale-102 transition"
        >
          <span>Enroll Free</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

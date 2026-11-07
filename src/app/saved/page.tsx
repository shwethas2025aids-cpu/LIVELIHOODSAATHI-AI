'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Trash2,
  ExternalLink,
  BookOpen,
  Layers,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { SavedItem, SkillItem, CourseItem, CareerPathway } from '@/types';
import { apiService } from '@/services/api';

export default function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'skill' | 'course' | 'career'>('all');

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = () => {
    const list = apiService.getSavedItems();
    setItems(list);
  };

  const handleRemove = (id: string) => {
    apiService.removeSavedItem(id);
    loadSaved();
  };

  const filteredItems = items.filter((item) =>
    filterType === 'all' ? true : item.type === filterType
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 bg-[#090909] text-white min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#160B24] border border-[#E98AE0]/30 px-3 py-1 text-xs font-semibold text-[#E98AE0] mb-2">
            <Bookmark className="h-3.5 w-3.5 fill-[#E98AE0] text-[#E98AE0]" />
            <span>Bookmarked Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Saved Recommendations
          </h1>
          <p className="text-xs text-[#A7A7A7]">
            Manage the skills, accredited courses, and career paths you want to complete.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {(['all', 'skill', 'course', 'career'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition cursor-pointer ${
                filterType === type
                  ? 'bg-gradient-to-r from-[#E98AE0] to-[#9333EA] text-black font-bold'
                  : 'bg-[#121118] border border-white/10 text-slate-300 hover:border-[#E98AE0]/40 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All Items' : `${type}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Saved Items */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isSkill = item.type === 'skill';
            const isCourse = item.type === 'course';
            const isCareer = item.type === 'career';

            const skillData = isSkill ? (item.itemData as SkillItem) : null;
            const courseData = isCourse ? (item.itemData as CourseItem) : null;
            const careerData = isCareer ? (item.itemData as CareerPathway) : null;

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121118] p-5 shadow-sm hover:border-[#E98AE0]/40 transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="rounded-lg bg-[#160B24] border border-[#E98AE0]/30 px-2 py-0.5 text-[10px] font-bold text-[#E98AE0] uppercase">
                      {item.type}
                    </span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-[#A7A7A7] hover:text-rose-400 transition p-1 cursor-pointer"
                      title="Remove from saved"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white">
                    {skillData?.name || courseData?.title || careerData?.title}
                  </h3>

                  <p className="mt-1 text-xs text-[#A7A7A7] line-clamp-2">
                    {skillData?.description || courseData?.description || careerData?.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#A7A7A7]">
                    Saved on {new Date(item.savedAt).toLocaleDateString()}
                  </span>

                  {isCourse && courseData && (
                    <a
                      href={courseData.platformUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#E98AE0] to-[#9333EA] px-3 py-1 text-black font-bold text-[11px] hover:opacity-90 transition"
                    >
                      Enroll <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {isSkill && (
                    <Link
                      href="/skills"
                      className="text-xs font-bold text-[#E98AE0] hover:underline flex items-center gap-1"
                    >
                      View in Skills <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}

                  {isCareer && (
                    <Link
                      href={`/roadmap?id=${careerData?.id}`}
                      className="text-xs font-bold text-[#E98AE0] hover:underline flex items-center gap-1"
                    >
                      View Roadmap <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/15 bg-[#121118] p-12 text-center space-y-3">
          <Bookmark className="mx-auto h-8 w-8 text-[#A7A7A7]" />
          <h3 className="text-sm font-bold text-white">No saved recommendations yet</h3>
          <p className="text-xs text-[#A7A7A7] max-w-sm mx-auto">
            Browse our skills or courses catalog and tap the bookmark icon on any item to save it here for later.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/skills"
              className="rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#9333EA] px-4 py-2 text-xs font-bold text-black hover:opacity-90 transition"
            >
              Browse Skills
            </Link>
            <Link
              href="/courses"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

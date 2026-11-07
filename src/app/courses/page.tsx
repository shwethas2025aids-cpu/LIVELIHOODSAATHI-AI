'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Star,
  Users,
  ExternalLink,
  Award,
  Globe,
  Sparkles,
} from 'lucide-react';
import { INITIAL_COURSES } from '@/lib/constants';
import { CourseCard } from '@/components/cards/CourseCard';

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [filterGovtOnly, setFilterGovtOnly] = useState<boolean>(false);

  const filteredCourses = INITIAL_COURSES.filter((course) => {
    const matchesLang =
      selectedLanguage === 'All' || course.language.includes(selectedLanguage);
    const matchesGovt = !filterGovtOnly || course.isGovtSubsidized;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.skillsTaught.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesLang && matchesGovt && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#090909] text-white min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#160B24] border border-[#E98AE0]/30 px-3 py-1 text-xs font-semibold text-[#E98AE0] mb-2">
            <Award className="h-3.5 w-3.5" />
            <span>Accredited Free &amp; Subsidized Programs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Course &amp; Learning Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#A7A7A7] mt-1">
            Certified courses from SWAYAM, NPTEL, PMKVY, and TNSDC with complete instruction in Tamil &amp; English.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#A7A7A7]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses or providers..."
            className="w-full rounded-xl border border-white/15 bg-[#080808] py-2 pl-9 pr-3 text-xs text-white placeholder-[#A7A7A7] focus:border-[#E98AE0] focus:ring-1 focus:ring-[#E98AE0] focus:outline-none transition"
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121118] p-3.5 rounded-2xl border border-white/10 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-[#A7A7A7] shrink-0">Language:</span>
          {['All', 'Tamil', 'English', 'Tamil / English'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${selectedLanguage === lang
                  ? 'bg-gradient-to-r from-[#E98AE0] to-[#9333EA] text-black font-bold'
                  : 'bg-[#1A1823] text-slate-300 hover:bg-[#252233] border border-white/5'
                }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterGovtOnly}
            onChange={(e) => setFilterGovtOnly(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-[#080808] text-[#E98AE0] focus:ring-[#E98AE0] accent-[#E98AE0]"
          />
          <span>Show Government Subsidized Only</span>
        </label>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="rounded-3xl border border-dashed border-white/15 bg-[#121118] p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-300">No courses match your active filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLanguage('All');
              setFilterGovtOnly(false);
            }}
            className="text-xs font-bold text-[#E98AE0] hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

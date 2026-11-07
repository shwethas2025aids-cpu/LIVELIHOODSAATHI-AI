'use client';

import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Bookmark,
  ArrowRight,
  X,
  ExternalLink,
} from 'lucide-react';
import { INITIAL_SKILLS, INITIAL_COURSES } from '@/lib/constants';
import { SkillItem } from '@/types';
import { SkillCard } from '@/components/cards/SkillCard';

export default function SkillsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  const categories = ['All', 'Tech', 'Green Skills', 'Vocational', 'Business', 'Healthcare'];

  const filteredSkills = INITIAL_SKILLS.filter((skill) => {
    const matchesCategory =
      selectedCategory === 'All' || skill.category === selectedCategory;
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#090909] text-white min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#160B24] border border-[#E98AE0]/30 px-3 py-1 text-xs font-semibold text-[#E98AE0] mb-2">
            <Layers className="h-3.5 w-3.5" />
            <span>High-Demand Livelihood Competencies</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Personalized Skill Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-[#A7A7A7] mt-1">
            Accelerate your career readiness with validated competencies that unlock verifiable salary increases.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#A7A7A7]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills or tags..."
            className="w-full rounded-xl border border-white/15 bg-[#080808] py-2 pl-9 pr-3 text-xs text-white placeholder-[#A7A7A7] focus:border-[#E98AE0] focus:ring-1 focus:ring-[#E98AE0] focus:outline-none transition"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-[#E98AE0] to-[#9333EA] text-black font-bold shadow-sm'
                : 'bg-[#121118] border border-white/10 text-slate-300 hover:border-[#E98AE0]/40 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onExploreSkill={(s) => setSelectedSkill(s)}
          />
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="rounded-3xl border border-dashed border-white/15 bg-[#121118] p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-300">No skills match your search filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="text-xs font-bold text-[#E98AE0] hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-[#121118] border border-white/15 shadow-2xl text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#160B24] p-6">
              <div>
                <span className="rounded-lg bg-[#090909] border border-[#E98AE0]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#E98AE0]">
                  {selectedSkill.category} • {selectedSkill.difficulty}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedSkill.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSkill(null)}
                className="rounded-lg p-1.5 text-[#A7A7A7] hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#A7A7A7]">
              <p className="leading-relaxed text-sm text-slate-200 font-medium">
                {selectedSkill.description}
              </p>

              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#090909] p-4 border border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#A7A7A7] block">
                    Duration
                  </span>
                  <span className="text-xs font-bold text-white mt-0.5 block">
                    {selectedSkill.learningDurationWeeks} Weeks (Part-Time)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#A7A7A7] block">
                    Expected Salary Lift
                  </span>
                  <span className="text-xs font-bold text-[#E98AE0] mt-0.5 block">
                    {selectedSkill.avgSalaryBoost} Average
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Prerequisites:
                </h4>
                <ul className="space-y-1.5">
                  {selectedSkill.prerequisites.map((p, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#E98AE0]" />
                      <span className="text-slate-300">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Matching Accredited Courses:
                </h4>
                <div className="space-y-2">
                  {INITIAL_COURSES.slice(0, 2).map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-white/10 bg-[#090909] p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-white">{c.title}</p>
                        <p className="text-[11px] text-[#A7A7A7]">{c.provider} • {c.duration}</p>
                      </div>
                      <a
                        href={c.platformUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#E98AE0] to-[#9333EA] px-3 py-1 text-black font-bold text-[11px] hover:opacity-90"
                      >
                        Enroll <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 p-4 bg-[#160B24] flex justify-end">
              <button
                onClick={() => setSelectedSkill(null)}
                className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

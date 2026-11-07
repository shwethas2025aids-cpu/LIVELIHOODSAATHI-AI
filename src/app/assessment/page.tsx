'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Compass,
  Award,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { AssessmentResult } from '@/types';
import { SkillCard } from '@/components/cards/SkillCard';
import { CourseCard } from '@/components/cards/CourseCard';
import { PathwayCard } from '@/components/cards/PathwayCard';

export default function AssessmentPage() {
  const { currentLanguage } = useLanguage();
  const { updateUser } = useAuth();
  const questions = apiService.getAssessmentQuestions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const currentQuestion = questions[currentIndex];
  const isTamil = currentLanguage === 'ta-IN';

  const handleSelectOption = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionIndex });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Complete & evaluate
      const evalResult = apiService.evaluateAssessment(answers);
      setResult(evalResult);
      updateUser({ completedAssessment: true });
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#090909] text-white min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#160B24] border border-[#E98AE0]/30 px-3 py-1 text-xs font-semibold text-[#E98AE0]">
          <GraduationCap className="h-4 w-4" />
          <span>Diagnostic Aptitude Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Skills &amp; Interests Assessment
        </h1>
        <p className="text-xs sm:text-sm text-[#A7A7A7]">
          Answer 5 quick questions to map your practical strengths to accredited vocational and tech livelihood tracks.
        </p>
      </div>

      {!result ? (
        /* QUESTIONNAIRE CARD */
        <div className="rounded-3xl border border-white/10 bg-[#121118] p-6 sm:p-10 shadow-2xl space-y-6">
          {/* Progress Header */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#A7A7A7] mb-2">
              <span className="text-[#E98AE0] font-bold">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span>{currentQuestion.category}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#090909] overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-[#E98AE0] to-[#9333EA] transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text in English & Tamil */}
          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {currentQuestion.question}
            </h2>
            <p className="text-sm font-medium text-[#E98AE0]">
              {currentQuestion.questionTa}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = answers[currentQuestion.id] === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#E98AE0] bg-[#160B24] shadow-md ring-1 ring-[#E98AE0]'
                      : 'border-white/10 bg-[#090909] hover:bg-[#160B24]/40 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold mt-0.5 ${
                        isSelected
                          ? 'border-[#E98AE0] bg-[#E98AE0] text-black'
                          : 'border-white/20 text-[#A7A7A7]'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className={`text-xs sm:text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-[#A7A7A7]">
                        {opt.labelTa}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-[#A7A7A7] hover:text-white hover:bg-white/5 disabled:opacity-30 transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>

            <button
              disabled={answers[currentQuestion.id] === undefined}
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#9333EA] px-6 py-2.5 text-xs font-bold text-black shadow-lg shadow-pink-500/20 hover:opacity-90 disabled:opacity-40 transition cursor-pointer"
            >
              <span>{currentIndex === questions.length - 1 ? 'Calculate My Livelihood Match' : 'Next Question'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* RESULTS DASHBOARD */
        <div className="space-y-8 animate-in fade-in">
          {/* Result Highlight Card */}
          <div className="rounded-3xl bg-gradient-to-tr from-[#160B24] via-[#210E36] to-[#121118] border border-white/10 p-6 sm:p-10 text-white shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#E98AE0]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
              <span className="rounded-full bg-[#090909] px-3 py-1 text-xs font-semibold text-[#E98AE0] border border-[#E98AE0]/30">
                Diagnostic Complete
              </span>
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Retake Test
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white relative z-10">
              Your Primary Strength: {result.dominantDomain}
            </h2>

            <p className="text-xs sm:text-sm text-[#A7A7A7] max-w-2xl leading-relaxed relative z-10">
              {isTamil ? result.summaryTa : result.summary}
            </p>

            <div className="pt-2 flex flex-wrap gap-3 relative z-10">
              <Link
                href="/roadmap"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#9333EA] px-5 py-2.5 text-xs font-bold text-black shadow hover:opacity-90 transition"
              >
                <Compass className="h-4 w-4 text-black" /> View Full Career Pathway
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>

          {/* Matched Pathways */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                Top Matched Career Pathways ({result.matchedCareers.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.matchedCareers.map((pathway) => (
                <PathwayCard key={pathway.id} pathway={pathway} />
              ))}
            </div>
          </div>

          {/* Top Skill Gaps to Fill */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">
              Recommended Skills to Acquire
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {result.topSkillGaps.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </div>

          {/* Recommended Courses */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">
              Free &amp; Subsidized Courses for You
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {result.recommendedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

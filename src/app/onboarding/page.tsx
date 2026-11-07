'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Compass,
  Briefcase,
  MapPin,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [step, setStep] = useState(1);
  const [educationLevel, setEducationLevel] = useState(user?.educationLevel || 'Undergraduate Degree (B.E / B.Tech / B.Sc)');
  const [targetDomain, setTargetDomain] = useState(user?.targetCareer || 'Software Development & AI');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user?.currentSkills || ['Computer Basics']);
  const [location, setLocation] = useState(user?.location || 'Tamil Nadu, India');

  const educationOptions = [
    '10th / 12th Standard Passed',
    'Industrial Training Institute (ITI / Vocational)',
    'Polytechnic Diploma',
    'Undergraduate Degree (B.E / B.Tech / B.Sc / B.Com)',
    'Postgraduate / Masters',
    'Self-taught / Working Professional',
  ];

  const domainOptions = [
    { title: 'Information Technology & Software', desc: 'Python, Web Apps, Data, AI Automation' },
    { title: 'Solar & Renewable Clean Energy', desc: 'Rooftop PV Installation, Inverters, NISE' },
    { title: 'Electric Vehicles & Mobility', desc: 'Battery Systems, EV Service, Diagnostics' },
    { title: 'Digital Commerce & MSME Sales', desc: 'Social Marketing, Google Business, E-Commerce' },
    { title: 'Healthcare & Patient Assistance', desc: 'Elder Care, Hospital Support, Vital Monitoring' },
  ];

  const skillChips = [
    'Computer Literacy',
    'Smartphone Basics',
    'English Fluency',
    'Tamil Communication',
    'Basic Electrical',
    'Mathematics / Accounting',
    'Python Coding',
    'HTML/CSS',
    'Soldering / Tools',
    'Customer Service',
    'Social Media',
  ];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleFinish = () => {
    updateUser({
      educationLevel,
      targetCareer: targetDomain,
      currentSkills: selectedSkills,
      location,
      completedAssessment: false,
    });
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#090909] text-white">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#121118] p-6 shadow-2xl sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#160B24] rounded-full blur-3xl opacity-50 pointer-events-none" />

        {/* Progress Bar */}
        <div className="mb-8 relative z-10">
          <div className="flex items-center justify-between text-xs font-semibold text-[#A7A7A7] mb-2">
            <span>Step {step} of 4</span>
            <span className="text-[#E98AE0] font-bold">
              {step === 1 ? 'Education' : step === 2 ? 'Target Domain' : step === 3 ? 'Current Skills' : 'Location & Finish'}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#090909] overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#E98AE0] to-[#9333EA] transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: EDUCATION */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in relative z-10">
            <div>
              <h2 className="text-xl font-extrabold text-white">What is your current education level?</h2>
              <p className="text-xs text-[#A7A7A7] mt-1">This helps us match courses that qualify for accredited state certification.</p>
            </div>

            <div className="space-y-2.5">
              {educationOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => setEducationLevel(opt)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${educationLevel === opt
                      ? 'border-[#E98AE0] bg-[#160B24] text-white font-bold ring-1 ring-[#E98AE0]'
                      : 'border-white/10 hover:bg-[#160B24]/40 text-slate-300'
                    }`}
                >
                  <span className="text-xs">{opt}</span>
                  {educationLevel === opt && <Check className="h-4 w-4 text-[#E98AE0]" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: TARGET DOMAIN */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in relative z-10">
            <div>
              <h2 className="text-xl font-extrabold text-white">Which livelihood sector interests you most?</h2>
              <p className="text-xs text-[#A7A7A7] mt-1">You can explore multiple tracks anytime later.</p>
            </div>

            <div className="space-y-3">
              {domainOptions.map((dom) => (
                <div
                  key={dom.title}
                  onClick={() => setTargetDomain(dom.title)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${targetDomain === dom.title
                      ? 'border-[#E98AE0] bg-[#160B24] ring-1 ring-[#E98AE0]'
                      : 'border-white/10 hover:bg-[#160B24]/40'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{dom.title}</span>
                    {targetDomain === dom.title && <Check className="h-4 w-4 text-[#E98AE0]" />}
                  </div>
                  <p className="text-[11px] text-[#A7A7A7] mt-1">{dom.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: SKILLS */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in relative z-10">
            <div>
              <h2 className="text-xl font-extrabold text-white">What skills are you already familiar with?</h2>
              <p className="text-xs text-[#A7A7A7] mt-1">Select all that apply to fine-tune your baseline recommendations.</p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {skillChips.map((chip) => {
                const isSelected = selectedSkills.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggleSkill(chip)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${isSelected
                        ? 'bg-gradient-to-r from-[#E98AE0] to-[#9333EA] text-black font-bold shadow-sm'
                        : 'bg-[#090909] border border-white/10 text-slate-300 hover:border-[#E98AE0]/40 hover:text-white'
                      }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: LOCATION & FINISH */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in relative z-10">
            <div>
              <h2 className="text-xl font-extrabold text-white">Where are you located?</h2>
              <p className="text-xs text-[#A7A7A7] mt-1">We connect you to regional training centers (e.g. TNSDC, Naan Mudhalvan) near your district.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">State / District / City</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-2.5 h-4 w-4 text-[#A7A7A7]" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Coimbatore, Tamil Nadu"
                  className="w-full rounded-xl border border-white/15 bg-[#080808] py-2.5 pl-10 pr-3 text-xs text-white placeholder-[#A7A7A7] focus:border-[#E98AE0] focus:outline-none focus:ring-1 focus:ring-[#E98AE0] transition"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-[#160B24] p-4 border border-[#E98AE0]/30 text-xs text-white space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-[#E98AE0]">
                <Sparkles className="h-4 w-4 text-[#E98AE0]" /> All set for AI career guidance!
              </span>
              <p className="text-[11px] text-[#A7A7A7] leading-relaxed">
                Click Finish to enter your personalized dashboard, where you can speak to our Voice Assistant in Tamil or English anytime.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-[#A7A7A7] hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#9333EA] px-5 py-2.5 text-xs font-bold text-black shadow hover:opacity-90 transition cursor-pointer"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E98AE0] via-[#C084FC] to-[#9333EA] px-6 py-2.5 text-xs font-bold text-black shadow-lg shadow-pink-500/20 hover:opacity-90 transition cursor-pointer"
            >
              <Sparkles className="h-4 w-4" /> Finish &amp; Launch Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

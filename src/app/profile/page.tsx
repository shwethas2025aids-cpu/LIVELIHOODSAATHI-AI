'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  GraduationCap,
  Briefcase,
  Layers,
  Save,
  CheckCircle2,
  Sparkles,
  Bookmark,
  History,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { LanguageCode } from '@/types';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { setLanguage } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [educationLevel, setEducationLevel] = useState(user?.educationLevel || '');
  const [targetCareer, setTargetCareer] = useState(user?.targetCareer || '');
  const [location, setLocation] = useState(user?.location || '');
  const [preferredLang, setPreferredLang] = useState<LanguageCode>(user?.languagePreference || 'ta-IN');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(user?.currentSkills || []);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (!newSkillInput.trim()) return;
    if (!skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      phone,
      educationLevel,
      targetCareer,
      location,
      languagePreference: preferredLang,
      currentSkills: skills,
    });
    setLanguage(preferredLang);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 bg-[#090909] text-white min-h-[calc(100vh-4rem)]">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-tr from-[#160B24] via-[#210E36] to-[#121118] border border-white/10 p-6 sm:p-8 text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#090909] text-2xl font-extrabold border border-[#E98AE0]/30 text-[#E98AE0] shadow-md">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">{name || 'User Profile'}</h1>
            <p className="text-xs text-[#E98AE0]">{user?.role || 'Job Seeker & Skill Learner'}</p>
            <p className="text-[11px] text-[#A7A7A7] mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#E98AE0]" /> {location || 'Tamil Nadu, India'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/saved"
            className="rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10 hover:border-[#E98AE0]/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Bookmark className="h-3.5 w-3.5 text-[#E98AE0]" /> Saved Items
          </Link>
          <Link
            href="/history"
            className="rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10 hover:border-[#E98AE0]/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <History className="h-3.5 w-3.5 text-[#E98AE0]" /> Voice History
          </Link>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="rounded-3xl border border-white/10 bg-[#121118] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-white/10 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Personal &amp; Career Profile</h2>
            <p className="text-xs text-[#A7A7A7]">Keep your details updated for accurate AI recommendations</p>
          </div>
          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-[#E98AE0] bg-[#160B24] px-3 py-1 rounded-full border border-[#E98AE0]/30">
              <CheckCircle2 className="h-4 w-4" /> Changes Saved!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-[#A7A7A7]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#080808] py-2.5 pl-9 pr-3 text-xs text-white placeholder-[#A7A7A7] focus:border-[#E98AE0] focus:outline-none focus:ring-1 focus:ring-[#E98AE0] transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#A7A7A7]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#080808] py-2.5 pl-9 pr-3 text-xs text-white placeholder-[#A7A7A7] focus:border-[#E98AE0] focus:outline-none focus:ring-1 focus:ring-[#E98AE0] transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[#A7A7A7]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#080808] py-2.5 pl-9 pr-3 text-xs text-white placeholder-[#A7A7A7] focus:border-[#E98AE0] focus:outline-none focus:ring-1 focus:ring-[#E98AE0] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Voice Language</label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-[#A7A7A7]" />
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value as LanguageCode)}
                className="w-full rounded-xl border border-white/15 bg-[#080808] py-2.5 pl-9 pr-3 text-xs text-white focus:border-[#E98AE0] focus:outline-none focus:ring-1 focus:ring-[#E98AE0] transition"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-[#121118] text-white">
                    {l.flag} {l.nativeLabel} ({l.label})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Education Level</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-[#A7A7A7]" />
              <input
                type="text"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#080808] py-2.5 pl-9 pr-3 text-xs text-white placeholder-[#A7A7A7] focus:border-[#E98AE0] focus:outline-none focus:ring-1 focus:ring-[#E98AE0] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Career or Domain</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-[#A7A7A7]" />
              <input
                type="text"
                value={targetCareer}
                onChange={(e) => setTargetCareer(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#080808] py-2.5 pl-9 pr-3 text-xs text-white placeholder-[#A7A7A7] focus:border-[#E98AE0] focus:outline-none focus:ring-1 focus:ring-[#E98AE0] transition"
              />
            </div>
          </div>
        </div>

        {/* Current Skills Chips */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            My Current Skills &amp; Proficiencies
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#160B24] px-2.5 py-1 text-xs font-semibold text-[#E98AE0] border border-[#E98AE0]/30"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(s)}
                  className="text-slate-400 hover:text-rose-400 transition cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="Type a skill and press Enter or Add..."
              className="flex-1 rounded-xl border border-white/15 bg-[#080808] px-3.5 py-2 text-xs text-white placeholder-[#A7A7A7] focus:border-[#E98AE0] focus:outline-none focus:ring-1 focus:ring-[#E98AE0] transition"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E98AE0] to-[#9333EA] px-6 py-2.5 text-xs font-bold text-black shadow-lg shadow-pink-500/20 hover:opacity-90 transition cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}

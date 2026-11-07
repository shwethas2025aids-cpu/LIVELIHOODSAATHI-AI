'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const translations: Record<LanguageCode, Record<string, string>> = {
  'ta-IN': {
    brand_tagline: 'உங்கள் திறன்கள். உங்கள் எதிர்காலம். உங்கள் குரல்.',
    nav_home: 'முகப்பு',
    nav_dashboard: 'டாஷ்போர்டு',
    nav_voice: 'குரல் உதவியாளர்',
    nav_chat: 'AI சாட்',
    nav_skills: 'திறன்கள்',
    nav_courses: 'படிப்புகள்',
    nav_roadmap: 'தொழில் பாதை',
    nav_assessment: 'மதிப்பீடு',
    nav_saved: 'சேமிக்கப்பட்டவை',
    nav_history: 'வரலாறு',
    nav_settings: 'அமைப்புகள்',
    login_btn: 'உள்நுழை',
    register_btn: 'பதிவுசெய்',
    start_assessment: 'திறன் மதிப்பீடு தொடங்கு',
    voice_assistant_title: 'குரல் வழிகாட்டி',
    voice_tap_to_speak: 'பேச மைக்ரோஃபோனை அழுத்தவும்',
    voice_listening: 'கேட்கிறது...',
    voice_processing: 'செயலாக்குகிறது...',
    voice_ai_thinking: 'AI சிந்திக்கிறது...',
    voice_speaking: 'பதிலளிக்கிறது...',
    voice_ready: 'தயாராக உள்ளது',
    voice_stop: 'நிறுத்து',
    detect_lang_label: 'கண்டறியப்பட்ட மொழி',
    recommended_skills: 'பரிந்துரைக்கப்பட்ட திறன்கள்',
    recommended_courses: 'முக்கிய படிப்புகள்',
    explore_careers: 'தொழில் வாய்ப்புகள்',
    save: 'சேமி',
    saved: 'சேமிக்கப்பட்டது',
  },
  'en-IN': {
    brand_tagline: 'Your Skills. Your Future. Your Voice.',
    nav_home: 'Home',
    nav_dashboard: 'Dashboard',
    nav_voice: 'Voice Assistant',
    nav_chat: 'AI Chat',
    nav_skills: 'Skills',
    nav_courses: 'Courses',
    nav_roadmap: 'Career Pathway',
    nav_assessment: 'Assessment',
    nav_saved: 'Saved Items',
    nav_history: 'History',
    nav_settings: 'Settings',
    login_btn: 'Sign In',
    register_btn: 'Get Started',
    start_assessment: 'Start Skills Assessment',
    voice_assistant_title: 'AI Voice Career Guide',
    voice_tap_to_speak: 'Tap microphone to speak',
    voice_listening: 'Listening to your voice...',
    voice_processing: 'Processing speech...',
    voice_ai_thinking: 'AI is analyzing your profile...',
    voice_speaking: 'Speaking response...',
    voice_ready: 'Ready to listen',
    voice_stop: 'Stop Listening',
    detect_lang_label: 'Detected Language',
    recommended_skills: 'Recommended Skills',
    recommended_courses: 'Curated Courses',
    explore_careers: 'Career Opportunities',
    save: 'Save',
    saved: 'Saved',
  },
  'ta-en': {
    brand_tagline: 'Unga Skills. Unga Future. Unga Voice.',
    nav_home: 'Home (முகப்பு)',
    nav_dashboard: 'Dashboard',
    nav_voice: 'Voice Assistant (குரல்)',
    nav_chat: 'AI Chat',
    nav_skills: 'Skills (திறன்கள்)',
    nav_courses: 'Courses (படிப்புகள்)',
    nav_roadmap: 'Career Roadmap',
    nav_assessment: 'Assessment (மதிப்பீடு)',
    nav_saved: 'Saved (சேமித்தவை)',
    nav_history: 'History (வரலாறு)',
    nav_settings: 'Settings',
    login_btn: 'Sign In',
    register_btn: 'Get Started',
    start_assessment: 'Start Assessment',
    voice_assistant_title: 'Voice Career Guide',
    voice_tap_to_speak: 'Speak பண்ண மைக் கிளிக் பண்ணுங்க',
    voice_listening: 'Listening...',
    voice_processing: 'Processing...',
    voice_ai_thinking: 'AI yosikidhu...',
    voice_speaking: 'Speaking...',
    voice_ready: 'Ready',
    voice_stop: 'Stop',
    detect_lang_label: 'Detected Language',
    recommended_skills: 'Recommended Skills',
    recommended_courses: 'Recommended Courses',
    explore_careers: 'Career Pathways',
    save: 'Save',
    saved: 'Saved',
  },
  'hi-IN': {
    brand_tagline: 'आपका कौशल. आपका भविष्य. आपकी आवाज़.',
    nav_home: 'होम',
    nav_dashboard: 'डैशबोर्ड',
    nav_voice: 'आवाज़ सहायक',
    nav_chat: 'एआई चैट',
    nav_skills: 'कौशल',
    nav_courses: 'कोर्स',
    nav_roadmap: 'कैरियर रोडमैप',
    nav_assessment: 'मूल्यांकन',
    nav_saved: 'सहेजे गए',
    nav_history: 'इतिहास',
    nav_settings: 'सेटिंग्स',
    login_btn: 'लॉग इन',
    register_btn: 'शुरू करें',
    start_assessment: 'कौशल मूल्यांकन शुरू करें',
    voice_assistant_title: 'एआई वॉयस कैरियर गाइड',
    voice_tap_to_speak: 'बोलने के लिए माइक दबाएं',
    voice_listening: 'सुन रहा है...',
    voice_processing: 'प्रोसेसिंग हो रही है...',
    voice_ai_thinking: 'एआई सोच रहा है...',
    voice_speaking: 'उत्तर बोल रहा है...',
    voice_ready: 'तैयार है',
    voice_stop: 'रोकें',
    detect_lang_label: 'पहचानी गई भाषा',
    recommended_skills: 'अनुशंसित कौशल',
    recommended_courses: 'उपयुक्त कोर्स',
    explore_careers: 'कैरियर मार्ग',
    save: 'सहेजें',
    saved: 'सहेजा गया',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>('ta-IN');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('livelihoodsaathi_lang') as LanguageCode;
      if (savedLang && SUPPORTED_LANGUAGES.some((l) => l.code === savedLang)) {
        setCurrentLanguageState(savedLang);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setCurrentLanguageState(lang);
    try {
      localStorage.setItem('livelihoodsaathi_lang', lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || translations['en-IN']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

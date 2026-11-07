// Types for LivelihoodSaathi AI

export type LanguageCode = 'ta-IN' | 'en-IN' | 'ta-en' | 'hi-IN';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
  languagePreference: LanguageCode;
  educationLevel?: string;
  targetCareer?: string;
  currentSkills: string[];
  interests: string[];
  location?: string;
  completedAssessment?: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export type VoiceState =
  | 'ready'
  | 'connecting'
  | 'listening'
  | 'processing'
  | 'transcript_received'
  | 'thinking'
  | 'response_received'
  | 'speaking'
  | 'error';

export interface TranscriptSegment {
  segment_id: string;
  text: string;
  language: string;
  is_final: boolean;
  timestamp: number;
  normalized_text?: string;
}

export type ServerVoiceEvent =
  | { type: 'connected'; session_id: string; message?: string }
  | { type: 'speech_start' }
  | { type: 'processing'; progress?: number }
  | { type: 'transcript'; segment_id: string; text: string; language: string; is_final: boolean; normalized_text?: string }
  | { type: 'error'; message: string; code?: string }
  | { type: 'settings_updated'; settings: Record<string, unknown> };

export interface SkillItem {
  id: string;
  name: string;
  nameTa?: string;
  category: 'Tech' | 'Vocational' | 'Green Skills' | 'Business' | 'Healthcare' | 'Creative';
  demandLevel: 'High' | 'Very High' | 'Moderate';
  avgSalaryBoost: string;
  description: string;
  descriptionTa?: string;
  learningDurationWeeks: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: string[];
  tags: string[];
}

export interface CourseItem {
  id: string;
  title: string;
  titleTa?: string;
  provider: string; // e.g., 'SWAYAM / NPTEL', 'PMKVY', 'Coursera', 'Tamil Nadu Skill Development Corporation (TNSDC)'
  platformUrl: string;
  language: 'Tamil' | 'English' | 'Tamil / English' | 'Hindi';
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  isFree: boolean;
  isGovtSubsidized: boolean;
  certificationAvailable: boolean;
  rating: number;
  enrolledCount: number;
  skillsTaught: string[];
  description: string;
}

export interface RoadmapStage {
  step: number;
  title: string;
  titleTa?: string;
  timeframe: string;
  description: string;
  keyActions: string[];
  completed?: boolean;
  recommendedCourseIds?: string[];
}

export interface CareerPathway {
  id: string;
  title: string;
  titleTa?: string;
  sector: string;
  avgStartingSalary: string;
  growthRate: string;
  matchScore: number;
  description: string;
  prerequisites: string[];
  stages: RoadmapStage[];
}

export interface GuidanceRecommendation {
  summary: string;
  summaryTa?: string;
  detectedIntent?: string;
  skills: SkillItem[];
  courses: CourseItem[];
  careerPathways: CareerPathway[];
  nextSteps: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  original_transcript?: string;
  detected_language?: string;
  normalized_text?: string;
  audio_url?: string;
  timestamp: string;
  recommendations?: GuidanceRecommendation;
}

export interface SavedItem {
  id: string;
  type: 'skill' | 'course' | 'career';
  itemId: string;
  savedAt: string;
  itemData: SkillItem | CourseItem | CareerPathway;
  notes?: string;
}

export interface AssessmentQuestion {
  id: number;
  category: string;
  question: string;
  questionTa: string;
  options: {
    label: string;
    labelTa: string;
    points: Record<string, number>;
  }[];
}

export interface AssessmentResult {
  dominantDomain: string;
  domainScores: Record<string, number>;
  matchedCareers: CareerPathway[];
  topSkillGaps: SkillItem[];
  recommendedCourses: CourseItem[];
  summary: string;
  summaryTa: string;
}

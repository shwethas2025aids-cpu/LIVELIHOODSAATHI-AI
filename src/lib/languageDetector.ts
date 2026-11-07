import { LanguageCode } from '@/types';

/**
 * LIVELIHOODSAATHI AI - Intelligent Question Language Detector
 *
 * Accurately determines the language of the user's actual question:
 * - Tamil script (\u0B80-\u0BFF) -> 'ta-IN'
 * - Devanagari script (\u0900-\u097F) -> 'hi-IN'
 * - Tanglish (Tamil vocabulary written in English Latin characters) -> 'ta-en'
 * - English (Latin letters without Tanglish vocabulary) -> 'en-IN'
 */
export function detectQuestionLanguage(
  message: string,
  preferredLanguage?: string
): LanguageCode {
  const trimmed = (message || '').trim();
  if (!trimmed) {
    if (preferredLanguage === 'en-IN' || preferredLanguage === 'en') return 'en-IN';
    if (preferredLanguage === 'hi-IN' || preferredLanguage === 'hi') return 'hi-IN';
    if (preferredLanguage === 'ta-en') return 'ta-en';
    return preferredLanguage === 'ta-IN' ? 'ta-IN' : 'en-IN';
  }

  // 1. Script-based check: Tamil Unicode range (\u0B80-\u0BFF)
  if (/[\u0B80-\u0BFF]/.test(trimmed)) {
    return 'ta-IN';
  }

  // 2. Script-based check: Devanagari Unicode range (\u0900-\u097F)
  if (/[\u0900-\u097F]/.test(trimmed)) {
    return 'hi-IN';
  }

  const lower = trimmed.toLowerCase();

  // 3. Tanglish vocabulary check: Tamil words written using English Latin alphabet
  const tanglishPatterns = [
    /\b(naan|enakku|ungalukku|unga|enga|namma|avan|aval|avanga)\b/i,
    /\b(epdi|eppadi|enna|edhu|edhavathu|ethavathu|enge|enga)\b/i,
    /\b(venum|vendum|mudiyuma|mudiyum|kedaikkuma|kidaikkuma)\b/i,
    /\b(padikuren|padikka|padichi|padichu|padithu)\b/i,
    /\b(panradhu|pannunga|panna|pannalam|seiyanum|seiyalaam)\b/i,
    /\b(irukku|irukka|irukken|iruntha|illai|illa)\b/i,
    /\b(solunga|solla|sollunga|theriyuma|puriyala)\b/i,
    /\b(vaangurathu|vaanga|vaangalam|vaanguradhu)\b/i,
    /\b(velai|thozhil|kurippu|vazhigaattudhal)\b/i,
  ];

  const hasTanglishMarker = tanglishPatterns.some((rx) => rx.test(lower));

  if (hasTanglishMarker) {
    return 'ta-en';
  }

  // 4. English words & grammar check
  const englishPatterns = [
    /\b(i|am|how|what|why|when|where|which|who|can|could|should|would|will)\b/i,
    /\b(get|find|start|become|prepare|build|learn|study|work|choose)\b/i,
    /\b(internship|graduation|career|college|student|engineer|engineering)\b/i,
    /\b(developer|analyst|interview|resume|job|skills|course|options)\b/i,
    /\b(second|year|degree|salary|guidance|opportunity|project|projects)\b/i,
    /\b(cybersecurity|mechanical|frontend|backend|cloud|software)\b/i,
  ];

  const hasEnglishWords = englishPatterns.some((rx) => rx.test(lower));
  if (hasEnglishWords) {
    return 'en-IN';
  }

  // 5. Fallback based on explicit preferred language if user manually switched
  if (preferredLanguage === 'ta-en') {
    return 'ta-en';
  }
  if (preferredLanguage === 'hi-IN' || preferredLanguage === 'hi') {
    return 'hi-IN';
  }
  if (preferredLanguage === 'en-IN' || preferredLanguage === 'en') {
    return 'en-IN';
  }

  // 6. Default Latin string with no Tamil script or markers -> 'en-IN'
  if (/^[a-zA-Z0-9\s.,!?'"()#@%&/:;_\-+]+$/.test(trimmed)) {
    return 'en-IN';
  }

  return (preferredLanguage as LanguageCode) || 'en-IN';
}


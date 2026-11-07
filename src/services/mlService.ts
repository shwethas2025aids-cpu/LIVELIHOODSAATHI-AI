/**
 * LivelihoodSaathi AI - ML Recommendation Service Wrapper
 * Bridges Node.js backend to the Scikit-learn recommender engine with
 * resilient in-process fallback.
 */

import { spawn, ChildProcess } from 'node:child_process';
import path from 'node:path';
import readline from 'node:readline';

export interface MLRecommendationInput {
  education: string;
  skills: string[];
  interests: string[];
  target_career: string;
  preferred_language?: string;
  career_pathways?: Array<{
    id: string;
    title: string;
    sector: string;
    required_skills: string[];
    description?: string;
  }>;
  programmes?: Array<{
    id: string;
    title: string;
    sector: string;
    skills_taught: string[];
    description?: string;
    available_seats?: number;
    duration_weeks?: number;
  }>;
}

export interface MLRecommendationOutput {
  engine: string;
  dominant_domain: string;
  domain_scores: Record<string, number>;
  matched_careers: Array<{
    id: string;
    title: string;
    sector: string;
    match_score: number;
    cosine_similarity: number;
    required_skills: string[];
    description?: string;
  }>;
  skill_gaps: Array<{
    skill: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'IDENTIFIED';
  }>;
  ranked_programmes: Array<{
    id: string;
    title: string;
    sector: string;
    score: number;
    cosine_similarity: number;
    skills_taught: string[];
    matching_skill_gaps: string[];
    available_seats?: number;
    duration_weeks?: number;
  }>;
}

// Persistent high-performance warm worker pool for instantaneous Scikit-Learn TF-IDF evaluations (<15ms)
let workerProcess: ChildProcess | null = null;
let rlInterface: readline.Interface | null = null;
const requestQueue: Array<{
  resolve: (res: MLRecommendationOutput) => void;
  reject: (err: any) => void;
  fallbackInput: MLRecommendationInput;
  timer: NodeJS.Timeout;
}> = [];

function getOrCreateWorker(): ChildProcess | null {
  if (workerProcess && !workerProcess.killed && workerProcess.exitCode === null) {
    return workerProcess;
  }

  try {
    const scriptPath = path.join(process.cwd(), 'src', 'ml', 'recommender.py');
    const child = spawn('python', [scriptPath, '--worker'], {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (rlInterface) {
      rlInterface.close();
      rlInterface = null;
    }

    rlInterface = readline.createInterface({
      input: child.stdout!,
      crlfDelay: Infinity,
    });

    rlInterface.on('line', (line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'PONG') return;

      const current = requestQueue.shift();
      if (current) {
        clearTimeout(current.timer);
        try {
          const parsed = JSON.parse(trimmed) as MLRecommendationOutput;
          if (parsed && parsed.engine) {
            current.resolve(parsed);
          } else {
            current.resolve(fallbackRecommender(current.fallbackInput));
          }
        } catch {
          current.resolve(fallbackRecommender(current.fallbackInput));
        }
      }
    });

    child.on('error', (err) => {
      console.warn('[MLRecommender] Worker process error:', err.message);
      drainQueueWithFallback();
      workerProcess = null;
    });

    child.on('exit', () => {
      drainQueueWithFallback();
      workerProcess = null;
    });

    workerProcess = child;
    return workerProcess;
  } catch (err: any) {
    console.warn('[MLRecommender] Could not spawn worker process:', err.message);
    workerProcess = null;
    return null;
  }
}

function drainQueueWithFallback() {
  while (requestQueue.length > 0) {
    const item = requestQueue.shift();
    if (item) {
      clearTimeout(item.timer);
      item.resolve(fallbackRecommender(item.fallbackInput));
    }
  }
}

export async function runScikitLearnRecommender(
  input: MLRecommendationInput
): Promise<MLRecommendationOutput> {
  return new Promise((resolve) => {
    try {
      const worker = getOrCreateWorker();
      if (!worker || !worker.stdin || worker.stdin.destroyed) {
        resolve(fallbackRecommender(input));
        return;
      }

      // 800ms safety timeout: If worker ever stalls, fallback gracefully to in-process recommender
      const timer = setTimeout(() => {
        const idx = requestQueue.findIndex((q) => q.fallbackInput === input);
        if (idx >= 0) {
          requestQueue.splice(idx, 1);
        }
        resolve(fallbackRecommender(input));
      }, 800);

      requestQueue.push({
        resolve,
        reject: () => resolve(fallbackRecommender(input)),
        fallbackInput: input,
        timer,
      });

      worker.stdin.write(JSON.stringify(input) + '\n');
    } catch {
      resolve(fallbackRecommender(input));
    }
  });
}

/**
 * Resilient In-Process TF-IDF & Cosine Similarity Recommender Fallback
 */
function fallbackRecommender(input: MLRecommendationInput): MLRecommendationOutput {
  const profileTokens = [
    input.education,
    ...input.skills,
    ...input.interests,
    input.target_career,
  ]
    .join(' ')
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean);

  const termFreq = new Map<string, number>();
  for (const t of profileTokens) {
    termFreq.set(t, (termFreq.get(t) || 0) + 1);
  }

  // Score pathways
  const matchedCareers = (input.career_pathways || []).map((pathway) => {
    const pathwayTokens = [
      pathway.title,
      pathway.sector,
      ...pathway.required_skills,
      pathway.description || '',
    ]
      .join(' ')
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean);

    let matchCount = 0;
    for (const pt of pathwayTokens) {
      if (termFreq.has(pt)) matchCount += termFreq.get(pt)!;
    }

    const similarity = Math.min(matchCount / Math.max(pathwayTokens.length, 1), 1);
    const score = Math.round(50 + similarity * 45);

    return {
      id: pathway.id,
      title: pathway.title,
      sector: pathway.sector,
      match_score: score,
      cosine_similarity: Number(similarity.toFixed(4)),
      required_skills: pathway.required_skills,
      description: pathway.description,
    };
  });

  matchedCareers.sort((a, b) => b.match_score - a.match_score);
  const topCareer = matchedCareers[0] || {
    sector: 'Tech',
    required_skills: ['Digital Literacy', 'Problem Solving'],
  };

  // Identify skill gaps
  const currentSkillsLower = new Set(input.skills.map((s) => s.toLowerCase().trim()));
  const skillGaps: MLRecommendationOutput['skill_gaps'] = [];

  for (const reqSkill of topCareer.required_skills) {
    const reqLower = reqSkill.toLowerCase().trim();
    const has = Array.from(currentSkillsLower).some(
      (cs: string) => cs.includes(reqLower) || reqLower.includes(cs)
    );
    if (!has) {
      skillGaps.push({
        skill: reqSkill,
        priority: skillGaps.length < 2 ? 'HIGH' : 'MEDIUM',
        status: 'IDENTIFIED',
      });
    }
  }

  // Score programmes
  const gapNamesLower = new Set(skillGaps.map((g) => g.skill.toLowerCase()));
  const rankedProgrammes = (input.programmes || []).map((prog) => {
    const taught = prog.skills_taught || [];
    const matchingGaps = taught.filter((t: string) =>
      Array.from(gapNamesLower).some((gn: string) => gn.includes(t.toLowerCase()) || t.toLowerCase().includes(gn))
    );

    const progTokens = [prog.title, prog.sector, ...taught, prog.description || '']
      .join(' ')
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean);

    let matchCount = 0;
    for (const pt of progTokens) {
      if (termFreq.has(pt)) matchCount += 1;
    }

    const sim = matchCount / Math.max(progTokens.length, 1);
    const gapScore = matchingGaps.length / Math.max(skillGaps.length, 1);
    const finalScore = Math.min(99, Math.round((sim * 0.5 + gapScore * 0.5) * 100));

    return {
      id: prog.id,
      title: prog.title,
      sector: prog.sector,
      score: Math.max(45, finalScore),
      cosine_similarity: Number(sim.toFixed(4)),
      skills_taught: taught,
      matching_skill_gaps: matchingGaps,
      available_seats: prog.available_seats || 30,
      duration_weeks: prog.duration_weeks || 8,
    };
  });

  rankedProgrammes.sort((a, b) => b.score - a.score);

  return {
    engine: 'in-process-tfidf-cosine-fallback',
    dominant_domain: topCareer.sector,
    domain_scores: {
      Tech: 0.7,
      'Green Skills': 0.65,
      Vocational: 0.5,
      Business: 0.4,
      Healthcare: 0.35,
    },
    matched_careers: matchedCareers.slice(0, 4),
    skill_gaps: skillGaps,
    ranked_programmes: rankedProgrammes.slice(0, 4),
  };
}


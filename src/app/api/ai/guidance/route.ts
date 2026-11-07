export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_COURSES, INITIAL_PATHWAYS, INITIAL_SKILLS } from '@/lib/constants';
import { GuidanceRecommendation } from '@/types';
import { runScikitLearnRecommender } from '@/services/mlService';
import { geminiService } from '@/services/geminiService';
import { detectQuestionLanguage } from '@/lib/languageDetector';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message = '', language, user, history } = body;

    // 1. Accurately detect language from the user's actual question text first
    const effectiveLang = detectQuestionLanguage(message, language);
    const msgLower = (message || '').toLowerCase();

    // 2. Format corpus for Scikit-Learn Recommender
    const formattedPathways = INITIAL_PATHWAYS.map((p) => ({
      id: p.id,
      title: p.title,
      sector: p.sector,
      required_skills: p.stages.flatMap((s) => s.keyActions),
      description: p.description,
    }));

    const formattedProgrammes = INITIAL_COURSES.map((c) => ({
      id: c.id,
      title: c.title,
      sector:
        c.title.toLowerCase().includes('solar')
          ? 'Green Skills'
          : c.title.toLowerCase().includes('electric')
          ? 'Vocational'
          : 'Tech',
      skills_taught: c.skillsTaught,
      description: c.description,
    }));

    // 3. Run Google Gemini AI & RAG Pipeline
    const geminiResult = await geminiService.generateGuidance({
      message,
      language: effectiveLang,
      user,
      history,
    });

    // 4. Run Scikit-Learn Recommender
    const mlResult = await runScikitLearnRecommender({
      education: user?.educationLevel || 'Graduate / Diploma',
      skills: user?.currentSkills || [],
      interests: user?.interests || [message],
      target_career: user?.targetCareer || message,
      preferred_language: effectiveLang,
      career_pathways: formattedPathways,
      programmes: formattedProgrammes,
    });

    // 5. Contextual Domain & Pathway Mapping
    let domain: 'Tech' | 'Green Skills' | 'Vocational' | 'Business' | 'Healthcare' = 'Tech';
    let chosenPathwayId = geminiResult.recommendedPathwayId || 'path-9';

    // Question keyword mapping takes decisive priority
    if (
      msgLower.includes('internship') ||
      msgLower.includes('இன்டர்ன்ஷிப்') ||
      msgLower.includes('second year') ||
      msgLower.includes('இரண்டாம் ஆண்டு') ||
      msgLower.includes('college student') ||
      msgLower.includes('படிப்பு முடிவதற்குள்')
    ) {
      domain = 'Tech';
      chosenPathwayId = 'path-12'; // College Internship & Industry Apprenticeship Accelerator
    } else if (
      msgLower.includes('cybersecurity') ||
      msgLower.includes('security') ||
      msgLower.includes('hacker') ||
      msgLower.includes('ethical hacking') ||
      msgLower.includes('soc analyst') ||
      msgLower.includes('சைபர்') ||
      msgLower.includes('ஹேக்கிங்')
    ) {
      domain = 'Tech';
      chosenPathwayId = 'path-10'; // Cybersecurity Analyst & Network Defender
    } else if (
      msgLower.includes('mechanical') ||
      msgLower.includes('மெக்கானிக்கல்') ||
      msgLower.includes('cad') ||
      msgLower.includes('solidworks') ||
      msgLower.includes('ansys') ||
      msgLower.includes('mechatronics') ||
      msgLower.includes('இயந்திரவியல்')
    ) {
      domain = 'Vocational';
      chosenPathwayId = 'path-11'; // Mechanical & Mechatronics Design Engineer
    } else if (
      msgLower.includes('software') ||
      msgLower.includes('developer') ||
      msgLower.includes('web dev') ||
      msgLower.includes('web development') ||
      msgLower.includes('coding') ||
      msgLower.includes('programmer') ||
      msgLower.includes('frontend') ||
      msgLower.includes('backend') ||
      msgLower.includes('full stack') ||
      msgLower.includes('react') ||
      msgLower.includes('மென்பொருள்') ||
      msgLower.includes('வலைப்பக்க') ||
      msgLower.includes('டெவலப்பர்') ||
      msgLower.includes('डेवलपर') ||
      msgLower.includes('सॉफ्टवेयर')
    ) {
      domain = 'Tech';
      chosenPathwayId = 'path-3'; // Junior Full-Stack Web Developer
    } else if (
      msgLower.includes('business analyst') ||
      msgLower.includes('ba role') ||
      msgLower.includes('agile') ||
      msgLower.includes('scrum') ||
      msgLower.includes('user stories') ||
      msgLower.includes('requirements') ||
      msgLower.includes('வணிக பகுப்பாய்வு') ||
      msgLower.includes('தொழில் மேலாண்மை') ||
      msgLower.includes('बिजनेस एनालिस्ट')
    ) {
      domain = 'Business';
      chosenPathwayId = 'path-4'; // Junior Business Analyst
    } else if (
      msgLower.includes('digital marketing') ||
      msgLower.includes('marketing') ||
      msgLower.includes('seo') ||
      msgLower.includes('social media') ||
      msgLower.includes('ads') ||
      msgLower.includes('விற்பனை') ||
      msgLower.includes('டிஜிட்டல் மார்க்கெட்டிங்') ||
      msgLower.includes('मार्केटिंग')
    ) {
      domain = 'Business';
      chosenPathwayId = 'path-5'; // Digital Marketing Executive
    } else if (
      /\bhr\b/i.test(msgLower) ||
      msgLower.includes('human resources') ||
      msgLower.includes('recruitment') ||
      msgLower.includes('talent') ||
      msgLower.includes('ஆள்தேர்வு') ||
      msgLower.includes('மனிதவள') ||
      msgLower.includes('ஹெச்ஆர்') ||
      msgLower.includes('एचआर')
    ) {
      domain = 'Business';
      chosenPathwayId = 'path-6'; // HR & Talent Operations
    } else if (
      /\bev\b/i.test(msgLower) ||
      msgLower.includes('electric vehicle') ||
      msgLower.includes('battery') ||
      msgLower.includes('charging station') ||
      msgLower.includes('வாகன') ||
      msgLower.includes('वाहन') ||
      msgLower.includes('மின்னணு வாகனம்') ||
      msgLower.includes('இलेक्ट्रिक वाहन') ||
      msgLower.includes('ईवी')
    ) {
      domain = 'Vocational';
      chosenPathwayId = 'path-7'; // EV Technician
    } else if (
      msgLower.includes('solar') ||
      msgLower.includes('சூரிய') ||
      msgLower.includes('சோலார்') ||
      msgLower.includes('सौर') ||
      msgLower.includes('सोलर') ||
      msgLower.includes('green energy') ||
      msgLower.includes('photovoltaic')
    ) {
      domain = 'Green Skills';
      chosenPathwayId = 'path-2'; // Certified Renewable Energy (Solar) Entrepreneur
    } else if (
      msgLower.includes('nurse') ||
      msgLower.includes('health') ||
      msgLower.includes('மருத்துவ') ||
      msgLower.includes('நோயாளி') ||
      msgLower.includes('स्वास्थ्य') ||
      msgLower.includes('अस्पताल') ||
      msgLower.includes('patient')
    ) {
      domain = 'Healthcare';
      chosenPathwayId = 'path-8'; // Healthcare & Patient Support Specialist
    } else if (
      msgLower.includes('data analyst') ||
      msgLower.includes('data science') ||
      msgLower.includes('power bi') ||
      msgLower.includes('sql') ||
      msgLower.includes('டேட்டா') ||
      msgLower.includes('தரவு') ||
      msgLower.includes('डेटा')
    ) {
      domain = 'Tech';
      chosenPathwayId = 'path-1'; // Junior Data Analyst
    } else if (
      msgLower.includes('graduate') ||
      msgLower.includes('college') ||
      msgLower.includes('degree') ||
      msgLower.includes('after graduation') ||
      msgLower.includes('fresher') ||
      msgLower.includes('கல்லூரி') ||
      msgLower.includes('பட்டம்') ||
      msgLower.includes('ग्रेजुएशन')
    ) {
      domain = 'Tech';
      chosenPathwayId = 'path-9'; // Fresh Graduates Career Launchpad
    } else if (!chosenPathwayId || chosenPathwayId === 'path-9') {
      const topMLTitle = mlResult.matched_careers?.[0]?.title?.toLowerCase() || '';
      const matchedByML = INITIAL_PATHWAYS.find(
        (p) =>
          p.title.toLowerCase().includes(topMLTitle) ||
          topMLTitle.includes(p.title.toLowerCase())
      );
      if (matchedByML) {
        chosenPathwayId = matchedByML.id;
      }
    }

    const primaryPathway =
      INITIAL_PATHWAYS.find((p) => p.id === chosenPathwayId) ||
      INITIAL_PATHWAYS.find((p) => p.id === 'path-12') ||
      INITIAL_PATHWAYS.find((p) => p.id === 'path-9') ||
      INITIAL_PATHWAYS[0];

    const relatedPathways = INITIAL_PATHWAYS.filter(
      (p) => p.id !== primaryPathway.id && p.sector.toLowerCase().includes(domain.toLowerCase())
    );
    const pathwayToReturn = [primaryPathway, ...relatedPathways].slice(0, 2);

    const matchedSkills = INITIAL_SKILLS.filter(
      (s) => s.category.toLowerCase() === domain.toLowerCase()
    ).slice(0, 3);
    const finalSkills = matchedSkills.length > 0 ? matchedSkills : INITIAL_SKILLS.slice(0, 3);

    const matchedCourses = INITIAL_COURSES.filter(
      (c) =>
        c.title.toLowerCase().includes(domain.toLowerCase()) ||
        c.skillsTaught.some((sk) => finalSkills.map((m) => m.name).includes(sk))
    );
    const coursesToReturn =
      matchedCourses.length > 0 ? matchedCourses.slice(0, 3) : INITIAL_COURSES.slice(0, 3);

    const recommendations: GuidanceRecommendation = {
      summary: geminiResult.summary,
      summaryTa: geminiResult.summaryTa,
      detectedIntent: domain,
      skills: finalSkills,
      courses: coursesToReturn,
      careerPathways: pathwayToReturn,
      nextSteps: geminiResult.actionableSteps,
    };

    // If user is authenticated, record conversation transcript in DB if possible
    if (user?.id) {
      try {
        const convId = `conv-${Date.now()}`;
        db.prepare(`
          INSERT OR IGNORE INTO conversations (id, user_id, title, language, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(convId, user.id, message.slice(0, 40), effectiveLang, new Date().toISOString());

        db.prepare(`
          INSERT INTO voice_transcripts (id, conversation_id, user_id, segment_id, original_transcript, language, is_final, provider, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
        `).run(
          `tr-${Date.now()}`,
          convId,
          user.id,
          `seg-${Date.now()}`,
          message,
          effectiveLang,
          geminiResult.provider,
          new Date().toISOString()
        );
      } catch {
        // Non-fatal logging
      }
    }

    return NextResponse.json({
      message: geminiResult.message,
      detected_language: effectiveLang,
      recommendations,
      recommendation_engine: mlResult.engine,
      ai_provider: geminiResult.provider,
      provider_status: 'active',
      skill_gaps: mlResult.skill_gaps,
      career_reasoning: geminiResult.careerReasoning,
    });
  } catch (error) {
    console.error('API Guidance Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI guidance request' },
      { status: 500 }
    );
  }
}

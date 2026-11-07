export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runScikitLearnRecommender } from '@/services/mlService';
import { gnaniService } from '@/services/gnaniService';
import { INITIAL_PATHWAYS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      education = '12th Standard / Graduate',
      skills = [],
      interests = [],
      targetCareer = 'Technology & Green Skills',
      language = 'ta-IN',
      name = 'Learner',
      organizationId,
    } = body;

    // Fetch relevant programmes from DB
    let query = `SELECT id, title, sector, skills_taught_json, description, available_seats, duration_weeks FROM training_programmes WHERE status = 'ACTIVE'`;
    const params: string[] = [];
    if (organizationId) {
      query += ` AND (organization_id = ? OR organization_id IS NULL)`;
      params.push(organizationId);
    }

    const dbProgs = db.prepare(query).all(...params) as Array<{
      id: string;
      title: string;
      sector: string;
      skills_taught_json: string;
      description: string;
      available_seats: number;
      duration_weeks: number;
    }>;

    const formattedProgrammes = dbProgs.map((p) => ({
      id: p.id,
      title: p.title,
      sector: p.sector,
      skills_taught: JSON.parse(p.skills_taught_json || '[]'),
      description: p.description,
      available_seats: p.available_seats,
      duration_weeks: p.duration_weeks,
    }));

    const formattedPathways = INITIAL_PATHWAYS.map((p) => ({
      id: p.id,
      title: p.title,
      sector: p.sector,
      required_skills: p.stages.flatMap((s) => s.keyActions),
      description: p.description,
    }));

    // 1. Scikit-Learn Recommender
    const mlResult = await runScikitLearnRecommender({
      education,
      skills,
      interests,
      target_career: targetCareer,
      preferred_language: language,
      career_pathways: formattedPathways,
      programmes: formattedProgrammes,
    });

    // 2. Gnani Evon 30B Reasoning Model
    const evonResult = await gnaniService.generateEvonGuidance({
      education,
      skills,
      interests,
      targetCareer,
      preferredLanguage: language,
      beneficiaryName: name,
      skillGaps: mlResult.skill_gaps,
      matchedCareers: mlResult.matched_careers,
      rankedProgrammes: mlResult.ranked_programmes,
    });

    return NextResponse.json({
      success: true,
      engine: mlResult.engine,
      aiProvider: evonResult.provider,
      providerStatus: evonResult.status,
      dominantDomain: mlResult.dominant_domain,
      domainScores: mlResult.domain_scores,
      matchedCareers: mlResult.matched_careers,
      skillGaps: mlResult.skill_gaps,
      recommendedProgrammes: mlResult.ranked_programmes,
      guidance: {
        message: evonResult.message,
        summary: evonResult.summary,
        summaryTa: evonResult.summaryTa,
        actionableSteps: evonResult.actionableSteps,
        careerReasoning: evonResult.careerReasoning,
      },
    });
  } catch (error) {
    console.error('Recommend API Error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations.' }, { status: 500 });
  }
}

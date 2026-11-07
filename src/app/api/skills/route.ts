export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { INITIAL_SKILLS } from '@/lib/constants';

export async function GET() {
  return NextResponse.json(INITIAL_SKILLS);
}

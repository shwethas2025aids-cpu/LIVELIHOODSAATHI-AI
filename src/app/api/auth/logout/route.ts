export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  response.cookies.delete('saathi_token');
  response.cookies.delete('token');

  return response;
}

import { generateRequestToken } from '@/lib/auth/requestToken';
import { NextResponse } from 'next/server';

export async function GET() {
  // WARNING: In production, secure this endpoint or remove it entirely
  const { token } = generateRequestToken();
  return NextResponse.json({ token });
}

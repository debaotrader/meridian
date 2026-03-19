import { NextResponse } from 'next/server';

/**
 * Returns the MC_API_TOKEN for same-origin browser requests.
 * The middleware already validates same-origin before reaching this route.
 */
export async function GET() {
  const token = process.env.MC_API_TOKEN;
  
  if (!token) {
    return NextResponse.json(
      { error: 'No API token configured' },
      { status: 500 }
    );
  }

  return NextResponse.json({ token });
}

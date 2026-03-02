import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { getHomeSideRailsFallback, type HomeSideRailsData } from '@/lib/home-side-rails';

export async function GET() {
  try {
    const pool = getDbPool();
    const result = await pool.query(
      `SELECT data FROM website_side_rails ORDER BY updated_at DESC LIMIT 1`
    );
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: getHomeSideRailsFallback(),
      });
    }
    const data = result.rows[0]?.data ?? getHomeSideRailsFallback();
    return NextResponse.json({ success: true, data: data as HomeSideRailsData });
  } catch {
    return NextResponse.json({
      success: true,
      data: getHomeSideRailsFallback(),
    });
  }
}

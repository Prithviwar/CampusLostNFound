import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function GET(_req: NextRequest) {
  try {
    const [rows] = await pool.execute(
      'SELECT location_id, building, area, description FROM Locations ORDER BY building, area'
    ) as any;
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/mysql';

// GET /api/claims - get claims for current user or all claims (admin)
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const scope = new URL(req.url).searchParams.get('scope');
    let query: string;
    let params: any[];

    if (user.role === 'ADMIN' && scope === 'all') {
      query = `
        SELECT c.*, i.title AS item_title, i.category, i.report_type,
               u.name AS claimant_name, u.email AS claimant_email,
               r.name AS reviewer_name
        FROM Claims c
        JOIN Items i ON c.item_id = i.item_id
        JOIN Users u ON c.claimed_by = u.user_id
        LEFT JOIN Users r ON c.reviewed_by = r.user_id
        ORDER BY c.created_at DESC`;
      params = [];
    } else {
      query = `
        SELECT c.*, i.title AS item_title, i.category, i.report_type,
               r.name AS reviewer_name
        FROM Claims c
        JOIN Items i ON c.item_id = i.item_id
        LEFT JOIN Users r ON c.reviewed_by = r.user_id
        WHERE c.claimed_by = ?
        ORDER BY c.created_at DESC`;
      params = [user.userId];
    }

    const [rows] = await pool.execute(query, params) as any;
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
  }
}

// POST /api/claims - submit a new claim
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { item_id, claim_description } = await req.json();
    if (!item_id || !claim_description) {
      return NextResponse.json({ error: 'item_id and claim_description are required' }, { status: 400 });
    }

    const [result] = await pool.execute(
      'INSERT INTO Claims (item_id, claimed_by, claim_description) VALUES (?, ?, ?)',
      [item_id, user.userId, claim_description]
    ) as any;

    return NextResponse.json({ claimId: result.insertId }, { status: 201 });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'You have already submitted a claim for this item' }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Failed to submit claim' }, { status: 500 });
  }
}

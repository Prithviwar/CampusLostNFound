import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/mysql';

// PATCH /api/claims/[id] - approve or reject a claim (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const claimId = Number(id);
    const { status } = await req.json(); // 'APPROVED' | 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Call the stored procedure (handles transaction internally)
    await pool.execute('CALL approve_claim(?, ?, ?)', [claimId, user.userId, status]);

    return NextResponse.json({ message: `Claim ${status.toLowerCase()} successfully` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 });
  }
}

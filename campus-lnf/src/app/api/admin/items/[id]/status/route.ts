import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/mysql';

// PATCH /api/admin/items/[id]/status
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
    const itemId = Number(id);
    const { status } = await req.json();

    const validStatuses = ['REPORTED', 'MATCHED', 'CLAIMED', 'VERIFIED', 'RETURNED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await pool.execute('UPDATE Items SET status = ? WHERE item_id = ?', [status, itemId]);

    return NextResponse.json({ message: 'Item status updated' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update item status' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/mysql';
import { getCollection } from '@/lib/mongodb';
import { runMatching } from '@/lib/matching';

// GET /api/items - list/search items
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category    = searchParams.get('category');
    const report_type = searchParams.get('report_type');
    const status      = searchParams.get('status');
    const location_id = searchParams.get('location_id');

    let query = `
      SELECT i.*, u.name AS reporter_name, l.building, l.area
      FROM Items i
      JOIN Users u     ON i.reported_by  = u.user_id
      JOIN Locations l ON i.location_id  = l.location_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category)    { query += ' AND i.category = ?';    params.push(category); }
    if (report_type) { query += ' AND i.report_type = ?'; params.push(report_type); }
    if (status)      { query += ' AND i.status = ?';      params.push(status); }
    if (location_id) { query += ' AND i.location_id = ?'; params.push(Number(location_id)); }

    query += ' ORDER BY i.created_at DESC LIMIT 100';

    const [rows] = await pool.execute(query, params) as any;
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

// POST /api/items - create a new item report
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { location_id, report_type, category, title, reported_date, details } = body;

    if (!location_id || !report_type || !category || !title || !reported_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Insert into MySQL
    const [result] = await pool.execute(
      `INSERT INTO Items (reported_by, location_id, report_type, category, title, reported_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.userId, location_id, report_type, category, title, reported_date]
    ) as any;

    const newItemId: number = result.insertId;

    // 2. Insert flexible details into MongoDB
    const col = await getCollection('item_details');
    await col.insertOne({
      item_id: newItemId,
      description: details?.description || title,
      visual_attributes: {
        color: details?.color || '',
        brand: details?.brand || 'Unknown',
        identifying_marks: details?.identifying_marks || [],
      },
      category_attributes: details?.category_attributes || {},
      keywords: details?.keywords || [category.toLowerCase(), ...title.toLowerCase().split(' ')],
      image_url: details?.image_url || null,
      search_metadata: {
        normalized_text: `${details?.description || title} ${details?.color || ''} ${details?.brand || ''}`.toLowerCase(),
      },
      updated_at: new Date(),
    });

    // 3. Run matching algorithm
    const oppositeType = report_type === 'LOST' ? 'FOUND' : 'LOST';
    const [oppositeRows] = await pool.execute(
      `SELECT item_id, category, location_id, reported_date
       FROM Items
       WHERE report_type = ? AND status NOT IN ('RETURNED','CLOSED') AND item_id <> ?`,
      [oppositeType, newItemId]
    ) as any;

    const matches = await runMatching(
      { item_id: newItemId, report_type, category, location_id, reported_date },
      oppositeRows
    );

    // 4. Save high-confidence matches to MySQL
    for (const m of matches) {
      const lostId  = report_type === 'LOST' ? newItemId : m.otherId;
      const foundId = report_type === 'LOST' ? m.otherId : newItemId;
      await pool.execute(
        `INSERT IGNORE INTO Matches (lost_item_id, found_item_id, match_score, match_reason)
         VALUES (?, ?, ?, ?)`,
        [lostId, foundId, m.score, m.reason]
      );

      // Update status to MATCHED if not already
      await pool.execute(
        `UPDATE Items SET status = 'MATCHED' WHERE item_id IN (?, ?) AND status = 'REPORTED'`,
        [lostId, foundId]
      );
    }

    return NextResponse.json({ itemId: newItemId, matches }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create item report' }, { status: 500 });
  }
}

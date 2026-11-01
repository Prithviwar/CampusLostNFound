import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { getCollection } from '@/lib/mongodb';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = Number(id);

    // Fetch MySQL record
    const [rows] = await pool.execute(
      `SELECT i.*, u.name AS reporter_name, u.email AS reporter_email,
              l.building, l.area, l.description AS location_desc
       FROM Items i
       JOIN Users u     ON i.reported_by  = u.user_id
       JOIN Locations l ON i.location_id  = l.location_id
       WHERE i.item_id = ?`,
      [itemId]
    ) as any;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Fetch MongoDB details
    const col     = await getCollection('item_details');
    const details = await col.findOne({ item_id: itemId });

    // Fetch matches
    const [matches] = await pool.execute(
      `SELECT m.*, 
              li.title AS lost_title,  li.category AS lost_category,
              fi.title AS found_title, fi.category AS found_category
       FROM Matches m
       JOIN Items li ON m.lost_item_id  = li.item_id
       JOIN Items fi ON m.found_item_id = fi.item_id
       WHERE m.lost_item_id = ? OR m.found_item_id = ?
       ORDER BY m.match_score DESC`,
      [itemId, itemId]
    ) as any;

    // Fetch status history
    const [history] = await pool.execute(
      `SELECT sh.*, u.name AS changed_by_name
       FROM StatusHistory sh
       JOIN Users u ON sh.changed_by = u.user_id
       WHERE sh.item_id = ?
       ORDER BY sh.changed_at`,
      [itemId]
    ) as any;

    return NextResponse.json({ item: rows[0], details, matches, history });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

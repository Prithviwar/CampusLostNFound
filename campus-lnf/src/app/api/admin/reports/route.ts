import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/mysql';
import { getCollection } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 1. Reports by category (SQL GROUP BY)
    const [byCategory] = await pool.execute(`
      SELECT category,
             COUNT(*) AS total_reports,
             SUM(report_type='LOST')  AS lost_count,
             SUM(report_type='FOUND') AS found_count
      FROM Items
      GROUP BY category
      ORDER BY total_reports DESC
    `) as any;

    // 2. Reports by location (JOIN + GROUP BY)
    const [byLocation] = await pool.execute(`
      SELECT l.building, l.area, COUNT(i.item_id) AS total_reports
      FROM Items i
      JOIN Locations l ON i.location_id = l.location_id
      GROUP BY l.building, l.area
      ORDER BY total_reports DESC
    `) as any;

    // 3. Recovery rate by category
    const [recoveryRate] = await pool.execute(`
      SELECT category,
             COUNT(*) AS total_items,
             SUM(status = 'RETURNED') AS returned_items,
             ROUND(100.0 * SUM(status = 'RETURNED') / COUNT(*), 2) AS recovery_rate
      FROM Items
      GROUP BY category
      ORDER BY recovery_rate DESC
    `) as any;

    // 4. Claim approval rate by administrator
    const [claimApproval] = await pool.execute(`
      SELECT u.name AS administrator,
             COUNT(c.claim_id) AS reviewed_claims,
             SUM(c.status = 'APPROVED') AS approved_claims,
             ROUND(100.0 * SUM(c.status = 'APPROVED') / COUNT(c.claim_id), 2) AS approval_pct
      FROM Claims c
      JOIN Users u ON c.reviewed_by = u.user_id
      WHERE c.status IN ('APPROVED','REJECTED')
      GROUP BY u.user_id, u.name
    `) as any;

    // 5. Average days to return (SUBQUERY + JOIN)
    const [avgReturn] = await pool.execute(`
      SELECT i.category,
             ROUND(AVG(DATEDIFF(sh.changed_at, i.reported_date)), 1) AS avg_days_to_return
      FROM StatusHistory sh
      JOIN Items i ON sh.item_id = i.item_id
      WHERE sh.new_status = 'RETURNED'
      GROUP BY i.category
      ORDER BY avg_days_to_return
    `) as any;

    // 6. Overall summary stats
    const [summary] = await pool.execute(`
      SELECT
        COUNT(*) AS total_items,
        SUM(report_type = 'LOST')  AS total_lost,
        SUM(report_type = 'FOUND') AS total_found,
        SUM(status = 'RETURNED')   AS total_returned,
        SUM(status = 'REPORTED')   AS total_active
      FROM Items
    `) as any;

    // 7. Pending claims count
    const [pendingClaims] = await pool.execute(`
      SELECT COUNT(*) AS pending FROM Claims WHERE status = 'PENDING'
    `) as any;

    // 8. MongoDB aggregation: items by type
    const col = await getCollection('item_details');
    const mongoByType = await col.aggregate([
      { $group: { _id: '$category_attributes.item_type', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]).toArray();

    // 9. MongoDB aggregation: top keywords
    const topKeywords = await col.aggregate([
      { $unwind: '$keywords' },
      { $group: { _id: '$keywords', frequency: { $sum: 1 } } },
      { $sort: { frequency: -1 } },
      { $limit: 10 },
    ]).toArray();

    // 10. MongoDB aggregation: color distribution
    const colorDist = await col.aggregate([
      { $group: { _id: '$visual_attributes.color', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray();

    return NextResponse.json({
      summary: summary[0],
      pendingClaims: pendingClaims[0].pending,
      byCategory,
      byLocation,
      recoveryRate,
      claimApproval,
      avgReturn,
      mongo: { byType: mongoByType, topKeywords, colorDist },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 });
  }
}

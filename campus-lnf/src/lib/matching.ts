import { getCollection } from '@/lib/mongodb';

export interface ItemDetails {
  item_id: number;
  description: string;
  visual_attributes: {
    color: string;
    brand: string;
    identifying_marks: string[];
  };
  category_attributes: Record<string, unknown>;
  keywords: string[];
  image_url: string | null;
  search_metadata: { normalized_text: string };
  updated_at: Date;
}

export interface MatchResult {
  score: number;
  reasons: string[];
}

/**
 * Rule-based matching algorithm.
 * Compares two item detail documents and returns a 0-100 score
 * with human-readable explanations for each scoring factor.
 */
export function computeMatchScore(
  lostDetails: ItemDetails,
  foundDetails: ItemDetails,
  lostMysql: { category: string; location_id: number; reported_date: string },
  foundMysql: { category: string; location_id: number; reported_date: string }
): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  // 1. Same category (25 pts)
  if (lostMysql.category.toLowerCase() === foundMysql.category.toLowerCase()) {
    score += 25;
    reasons.push(`Same category "${lostMysql.category}" (+25 pts)`);
  }

  // 2. Same or nearby location (20 pts)
  if (lostMysql.location_id === foundMysql.location_id) {
    score += 20;
    reasons.push('Same campus location (+20 pts)');
  }

  // 3. Same brand (15 pts)
  const lostBrand  = (lostDetails.visual_attributes?.brand  || '').toLowerCase();
  const foundBrand = (foundDetails.visual_attributes?.brand || '').toLowerCase();
  if (lostBrand && foundBrand && lostBrand !== 'unknown' && lostBrand === foundBrand) {
    score += 15;
    reasons.push(`Same brand "${lostDetails.visual_attributes.brand}" (+15 pts)`);
  }

  // 4. Reported within 3 days (15 pts)
  const lostDate  = new Date(lostMysql.reported_date).getTime();
  const foundDate = new Date(foundMysql.reported_date).getTime();
  const daysDiff  = Math.abs(lostDate - foundDate) / (1000 * 60 * 60 * 24);
  if (daysDiff <= 3) {
    score += 15;
    reasons.push(`Reported within ${Math.round(daysDiff)} day(s) of each other (+15 pts)`);
  }

  // 5. Same color (10 pts)
  const lostColor  = (lostDetails.visual_attributes?.color  || '').toLowerCase();
  const foundColor = (foundDetails.visual_attributes?.color || '').toLowerCase();
  if (lostColor && foundColor && lostColor === foundColor) {
    score += 10;
    reasons.push(`Same color "${lostDetails.visual_attributes.color}" (+10 pts)`);
  }

  // 6. Common description keywords (up to 15 pts)
  const lostKw  = new Set((lostDetails.keywords  || []).map(k => k.toLowerCase()));
  const foundKw = new Set((foundDetails.keywords || []).map(k => k.toLowerCase()));
  const common  = [...lostKw].filter(k => foundKw.has(k));
  if (common.length > 0) {
    const kwPts = Math.min(15, common.length * 5);
    score += kwPts;
    reasons.push(`${common.length} common keyword(s): ${common.join(', ')} (+${kwPts} pts)`);
  }

  return { score: Math.min(100, score), reasons };
}

/**
 * Run matching for a newly submitted item against all opposite-type active reports.
 * Saves matches with score >= threshold (default 50) to MySQL.
 */
export async function runMatching(
  newItem: { item_id: number; report_type: string; category: string; location_id: number; reported_date: string },
  oppositeItems: Array<{ item_id: number; category: string; location_id: number; reported_date: string }>,
  threshold = 50
): Promise<Array<{ otherId: number; score: number; reason: string }>> {
  const col = await getCollection('item_details');

  // Fetch MongoDB document for the new item
  const newDetails = await col.findOne({ item_id: newItem.item_id }) as ItemDetails | null;
  if (!newDetails) return [];

  const results: Array<{ otherId: number; score: number; reason: string }> = [];

  for (const other of oppositeItems) {
    const otherDetails = await col.findOne({ item_id: other.item_id }) as ItemDetails | null;
    if (!otherDetails) continue;

    const lostMysql  = newItem.report_type === 'LOST' ? newItem  : other;
    const foundMysql = newItem.report_type === 'LOST' ? other   : newItem;
    const lostDet    = newItem.report_type === 'LOST' ? newDetails : otherDetails;
    const foundDet   = newItem.report_type === 'LOST' ? otherDetails : newDetails;

    const { score, reasons } = computeMatchScore(lostDet, foundDet, lostMysql as any, foundMysql as any);

    if (score >= threshold) {
      results.push({ otherId: other.item_id, score, reason: reasons.join(' | ') });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

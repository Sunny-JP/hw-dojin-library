import { sql } from '@/lib/db';

// Type definition (no change)
export type DoujinshiFromDB = {
  id: string;
  title: string;
  circle: string | null;
  authors: string[];
  genres: string[];
  publishedDate: string;
  thumbnailUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Accept primitive values directly again
export async function getDoujinshiList(
  search?: string,
  rawGenres?: string | string[] // Accept raw value
): Promise<DoujinshiFromDB[]> {
  // ▼▼▼ Ensure defaults and array conversion happen here ▼▼▼
  const currentSearch = search || '';
  const genres = Array.isArray(rawGenres)
    ? rawGenres
    : rawGenres ? [rawGenres] : [];
  // ▲▲▲---------------------------------------------------▲▲▲

  try {
    let query = sql`
      SELECT
        id, title, circle, authors, genres,
        TO_CHAR("publishedDate", 'YYYY-MM-DD') AS "publishedDate",
        "thumbnailUrl", "createdAt", "updatedAt"
      FROM "Doujinshi"
    `;
    const conditions = [];

    // Use currentSearch derived from the parameter
    if (currentSearch) {
      conditions.push(sql`(
        title ILIKE ${'%' + currentSearch + '%'} OR
        circle ILIKE ${'%' + currentSearch + '%'} OR
        ${currentSearch} = ANY(authors)
      )`);
    }
    // Use the processed genres array
    if (genres && genres.length > 0) {
      conditions.push(sql`genres @> ${genres}`);
    }

    if (conditions.length > 0) {
      query = sql`${query} WHERE ${conditions[0]}`;
      for (let i = 1; i < conditions.length; i++) {
        query = sql`${query} AND ${conditions[i]}`;
      }
    }
    query = sql`${query} ORDER BY "createdAt" DESC`;

    const result = await query;
    const rows = result as unknown as DoujinshiFromDB[];
    return rows;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch doujinshi list.');
  }
}
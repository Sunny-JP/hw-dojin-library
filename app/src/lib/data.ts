import { sql } from '@/lib/db';
import type { Doujinshi } from '@/types'; 

// --- ユニークリスト取得関数 ---
export async function getUniqueCircles(): Promise<string[]> {
  try {
    const rows = await sql<{ circle: string }[]>`
      SELECT DISTINCT circle 
      FROM "Doujinshi" 
      WHERE circle IS NOT NULL AND circle != ''
      ORDER BY circle ASC;
    `;
    return rows.map((row) => row.circle);
  } catch (error) {
    console.error('Database Error (getUniqueCircles):', error);
    throw new Error('Failed to fetch unique circles.');
  }
}

export async function getUniqueAuthors(): Promise<string[]> {
  try {
    const rows = await sql<{ author: string }[]>`
      SELECT DISTINCT unnest(authors) AS author
      FROM "Doujinshi"
      WHERE array_length(authors, 1) > 0
      ORDER BY author ASC;
    `;
    return rows.map((row) => row.author);
  } catch (error) {
    console.error('Database Error (getUniqueAuthors):', error);
    throw new Error('Failed to fetch unique authors.');
  }
}

// --- 本棚リスト取得関数 (フィルタ機能付き) ---
export async function getDoujinshiList(
  search?: string,
  genres?: string[],
  circle?: string,
  author?: string
): Promise<Doujinshi[]> {
  try {
    let query = sql`
      SELECT 
        id, title, circle, authors, genres, 
        TO_CHAR("publishedDate", 'YYYY-MM-DD') AS "publishedDate", 
        "thumbnailUrl", "createdAt", "updatedAt" 
      FROM "Doujinshi"
    `;
    const conditions = [];

    // テキスト検索
    if (search) {
      conditions.push(sql`(
        title ILIKE ${'%' + search + '%'} OR
        circle ILIKE ${'%' + search + '%'} OR
        ${search} = ANY(authors)
      )`);
    }
    // ジャンル検索
    if (genres && genres.length > 0) {
      conditions.push(sql`genres @> ARRAY[${genres}]::text[]`);
    }
    // サークルフィルタ
    if (circle) {
      conditions.push(sql`circle = ${circle}`);
    }
    // 作家フィルタ
    if (author) {
      conditions.push(sql`${author} = ANY(authors)`);
    }

    // 条件結合
    if (conditions.length > 0) {
      query = sql`${query} WHERE ${conditions[0]}`;
      for (let i = 1; i < conditions.length; i++) {
        query = sql`${query} AND ${conditions[i]}`;
      }
    }
    query = sql`${query} ORDER BY "createdAt" DESC`;

    const result = await query;
    const rows = result as unknown as Doujinshi[]; 
    return rows;

  } catch (error) {
    console.error('Database Error (getDoujinshiList):', error);
    throw new Error('Failed to fetch doujinshi list.');
  }
}
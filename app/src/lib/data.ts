import { sql } from '@/lib/db';

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

// --- ▼▼▼ ここから修正 ▼▼▼ ---

/**
 * ユニークなサークル名リストを取得 (NULLを除く)
 */
export async function getUniqueCircles(): Promise<string[]> {
  try {
    // 1. 型ヒントを配列型 ({ circle: string }[]) に修正
    // 2. { rows } の分割代入をやめ、結果を直接 rows 変数に格納
    const rows = await sql<{ circle: string }[]>`
      SELECT DISTINCT circle 
      FROM "Doujinshi" 
      WHERE circle IS NOT NULL AND circle != ''
      ORDER BY circle ASC;
    `;
    // 3. これで row の型が正しく推論される
    return rows.map((row) => row.circle);
  } catch (error) {
    console.error('Database Error (getUniqueCircles):', error);
    throw new Error('Failed to fetch unique circles.');
  }
}

/**
 * ユニークな作家名リストを取得
 */
export async function getUniqueAuthors(): Promise<string[]> {
  try {
    // 同様に修正
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

// --- ▲▲▲ 修正ここまで ▲▲▲ ---


// getDoujinshiList 関数 (変更なし)
export async function getDoujinshiList(
  search?: string,
  genres?: string[],
  circle?: string,
  author?: string
): Promise<DoujinshiFromDB[]> {
  try {
    let query = sql`
      SELECT 
        id, title, circle, authors, genres, 
        TO_CHAR("publishedDate", 'YYYY-MM-DD') AS "publishedDate", 
        "thumbnailUrl", "createdAt", "updatedAt" 
      FROM "Doujinshi"
    `;
    const conditions = [];

    if (search) {
      conditions.push(sql`(
        title ILIKE ${'%' + search + '%'} OR
        circle ILIKE ${'%' + search + '%'} OR
        ${search} = ANY(authors)
      )`);
    }
    if (genres && genres.length > 0) {
      conditions.push(sql`genres @> ARRAY[${genres}]::text[]`);
    }
    if (circle) {
      conditions.push(sql`circle = ${circle}`);
    }
    if (author) {
      conditions.push(sql`${author} = ANY(authors)`);
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
    console.error('Database Error (getDoujinshiList):', error);
    throw new Error('Failed to fetch doujinshi list.');
  }
}

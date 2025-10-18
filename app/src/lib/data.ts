import { sql } from '@/lib/db';

// 1. データベースから取得するデータの「型」を定義します
// (editページで使ったものとほぼ同じです)
export type DoujinshiFromDB = {
  id: string;
  title: string;
  circle: string | null;
  authors: string[];
  genres: string[];
  publishedDate: string; // TO_CHARで文字列になっている
  thumbnailUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// 2. getDoujinshiList関数が「DoujinshiFromDBの配列」を返すことを明記します
export async function getDoujinshiList(): Promise<DoujinshiFromDB[]> {
  try {
    // 3. sql実行時に、返り値がこの型であることをヒントとして与えます
    const rows = await sql<DoujinshiFromDB[]>`
      SELECT 
        id, 
        title, 
        circle,  
        authors, 
        genres, 
        TO_CHAR("publishedDate", 'YYYY-MM-DD') AS "publishedDate", 
        "thumbnailUrl", 
        "createdAt", 
        "updatedAt" 
      FROM "Doujinshi" 
      ORDER BY "createdAt" DESC;
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    // エラー時はPromise<[]>に合わせるため、空の配列を返す
    throw new Error('Failed to fetch doujinshi list.');
  }
}
import { Pool } from 'pg';
import { NextResponse } from 'next/server';

// データベース接続設定（.envファイルから読み込むのが望ましい）
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, author, genres, publishedDate } = body;

    const genresArray = genres.split(',').map((g: string) => g.trim());

    // SQLクエリ（$1, $2はSQLインジェクション対策）
    const query = `
      INSERT INTO "Doujinshi" (id, title, author, genres, "publishedDate", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
      RETURNING *;
    `;
    const values = [title, author, genresArray, new Date(publishedDate)];

    const result = await pool.query(query, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create doujinshi:', error);
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}
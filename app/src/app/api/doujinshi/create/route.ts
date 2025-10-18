import { Pool } from 'pg';
import { NextResponse } from 'next/server';

// データベース接続設定（.envファイルから読み込むのが望ましい）
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, circle, authors, genres, publishedDate } = body;
    const authorsArray = authors.split(',').map((a: string) => a.trim());
    const genresArray = genres.split(',').map((g: string) => g.trim());

    const query = `
      INSERT INTO "Doujinshi" (id, title, circle, authors, genres, "publishedDate", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *;
    `;
    const values = [title, circle, authorsArray, genresArray, new Date(publishedDate)];

    const result = await pool.query(query, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create doujinshi:', error);
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}
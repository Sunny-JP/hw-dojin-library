import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const query = 'SELECT * FROM "Doujinshi" WHERE "id" = $1;';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Not Found' }, { status: 404 });
    }

    const doujinshi = rows[0];
    doujinshi.publishedDate = new Date(doujinshi.publishedDate)
      .toISOString()
      .split('T')[0];

    return NextResponse.json(doujinshi);
  } catch (error) {
    console.error('Failed to fetch doujinshi:', error);
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}
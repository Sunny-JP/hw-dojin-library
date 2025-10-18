import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await request.json();
  const { title, circle, authors, genres, publishedDate } = body;
  const authorsArray = authors.split(',').map((a: string) => a.trim());
  const genresArray = genres.split(',').map((g: string) => g.trim());

  try {
    const query = `
      UPDATE "Doujinshi"
      SET 
        "title" = $1, 
        "circle" = $2,
        "authors" = $3, 
        "genres" = $4, 
        "publishedDate" = $5,
        "updatedAt" = NOW()
      WHERE "id" = $5
      RETURNING *;
    `;
    const values = [title, circle, authorsArray, genresArray, new Date(publishedDate), id];
    
    const { rows } = await pool.query(query, values);

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Failed to update doujinshi:', error);
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}
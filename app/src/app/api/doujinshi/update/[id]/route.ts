import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

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
    const [updatedDoujinshi] = await sql`
      UPDATE "Doujinshi"
      SET 
        "title" = ${title}, 
        "circle" = ${circle}, 
        "authors" = ${authorsArray}, 
        "genres" = ${genresArray}, 
        "publishedDate" = ${new Date(publishedDate)},
        "updatedAt" = NOW()
      WHERE "id" = ${id}
      RETURNING *;
    `;
    
    return NextResponse.json(updatedDoujinshi);
  } catch (error) {
    console.error('Failed to update doujinshi:', error);
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}
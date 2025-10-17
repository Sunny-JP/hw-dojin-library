import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id; // Get the ID from the URL

  try {
    const query = 'DELETE FROM "Doujinshi" WHERE "id" = $1;';
    await pool.query(query, [id]);

    // Return a success response with no content
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete doujinshi:', error);
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}
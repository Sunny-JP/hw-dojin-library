import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id; // Get the ID from the URL

  try {
    await sql`
      DELETE FROM "Doujinshi" WHERE "id" = ${id};
    `;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete doujinshi:', error);
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}
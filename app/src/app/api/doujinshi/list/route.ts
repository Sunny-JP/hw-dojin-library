import { getDoujinshiList } from '@/app/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const doujinshiList = await getDoujinshiList();
    return NextResponse.json(doujinshiList);
  } catch (error) {
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // リクエストボディからデータを取得する方法が変わります
    const body = await req.json();
    const { title, author, genres, publishedDate } = body;

    const newDoujinshi = await prisma.doujinshi.create({
      data: {
        title,
        author,
        genres: genres.split(',').map((genre: string) => genre.trim()),
        publishedDate: new Date(publishedDate),
      },
    });

    // レスポンスを返す方法もNextResponseを使います
    return NextResponse.json(newDoujinshi, { status: 201 });
  } catch (error) {
    console.error('Failed to create doujinshi:', error);
    return NextResponse.json(
      { message: 'Failed to create doujinshi' },
      { status: 500 }
    );
  }
}
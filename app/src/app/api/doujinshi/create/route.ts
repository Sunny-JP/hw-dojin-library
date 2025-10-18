import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { s3Client } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import crypto from 'crypto';

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME!;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const title = formData.get('title') as string;
    const authors = formData.get('authors') as string;
    const circle = formData.get('circle') as string;
    const genres = formData.get('genres') as string;
    const publishedDate = formData.get('publishedDate') as string;
    const thumbnail = formData.get('thumbnail') as File;

    let thumbnailUrl = null;

    if (thumbnail && thumbnail.size > 0) {
      // 1. 画像を圧縮
      const imageBuffer = await thumbnail.arrayBuffer();
      const compressedImage = await sharp(Buffer.from(imageBuffer))
        .resize(400, null, { fit: 'inside' }) // 幅を400pxにリサイズ
        .webp({ quality: 80 }) // WebP形式に変換し、品質80%に圧縮
        .toBuffer();
      const filename = `${crypto.randomUUID()}.webp`;

      // 2. MinIOにアップロード
      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: compressedImage,
        ContentType: 'image/webp',
      });
      await s3Client.send(putCommand);
      
      // 3. 保存先のURLを生成
      thumbnailUrl = `${process.env.MINIO_PUBLIC_ENDPOINT}/${BUCKET_NAME}/${filename}`;
    }

    // 4. データベースに保存
    const authorsArray = authors.split(',').map((a: string) => a.trim());
    const genresArray = genres.split(',').map((g: string) => g.trim());

const [newDoujinshi] = await sql`
      INSERT INTO "Doujinshi" 
        (id, title, circle, authors, genres, "publishedDate", "thumbnailUrl", "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), ${title}, ${circle}, ${authorsArray}, ${genresArray}, ${new Date(publishedDate)}, ${thumbnailUrl}, NOW(), NOW())
      RETURNING *;
    `;
    
    return NextResponse.json(newDoujinshi, { status: 201 });

  } catch (error) {
    console.error('Failed to create doujinshi:', error);
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}
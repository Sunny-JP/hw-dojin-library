'use server';

import { sql } from '@/lib/db'; 
import { revalidatePath } from 'next/cache';
import { s3Client } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import crypto from 'crypto';

/**
 * 複数のアイテムをIDに基づいてDBから削除するサーバーアクション
 */
export async function deleteItemsAction(ids: string[]) {
  if (!ids || ids.length === 0) {
    return { error: '削除するアイテムのIDがありません' };
  }
  try {
    await sql`
      DELETE FROM "Doujinshi"
      WHERE id = ANY(${ids})
    `;
    revalidatePath('/'); 
    return { success: true };
  } catch (error) {
    console.error('データベース削除エラー:', error);
    return { error: 'データベースからの削除に失敗しました。' };
  }
}

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME!;
const MINIO_PUBLIC_ENDPOINT = process.env.MINIO_PUBLIC_ENDPOINT!;

/**
 * 新しいアイテムを作成するサーバーアクション
 */
export async function createItemAction(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const authors = formData.get('authors') as string;
    const circle = formData.get('circle') as string;
    const genres = formData.get('genres') as string;
    const publishedDate = formData.get('publishedDate') as string;
    const thumbnail = formData.get('thumbnail') as File;

    let thumbnailUrl = null;

    if (thumbnail && thumbnail.size > 0) {
      const imageBuffer = await thumbnail.arrayBuffer();
      const compressedImage = await sharp(Buffer.from(imageBuffer))
        .resize(400, null, { fit: 'inside' })
        .webp({ quality: 80 })
        .toBuffer();
      const filename = `${crypto.randomUUID()}.webp`;
      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: compressedImage,
        ContentType: 'image/webp',
      });
      await s3Client.send(putCommand);
      thumbnailUrl = `${MINIO_PUBLIC_ENDPOINT}/${BUCKET_NAME}/${filename}`;
    }

    const authorsArray = authors ? authors.split(',').map((a: string) => a.trim()) : [];
    const genresArray = genres ? genres.split(',').map((g: string) => g.trim()) : [];

    await sql`
      INSERT INTO "Doujinshi" 
        (id, title, circle, authors, genres, "publishedDate", "thumbnailUrl", "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), ${title}, ${circle || null}, ${authorsArray}, ${genresArray}, ${publishedDate ? new Date(publishedDate) : null}, ${thumbnailUrl}, NOW(), NOW())
    `;

    revalidatePath('/');
    return { success: true };

  } catch (error) {
    console.error('新規作成エラー:', error);
    return { error: '新規アイテムの作成に失敗しました。' };
  }
}

// --- ▼▼▼ 以下を新しく追記 ▼▼▼ ---

/**
 * 既存のアイテムを更新するサーバーアクション
 */
export async function updateItemAction(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) return { error: 'IDがありません' };
    
    const title = formData.get('title') as string;
    const authors = formData.get('authors') as string;
    const circle = formData.get('circle') as string;
    const genres = formData.get('genres') as string;
    const publishedDate = formData.get('publishedDate') as string;
    const thumbnail = formData.get('thumbnail') as File;

    // 1. まずテキスト情報のみを更新
    const authorsArray = authors ? authors.split(',').map((a: string) => a.trim()) : [];
    const genresArray = genres ? genres.split(',').map((g: string) => g.trim()) : [];

    await sql`
      UPDATE "Doujinshi" SET
        title = ${title},
        circle = ${circle || null},
        authors = ${authorsArray},
        genres = ${genresArray},
        "publishedDate" = ${publishedDate ? new Date(publishedDate) : null},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    // 2. 新しいサムネイル画像がアップロードされた場合のみ、画像も更新
    if (thumbnail && thumbnail.size > 0) {
      const imageBuffer = await thumbnail.arrayBuffer();
      const compressedImage = await sharp(Buffer.from(imageBuffer))
        .resize(400, null, { fit: 'inside' })
        .webp({ quality: 80 })
        .toBuffer();
      
      const filename = `${crypto.randomUUID()}.webp`;
      
      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: compressedImage,
        ContentType: 'image/webp',
      });
      await s3Client.send(putCommand);
      
      const newThumbnailUrl = `${MINIO_PUBLIC_ENDPOINT}/${BUCKET_NAME}/${filename}`;

      // 2b. サムネイルURLをDBに保存
      await sql`
        UPDATE "Doujinshi" SET "thumbnailUrl" = ${newThumbnailUrl}
        WHERE id = ${id}
      `;
      // TODO: 古い画像をMinIOから削除するロジックを後で追加すると尚良い
    }

    revalidatePath('/'); // 本棚ページを再検証
    return { success: true };

  } catch (error) {
    console.error('更新エラー:', error);
    return { error: 'アイテムの更新に失敗しました。' };
  }
}
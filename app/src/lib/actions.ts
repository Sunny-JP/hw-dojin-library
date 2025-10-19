'use server';

import { sql } from '@/lib/db'; 
import { revalidatePath } from 'next/cache';
import { s3Client } from '@/lib/s3'; // MinIOクライアントをインポート
import { PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp'; // 画像圧縮ライブラリ
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

// --- ▼▼▼ 以下を新しく追記 ▼▼▼ ---

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

    // 1. サムネイル画像処理
    if (thumbnail && thumbnail.size > 0) {
      const imageBuffer = await thumbnail.arrayBuffer();
      const compressedImage = await sharp(Buffer.from(imageBuffer))
        .resize(400, null, { fit: 'inside' })
        .webp({ quality: 80 })
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
      thumbnailUrl = `${MINIO_PUBLIC_ENDPOINT}/${BUCKET_NAME}/${filename}`;
    }

    // 4. データベースに保存
    const authorsArray = authors ? authors.split(',').map((a: string) => a.trim()) : [];
    const genresArray = genres ? genres.split(',').map((g: string) => g.trim()) : [];

    await sql`
      INSERT INTO "Doujinshi" 
        (id, title, circle, authors, genres, "publishedDate", "thumbnailUrl", "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), ${title}, ${circle || null}, ${authorsArray}, ${genresArray}, ${publishedDate ? new Date(publishedDate) : null}, ${thumbnailUrl}, NOW(), NOW())
    `;

    revalidatePath('/'); // 本棚ページを再検証
    return { success: true };

  } catch (error) {
    console.error('新規作成エラー:', error);
    return { error: '新規アイテムの作成に失敗しました。' };
  }
}
'use server';

import { sql } from '@/lib/db'; 
import { revalidatePath } from 'next/cache';
import { s3Client } from '@/lib/s3';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const S3_PUBLIC_ENDPOINT = process.env.S3_PUBLIC_ENDPOINT!;
const COMPRESSION_WIDTH = parseInt(process.env.IMAGE_COMPRESSION_WIDTH || '1000', 10);
const WEBP_QUALITY = parseInt(process.env.IMAGE_WEBP_QUALITY || '75', 10);

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
        .resize(COMPRESSION_WIDTH, null, { 
          fit: 'inside', 
          withoutEnlargement: true
        })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      const filename = `${crypto.randomUUID()}.webp`;
      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: compressedImage,
        ContentType: 'image/webp',
      });
      await s3Client.send(putCommand);
      thumbnailUrl = `${S3_PUBLIC_ENDPOINT}/${BUCKET_NAME}/${filename}`;
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

/**
 * 既存のアイテムを更新するサーバーアクション
 */
export async function updateItemAction(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return { error: 'IDがありません' };

  let oldThumbnailUrl: string | null = null;
  let newThumbnailUrl: string | null = null; // 新しいURLを保持する変数

  try {
    // --- 1. 古い画像URLを取得 ---
    try {
      // 更新前に現在の thumbnailURL を取得
      const currentItem = await sql`
        SELECT "thumbnailUrl" FROM "Doujinshi" WHERE id = ${id}
      `;
      if (currentItem.length > 0) {
        oldThumbnailUrl = (currentItem[0] as { thumbnailUrl: string | null }).thumbnailUrl;
      }
    } catch (fetchError) {
      console.error("Failed to fetch old thumbnail URL:", fetchError);
      // ここでエラーが発生しても更新処理自体は続行するが、古いファイルは削除されない
    }

    // --- フォームデータを取得 ---
    const title = formData.get('title') as string;
    const authors = formData.get('authors') as string;
    const circle = formData.get('circle') as string;
    const genres = formData.get('genres') as string;
    const publishedDate = formData.get('publishedDate') as string;
    const thumbnail = formData.get('thumbnail') as File;

    // --- 2. 新しいサムネイルがあればアップロード ---
    if (thumbnail && thumbnail.size > 0) {
      const imageBuffer = await thumbnail.arrayBuffer();
      const compressedImage = await sharp(Buffer.from(imageBuffer))
        .resize(COMPRESSION_WIDTH, null, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      const filename = `${crypto.randomUUID()}.webp`;
      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: compressedImage,
        ContentType: 'image/webp',
      });
      await s3Client.send(putCommand);
      newThumbnailUrl = `${S3_PUBLIC_ENDPOINT}/${BUCKET_NAME}/${filename}`;
    }

    // --- 3. データベースを更新 ---
    const authorsArray = authors ? authors.split(',').map((a: string) => a.trim()) : [];
    const genresArray = genres ? genres.split(',').map((g: string) => g.trim()) : [];

    // newThumbnailUrl が設定されている（新しい画像がアップロードされた）場合のみ thumbnailUrl を更新
    if (newThumbnailUrl) {
      await sql`
        UPDATE "Doujinshi" SET
          title = ${title},
          circle = ${circle || null},
          authors = ${authorsArray},
          genres = ${genresArray},
          "publishedDate" = ${publishedDate ? new Date(publishedDate) : null},
          "thumbnailUrl" = ${newThumbnailUrl}, -- 新しいURLで更新
          "updatedAt" = NOW()
        WHERE id = ${id}
      `;
    } else {
      // 新しい画像がない場合は thumbnailUrl を更新しない
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
    }

    // --- 4. 古い画像を削除 (新しい画像が正常にアップロード・DB更新された場合のみ) ---
    if (oldThumbnailUrl && newThumbnailUrl) {
      try {
        // URLからオブジェクトキー(ファイル名)を抽出
        const oldKey = oldThumbnailUrl.substring(oldThumbnailUrl.lastIndexOf('/') + 1);
        if (oldKey) {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: oldKey,
          });
          console.log(`Attempting to delete old image: ${BUCKET_NAME}/${oldKey}`);
          await s3Client.send(deleteCommand);
          console.log(`Successfully deleted old image: ${oldKey}`);
        }
      } catch (deleteError) {
        // 削除エラーはログに残すが、更新アクション自体は成功とする
        console.error(`Failed to delete old image ${oldThumbnailUrl}:`, deleteError);
      }
    }

    revalidatePath('/'); // ページキャッシュをクリア
    return { success: true };

  } catch (error) {
    console.error('更新エラー:', error);
    return { error: 'アイテムの更新に失敗しました。' };
  }
}

/**
 * サークルリストを取得するサーバーアクション
 */
export async function fetchCirclesAction(): Promise<string[]> {
  try {
    const rows = await sql<{ circle: string }[]>`
      SELECT DISTINCT circle 
      FROM "Doujinshi" 
      WHERE circle IS NOT NULL AND circle != ''
      ORDER BY circle ASC;
    `;
    return rows.map((row) => row.circle);
  } catch (error) {
    console.error("Failed to fetch circles:", error);
    return []; 
  }
}

/**
 * 作家リストを取得するサーバーアクション
 */
export async function fetchAuthorsAction(): Promise<string[]> {
  try {
    const rows = await sql<{ author: string }[]>`
      SELECT DISTINCT unnest(authors) AS author
      FROM "Doujinshi"
      WHERE array_length(authors, 1) > 0
      ORDER BY author ASC;
    `;
    return rows.map((row) => row.author);

  } catch (error) {
    console.error("Failed to fetch authors:", error);
    return []; 
  }
}
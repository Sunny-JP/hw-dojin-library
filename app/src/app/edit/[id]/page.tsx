import AddDoujinshiForm from '@/components/AddDoujinshiForm';
import { sql } from '@/lib/db';

// DBから取得するデータの型を定義しておきます（配列に注意）
type DoujinshiFromDB = {
  id: string;
  title: string;
  authors: string[]; // DBからは配列として取得
  circle?: string;
  genres: string[];  // DBからは配列として取得
  publishedDate: string; // TO_CHARで文字列になっている
};

// データを取得する関数
async function getDoujinshiData(id: string): Promise<DoujinshiFromDB | null> {
  try {
    // postgres.jsに、返り値の型を <DoujinshiFromDB[]> のようにヒントとして与えます
    const [doujinshi] = await sql<DoujinshiFromDB[]>`
      SELECT 
        id, title, authors, circle, genres, 
        TO_CHAR("publishedDate", 'YYYY-MM-DD') AS "publishedDate"
      FROM "Doujinshi" 
      WHERE "id" = ${id};
    `;
    
    if (!doujinshi) return null;
    return doujinshi;

  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

// ページ本体のコンポーネント
export default async function EditPage({ params }: { params: { id: string } }) {
  const dbData = await getDoujinshiData(params.id); // dbDataは DoujinshiFromDB | null 型

  if (!dbData) {
    return (
      <main style={{ padding: '20px' }}>
        <h1>データが見つかりません</h1>
        <a href="/">一覧に戻る</a>
      </main>
    );
  }

  // DBの型 (dbData) から フォームが期待する型 (formData) へ変換します
  const formData = {
    ...dbData,
    authors: Array.isArray(dbData.authors) ? dbData.authors.join(', ') : '',
    genres: Array.isArray(dbData.genres) ? dbData.genres.join(', ') : '',
  };

  return (
    <main style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      <h1>同人誌情報の編集</h1>
      {/* 変換後の formData をフォームに渡します */}
      <AddDoujinshiForm initialData={formData} />
    </main>
  );
}
import AddDoujinshiForm from '@/app/components/AddDoujinshiForm';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function getDoujinshiData(id: string) {
  try {
    const query = 'SELECT *, TO_CHAR("publishedDate", \'YYYY-MM-DD\') AS "publishedDate" FROM "Doujinshi" WHERE "id" = $1;';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) return null;

    const doujinshi = rows[0];
    doujinshi.authors = Array.isArray(doujinshi.authors) ? doujinshi.authors.join(', ') : '';
    doujinshi.genres = Array.isArray(doujinshi.genres) ? doujinshi.genres.join(', ') : '';
    
    return doujinshi;
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

export default async function EditPage({ params }: { params: { id: string } }) {
  const data = await getDoujinshiData(params.id);

  if (!data) {
    return (
      <main style={{ padding: '20px' }}>
        <h1>データが見つかりません</h1>
        <a href="/">一覧に戻る</a>
      </main>
    );
  }

  return (
    <main style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      <h1>同人誌情報の編集</h1>
      {/* フォームコンポーネントに初期データを渡す */}
      <AddDoujinshiForm initialData={data} />
    </main>
  );
}
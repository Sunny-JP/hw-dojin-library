import { getDoujinshiList } from '@/lib/data';
import type { DoujinshiFromDB } from '@/lib/data';
import BookshelfView from '@/components/BookshelfView';

export default async function HomePage() {
  let doujinshiList: DoujinshiFromDB[] = []; 
  try {
    doujinshiList = await getDoujinshiList();
  } catch (error) {
    console.error(error);
  }

  return (
    <main style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>所持同人誌一覧</h1>
        <a href="/add-new" style={{ /* スタイルは適宜調整 */ }}>
          → 新規登録はこちら
        </a>
      </div>
      
      {doujinshiList.length === 0 ? (
        <p>まだ登録されている同人誌はありません。</p>
      ) : (
        <BookshelfView items={doujinshiList} />
      )}
    </main>
  );
}
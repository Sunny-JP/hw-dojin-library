import { getDoujinshiList } from '@/app/lib/data'; // Corrected path
import DoujinshiList from '@/app/components/DoujinshiList'; // Import the new component

export default async function HomePage() {
  let doujinshiList = [];
  try {
    doujinshiList = await getDoujinshiList();
  } catch (error) {
    console.error(error);
  }

  return (
    <main style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>所持同人誌一覧</h1>
      <a href="/add-new" style={{ display: 'inline-block', marginBottom: '20px' }}>
        → 新規登録はこちら
      </a>
      
      {doujinshiList.length === 0 ? (
        <p>まだ登録されている同人誌はありません。</p>
      ) : (
        // Use the new Client Component to display the list
        <DoujinshiList initialDoujinshi={doujinshiList} />
      )}
    </main>
  );
}
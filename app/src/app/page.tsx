import { getDoujinshiList } from '@/lib/data';
import type { DoujinshiFromDB } from '@/lib/data';
import BookshelfView from '@/components/BookshelfView';

export default async function HomePage() {
  let doujinshiList: DoujinshiFromDB[] = []; 
  try {
    // サーバーサイドでデータを取得
    doujinshiList = await getDoujinshiList();
  } catch (error) {
    console.error(error);
  }

  return (
    // 取得したデータをクライアントコンポーネントに渡す
    <BookshelfView items={doujinshiList} />
  );
}
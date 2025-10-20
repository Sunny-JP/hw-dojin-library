import { getDoujinshiList } from '@/lib/data';
import type { DoujinshiFromDB } from '@/lib/data';
import BookshelfView from '@/components/BookshelfView';

// searchParams の型定義
type SearchParams = {
  search?: string;
  genres?: string | string[];
};

// props の型定義で searchParams が Promise かもしれないことを示す
type PageProps = {
  // searchParams が Promise<SearchParams | undefined> 型になる可能性
  searchParams: Promise<SearchParams | undefined>; 
};

export default async function HomePage(props: PageProps) { // props を受け取る
  
  // ▼▼▼ props.searchParams を await してからアクセスする ▼▼▼
  const resolvedSearchParams = await props.searchParams; 
  const search = resolvedSearchParams?.search || '';
  const rawGenres = resolvedSearchParams?.genres;
  // ▲▲▲---------------------------------------------▲▲▲

  let doujinshiList: DoujinshiFromDB[] = [];
  try {
    // 取得した値を getDoujinshiList に渡す
    doujinshiList = await getDoujinshiList(search, rawGenres);
  } catch (error) {
    console.error(error);
  }

  // クライアントコンポーネント用の genres 配列を作成
  const currentGenres = Array.isArray(rawGenres)
    ? rawGenres
    : rawGenres ? [rawGenres] : [];

  return (
    <BookshelfView 
      items={doujinshiList} 
      currentSearch={search} 
      currentGenres={currentGenres} 
    />
  );
}
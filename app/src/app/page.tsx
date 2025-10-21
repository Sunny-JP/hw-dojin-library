import { getDoujinshiList } from '@/lib/data';
import type { DoujinshiFromDB } from '@/lib/data';
import BookshelfView from '@/components/BookshelfView';

// searchParams の型定義
type SearchParams = {
  search?: string;
  genres?: string | string[];
};

// props の型定義
type PageProps = {
  searchParams: Promise<SearchParams | undefined>;
};

export default async function HomePage(props: PageProps) {

  const resolvedSearchParams = await props.searchParams;
  const search = resolvedSearchParams?.search || '';
  const rawGenres = resolvedSearchParams?.genres; // Keep rawGenres for array conversion

  // クライアントコンポーネントと getDoujinshiList の両方で使う genres 配列を作成
  const currentGenres = Array.isArray(rawGenres)
    ? rawGenres
    : rawGenres ? [rawGenres] : []; // Ensure it's always string[]

  let doujinshiList: DoujinshiFromDB[] = [];
  try {
    // ▼▼▼ rawGenres の代わりに currentGenres (string[]) を渡す ▼▼▼
    doujinshiList = await getDoujinshiList(search, currentGenres);
  } catch (error) {
    console.error(error);
  }

  return (
    <BookshelfView
      items={doujinshiList}
      currentSearch={search}
      currentGenres={currentGenres} // Pass the same array to the client
    />
  );
}
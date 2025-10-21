import { getDoujinshiList } from '@/lib/data';
import type { DoujinshiFromDB } from '@/lib/data';
import BookshelfView from '@/components/BookshelfView';

// searchParams の型定義
type SearchParams = {
  search?: string;
  genres?: string | string[];
};

// params の型定義
type PageParams = {
  circleName: string;
};

// props の型定義 (params と searchParams が Promise である可能性)
type PageProps = {
  params: Promise<PageParams>; // params を Promise に
  searchParams: Promise<SearchParams | undefined>; // searchParams も Promise に
};

export default async function CircleBookshelfPage(props: PageProps) { // props を受け取る
  
  // ▼▼▼ props.params と props.searchParams を await ▼▼▼
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;
  // ▲▲▲---------------------------------------------▲▲▲

  // URLデコードして元のサークル名に戻す
  const circleName = decodeURIComponent(resolvedParams.circleName); 
  
  // await した値から検索パラメータを取得
  const search = resolvedSearchParams?.search || '';
  const rawGenres = resolvedSearchParams?.genres;
  const genres = Array.isArray(rawGenres)
    ? rawGenres
    : rawGenres ? [rawGenres] : [];
  
  let doujinshiList: DoujinshiFromDB[] = []; 
  try {
    // getDoujinshiList に circle フィルタを渡す
    doujinshiList = await getDoujinshiList(search, genres, circleName); 
  } catch (error) {
    console.error(error);
  }

  return (
    <BookshelfView 
      items={doujinshiList} 
      currentSearch={search} 
      currentGenres={genres}
      pageTitle={`${circleName}`} // ページタイトルを渡す
    />
  );
}
import { getUniqueAuthors } from '@/lib/data';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default async function AuthorsPage() {
  let authors: string[] = [];
  try {
    authors = await getUniqueAuthors();
  } catch (error) {
    console.error(error);
  }

  return (
    <main className="p-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">作家一覧</h1>
        <Link href="/" className="flex items-center text-sm text-blue-600 hover:underline">
          <Home className="w-4 h-4 mr-1" />
          本棚へ戻る
        </Link>
      </div>
      {authors.length === 0 ? (
        <p>登録されている作家はありません。</p>
      ) : (
        <ul className="space-y-2">
          {authors.map((author) => (
            <li key={author}>
              <Link 
                href={`/author/${encodeURIComponent(author)}`} 
                className="text-blue-600 hover:underline"
              >
                {author}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
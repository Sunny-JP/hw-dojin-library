import { getUniqueCircles } from '@/lib/data';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default async function CirclesPage() {
  let circles: string[] = [];
  try {
    circles = await getUniqueCircles();
  } catch (error) {
    console.error(error);
    // TODO: Add error handling UI
  }

  return (
    <main className="p-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">サークル一覧</h1>
        <Link href="/" className="flex items-center text-sm text-blue-600 hover:underline">
          <Home className="w-4 h-4 mr-1" />
          本棚へ戻る
        </Link>
      </div>
      {circles.length === 0 ? (
        <p>登録されているサークルはありません。</p>
      ) : (
        <ul className="space-y-2">
          {circles.map((circle) => (
            <li key={circle}>
              {/* URLエンコードしてリンクを作成 */}
              <Link 
                href={`/circle/${encodeURIComponent(circle)}`} 
                className="text-blue-600 hover:underline"
              >
                {circle}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
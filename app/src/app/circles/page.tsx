'use client'; // クライアントコンポーネント宣言

import { useState, useEffect } from 'react'; // Reactフックをインポート
import Link from 'next/link';
import Header from '@/components/Header';
import AddModal from '@/components/AddModal'; // 正しいパスからインポート
import { fetchCirclesAction } from '@/lib/actions'; // サーバーアクションをインポート

// async を削除
export default function CirclesPage() {
  const [circles, setCircles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false); // useState はここで呼び出す

  // useEffect 内でサーバーアクションを呼び出してデータを取得
  useEffect(() => {
    async function loadCircles() {
      setLoading(true); // ローディング開始
      try {
        const fetchedCircles = await fetchCirclesAction();
        setCircles(fetchedCircles);
      } catch (error) {
        console.error("Failed to load circles:", error);
      } finally {
        setLoading(false); // ローディング終了
      }
    }
    loadCircles();
  }, []); // 初回レンダリング時にのみ実行

  return (
    // レイアウトクラスを追加
    <main className="p-4 mx-auto" style={{ maxWidth: '1200px' }}>
      <Header
        pageTitle="サークル一覧"
        setShowAddModal={setShowAddModal}
      />

      {loading ? (
        <p className="text-center text-gray-500 py-10">読み込み中...</p>
      ) : circles.length === 0 ? (
        <p className="text-center text-gray-500 py-10">登録されているサークルはありません。</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {circles.map((circle) => (
            <li key={circle} className="py-3">
              <Link
                href={`/circle/${encodeURIComponent(circle)}`}
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm sm:text-base dark:text-blue-400 dark:hover:text-blue-300"
              >
                {circle}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showAddModal && <AddModal onClose={() => setShowAddModal(false)} />}
    </main>
  );
}
'use client'; // クライアントコンポーネント宣言

import { useState, useEffect } from 'react'; // Reactフックをインポート
import Link from 'next/link';
import Header from '@/components/Header';
import AddModal from '@/components/AddModal'; // 正しいパスからインポート
import { fetchAuthorsAction } from '@/lib/actions'; // サーバーアクションをインポート

// async を削除
export default function AuthorsPage() {
  const [authors, setAuthors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false); // useState はここで呼び出す

  // useEffect 内でサーバーアクションを呼び出してデータを取得
  useEffect(() => {
    async function loadAuthors() {
      setLoading(true); // ローディング開始
      try {
        const fetchedAuthors = await fetchAuthorsAction();
        setAuthors(fetchedAuthors);
      } catch (error) {
        console.error("Failed to load authors:", error);
        // エラーハンドリング (例: エラーメッセージ表示)
      } finally {
        setLoading(false); // ローディング終了
      }
    }
    loadAuthors();
  }, []); // 初回レンダリング時にのみ実行

  return (
    // レイアウトクラスを追加
    <main className="p-4 mx-auto" style={{ maxWidth: '1200px' }}>
      <Header
        pageTitle="作家一覧"
        setShowAddModal={setShowAddModal}
        // 他のオプショナルなPropsは渡さない
      />

      {loading ? (
        <p className="text-center text-gray-500 py-10">読み込み中...</p>
      ) : authors.length === 0 ? (
        <p className="text-center text-gray-500 py-10">登録されている作家はありません。</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {authors.map((author) => (
            <li key={author} className="py-3">
              <Link
                href={`/author/${encodeURIComponent(author)}`}
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm sm:text-base dark:text-blue-400 dark:hover:text-blue-300"
              >
                {author}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showAddModal && <AddModal onClose={() => setShowAddModal(false)} />}
    </main>
  );
}
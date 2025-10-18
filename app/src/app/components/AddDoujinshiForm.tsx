'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Doujinshiの型定義
type Doujinshi = {
  id?: string;
  title: string;
  circle?: string;
  authors: string | string[];
  genres: string | string[];
  publishedDate: string;
};

// コンポーネントが受け取るPropsの型定義
type FormProps = {
  // 編集モードの場合、ここに初期データが入る
  initialData?: Doujinshi; 
};

export default function AddDoujinshiForm({ initialData }: FormProps) {
  // initialDataがあれば編集モード、なければ新規モード
  const isEditMode = !!initialData;

  const [title, setTitle] = useState('');
  const [circle, setCircle] = useState('');
  const [authors, setAuthors] = useState('');
  const [genres, setGenres] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  // ページが読み込まれた時に、initialDataがあればフォームにセットする
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCircle(initialData.circle || '');
      setAuthors(initialData.authors as string);
      setGenres(initialData.genres as string);
      setPublishedDate(initialData.publishedDate);
    }
  }, [initialData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(isEditMode ? '更新中...' : '登録中...');

    // APIのURLとHTTPメソッドをモードによって切り替える
    const apiUrl = isEditMode 
      ? `/api/doujinshi/update/${initialData?.id}` 
      : '/api/doujinshi/create';
    const method = isEditMode ? 'PUT' : 'POST';

    const response = await fetch(apiUrl, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, circle, authors, genres, publishedDate }),
    });

    if (response.ok) {
      setMessage(isEditMode ? '更新に成功しました！' : '登録に成功しました！');
      router.push('/'); // トップページに戻る
      router.refresh(); // トップページのデータを再取得させる
    } else {
      setMessage(isEditMode ? '更新に失敗しました。' : '登録に失敗しました。');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input type="text" placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input type="text" placeholder="サークル" value={circle} onChange={(e) => setCircle(e.target.value)} />
      <input type="text" placeholder="作者 (カンマ区切り)" value={authors} onChange={(e) => setAuthors(e.target.value)} required />
      <input type="text" placeholder="ジャンル (カンマ区切り)" value={genres} onChange={(e) => setGenres(e.target.value)} />
      <input type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} required max="9999-12-31" />
      
      {/* ボタンのテキストをモードによって切り替える */}
      <button type="submit">{isEditMode ? '更新する' : '登録する'}</button>
      {message && <p>{message}</p>}
    </form>
  );
}
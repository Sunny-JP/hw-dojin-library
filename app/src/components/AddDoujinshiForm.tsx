'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type FormInputData = {
  id: string;
  title: string;
  authors: string; // 著者はカンマ区切りの「文字列」
  circle?: string;
  genres: string;  // ジャンルもカンマ区切りの「文字列」
  publishedDate: string;
};

// コンポーネントが受け取るPropsの型定義
type FormProps = {
  initialData?: FormInputData; 
};

export default function AddDoujinshiForm({ initialData }: FormProps) {
  // initialDataがあれば編集モード、なければ新規モード
  const isEditMode = !!initialData;
  const [thumbnail, setThumbnail] = useState<File | null>(null);
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
      setAuthors(initialData.authors);
      setGenres(initialData.genres);
      setPublishedDate(initialData.publishedDate);
    }
  }, [initialData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(isEditMode ? '更新中...' : '登録中...');

    // FormDataを作成
    const formData = new FormData();
    formData.append('title', title);
    formData.append('circle', circle);
    formData.append('authors', authors);
    formData.append('genres', genres);
    formData.append('publishedDate', publishedDate);
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }

// APIのURLとメソッド (ここはまだCreateのみ対応)
    const apiUrl = '/api/doujinshi/create';
    const method = 'POST';

    const response = await fetch(apiUrl, {
      method: method,
      body: formData,
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
      <div>
        <label htmlFor="thumbnail">サムネイル画像</label>
        <input 
          type="file" 
          id="thumbnail"
          accept="image/*"
          onChange={(e) => setThumbnail(e.target.files ? e.target.files[0] : null)}
        />
      </div>
      {/* ボタンのテキストをモードによって切り替える */}
      <button type="submit">{isEditMode ? '更新する' : '登録する'}</button>
      {message && <p>{message}</p>}
    </form>
  );
}
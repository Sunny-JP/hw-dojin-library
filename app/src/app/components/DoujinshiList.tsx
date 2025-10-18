// This directive marks the component as a Client Component
'use client';

import { useRouter } from 'next/navigation';

// Define a type for our doujinshi object for better code quality
type Doujinshi = {
  id: string;
  title: string;
  author: string;
  genres: string[];
  publishedDate: string;
};

export default function DoujinshiList({ initialDoujinshi }: { initialDoujinshi: Doujinshi[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    // Ask for confirmation before deleting
    if (!confirm('本当にこの項目を削除しますか？')) {
      return;
    }

    await fetch(`/api/doujinshi/delete/${id}`, {
      method: 'DELETE',
    });

    // Refresh the page to show the updated list.
    // Next.js is smart about this and will only refetch the necessary data.
    router.refresh();
  };

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {initialDoujinshi.map((doujinshi) => (
        <li key={doujinshi.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', position: 'relative' }}>
          <h2>{doujinshi.title}</h2>
          <p><strong>作者:</strong> {doujinshi.author}</p>
          <p><strong>ジャンル:</strong> {doujinshi.genres.join(', ')}</p>
          <p><strong>頒布日:</strong> {doujinshi.publishedDate}</p>
          <a 
            href={`/edit/${doujinshi.id}`}
            style={{ position: 'absolute', top: '50px', right: '10px', background: 'blue', color: 'white', padding: '5px 10px', textDecoration: 'none', borderRadius: '5px' }}
          >
            編集
          </a>
        
          <button 
            onClick={() => handleDelete(doujinshi.id)}
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'red', color: 'white', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '5px' }}
          >
            削除
          </button>
        </li>
      ))}
    </ul>
  );
}
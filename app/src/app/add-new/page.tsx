'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AddNewPage() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genres, setGenres] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('Submitting...');

    const response = await fetch('/api/doujinshi/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        author,
        genres,
        publishedDate,
      }),
    });

    if (response.ok) {
      setMessage('Successfully added!');
      // router.push('/'); // 成功したらトップページに移動
    } else {
      setMessage('Failed to add. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      <h1>Add New Doujinshi</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Genres (comma-separated)"
          value={genres}
          onChange={(e) => setGenres(e.target.value)}
        />
        <input
          type="date"
          value={publishedDate}
          onChange={(e) => setPublishedDate(e.target.value)}
          required
        />
        <button type="submit">Add Doujinshi</button>
      </form>
      {message && <p>{message}</p>}
      <a href="/" style={{ display: 'inline-block', marginBottom: '20px' }}>
        → Back to Home
      </a>
    </div>
  );
}
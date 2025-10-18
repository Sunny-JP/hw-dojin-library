'use client';
import Image from 'next/image';

// 型定義
type Doujinshi = {
  id: string;
  title: string;
  circle?: string | null;
  authors: string[];
  thumbnailUrl?: string | null;
  // ... 他のプロパティ
};

type BookshelfProps = {
  items: Doujinshi[];
};

export default function BookshelfView({ items }: BookshelfProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '20px',
    }}>
      {items.map((item) => (
        <div key={item.id} style={{ cursor: 'pointer' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '0.707', // B5判の比率
            backgroundColor: '#eee',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            {item.thumbnailUrl ? (
              <Image
                src={item.thumbnailUrl}
                alt={item.title}
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa' }}>
                No Image
              </div>
            )}
          </div>
          <div style={{ marginTop: '8px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>
              {item.title}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#666', margin: '4px 0 0' }}>
              {item.circle || item.authors.join(', ')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
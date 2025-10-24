'use client';

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, X, FileEdit } from 'lucide-react';
import type { Doujinshi } from '@/types';

type DetailModalProps = {
  item: Doujinshi;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onTagClick: (genre: string) => void;
};

export default function DetailModal({ item, onClose, onEdit, onDelete, onTagClick }: DetailModalProps) {
  const [show, setShow] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 200);
  };

  const handleDelete = () => {
    if (window.confirm(`「${item.title}」を本当に削除しますか？`)) {
      startTransition(async () => {
        await onDelete(item.id);
        handleClose();
      });
    }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/75 z-40 transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose} />
      <div className="fixed inset-0 flex justify-center items-center z-50 p-4" onClick={handleClose}>
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-11/12 max-w-lg max-h-[90vh] flex flex-row overflow-hidden transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={(e) => e.stopPropagation()}>
          <div className="w-1/3 aspect-[0.707] relative flex-shrink-0">
            {item.thumbnailUrl ? <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" /> : <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500 text-xs text-center p-1">No Image</div>}
          </div>
          <div className="w-2/3 p-3 flex flex-col flex-grow overflow-y-auto">
            <h2 className="text-base font-bold mb-1.5 text-gray-900 dark:text-white leading-tight">{item.title}</h2>
            <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300 mb-3">
              <p><strong>サークル:</strong> {item.circle ? <Link href={`/circle/${encodeURIComponent(item.circle)}`} className="text-blue-600 hover:underline">{item.circle}</Link> : '情報なし'}</p>
              <p><strong>作家:</strong> {item.authors.length > 0 ? item.authors.map((author, index) => (<span key={author}><Link href={`/author/${encodeURIComponent(author)}`} className="text-blue-600 hover:underline">{author}</Link>{index < item.authors.length - 1 ? ', ' : ''}</span>)) : '情報なし'}</p>
              {item.publishedDate && <p><strong>発行日:</strong> {new Date(item.publishedDate).toLocaleDateString()}</p>}
              {item.genres && item.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.genres.map((genre) => (
                    <button key={genre} onClick={() => onTagClick(genre)} className="text-[10px] bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-1.5 py-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{genre}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-auto flex justify-end space-x-2 pt-2">
              <button onClick={handleDelete} disabled={isPending} className="flex items-center justify-center px-2.5 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 transition-colors">
                <Trash2 className="w-3 h-3 mr-1" />{isPending ? '削除中...' : '削除'}
              </button>
              <button onClick={onEdit} disabled={isPending} className="flex items-center justify-center px-2.5 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                <FileEdit className="w-3 h-3 mr-1" />編集
              </button>
              <button onClick={handleClose} disabled={isPending} className="flex items-center justify-center px-2.5 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 transition-colors">
                <X className="w-3 h-3 mr-1" />閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
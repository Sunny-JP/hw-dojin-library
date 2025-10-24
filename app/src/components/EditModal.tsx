'use client';

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { updateItemAction } from '@/lib/actions'; // アクションをインポート
import { X } from 'lucide-react'; // Xアイコンのみインポート
import type { Doujinshi } from '@/types';

type EditModalProps = {
  item: Doujinshi;
  onClose: () => void;
};

// 日付文字列を <input type="date"> の値に変換するヘルパー関数
const formatDateForInput = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  try { return new Date(dateString).toISOString().split('T')[0]; } catch (e) { return ''; }
};

export default function EditModal({ item, onClose }: EditModalProps) {
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

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateItemAction(formData);
      if (result?.error) {
        alert(`更新失敗: ${result.error}`);
      } else {
        handleClose();
      }
    });
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/75 z-40 transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose} />
      <div className="fixed inset-0 flex justify-center items-center z-50 p-4" onClick={handleClose}>
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-11/12 max-w-lg max-h-[90vh] flex flex-col overflow-hidden transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={(e) => e.stopPropagation()}>
          <form action={handleSubmit} className="flex flex-col overflow-y-auto">
            <h2 className="text-xl font-bold p-4 border-b">アイテム編集</h2>
            <div className="p-4 space-y-3">
              <input type="hidden" name="id" value={item.id} />
              <div><label htmlFor="edit-title" className="block text-sm font-medium mb-1">タイトル (必須)</label><input type="text" name="title" id="edit-title" required defaultValue={item.title} className="w-full border border-gray-300 rounded-md p-2 text-sm" /></div>
              <div><label htmlFor="edit-circle" className="block text-sm font-medium mb-1">サークル</label><input type="text" name="circle" id="edit-circle" defaultValue={item.circle || ''} className="w-full border border-gray-300 rounded-md p-2 text-sm" /></div>
              <div><label htmlFor="edit-authors" className="block text-sm font-medium mb-1">作家 (コンマ区切り)</label><input type="text" name="authors" id="edit-authors" defaultValue={item.authors.join(', ')} className="w-full border border-gray-300 rounded-md p-2 text-sm" /></div>
              <div><label htmlFor="edit-genres" className="block text-sm font-medium mb-1">ジャンル (コンマ区切り)</label><input type="text" name="genres" id="edit-genres" defaultValue={item.genres.join(', ')} className="w-full border border-gray-300 rounded-md p-2 text-sm" /></div>
              <div><label htmlFor="edit-publishedDate" className="block text-sm font-medium mb-1">発行日</label><input type="date" name="publishedDate" id="edit-publishedDate" defaultValue={formatDateForInput(item.publishedDate)} min="1000-01-01" max="9999-12-31" className="w-full border border-gray-300 rounded-md p-2 text-sm" /></div>
              <div>
                <label htmlFor="edit-thumbnail" className="block text-sm font-medium mb-1">サムネイル画像 (新規登録で上書き)</label>
                {item.thumbnailUrl && <div className="mb-2"><Image src={item.thumbnailUrl} alt="現在の画像" width={80} height={113} className="rounded-md border" /></div>}
                <input type="file" name="thumbnail" id="edit-thumbnail" accept="image/*" className="w-full text-sm" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50 dark:bg-gray-700">
              <button type="button" onClick={handleClose} disabled={isPending} className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 transition-colors">キャンセル</button>
              <button type="submit" disabled={isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors">{isPending ? '更新中...' : '更新する'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

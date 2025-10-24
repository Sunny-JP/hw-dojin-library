'use client';

import { useState, useEffect, useTransition } from 'react';
import { createItemAction } from '@/lib/actions'; // アクションをインポート
import { X } from 'lucide-react'; // Xアイコンのみインポート

// 初期値の型定義
type InitialValues = {
  circle?: string;
  author?: string;
};

type AddModalProps = {
  onClose: () => void;
  initialValues?: InitialValues;
};

export default function AddModal({ onClose, initialValues }: AddModalProps) {
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
      const result = await createItemAction(formData);
      if (result?.error) {
        alert(`作成失敗: ${result.error}`);
      } else {
        handleClose();
      }
    });
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/75 z-40 transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div
        className="fixed inset-0 flex justify-center items-center z-50 p-4"
        onClick={handleClose}
      >
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-11/12 max-w-lg max-h-[90vh] flex flex-col overflow-hidden transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <form action={handleSubmit} className="flex flex-col overflow-y-auto">
            <h2 className="text-xl font-bold p-4 border-b">新規アイテム登録</h2>
            <div className="p-4 space-y-3">
              <div><label htmlFor="title" className="block text-sm font-medium mb-1">タイトル (必須)</label><input type="text" name="title" id="title" required className="w-full border border-gray-300 rounded-md p-2 text-sm" /></div>
              <div><label htmlFor="circle" className="block text-sm font-medium mb-1">サークル</label><input type="text" name="circle" id="circle" defaultValue={initialValues?.circle || ''} className="w-full border border-gray-300 rounded-md p-2 text-sm" /></div>
              <div><label htmlFor="authors" className="block text-sm font-medium mb-1">作家 (コンマ区切り)</label><input type="text" name="authors" id="authors" defaultValue={initialValues?.author || ''} className="w-full border border-gray-300 rounded-md p-2 text-sm" /></div>
              <div><label htmlFor="genres" className="block text-sm font-medium mb-1">ジャンル (コンマ区切り)</label><input type="text" name="genres" id="genres" className="w-full border border-gray-300 rounded-md p-2 text-sm" /></div>
              <div><label htmlFor="publishedDate" className="block text-sm font-medium mb-1">発行日</label><input type="date" name="publishedDate" id="publishedDate" min="1000-01-01" max="9999-12-31" className="w-full border border-gray-300 rounded-md p-2 text-sm" /></div>
              <div><label htmlFor="thumbnail" className="block text-sm font-medium mb-1">サムネイル画像</label><input type="file" name="thumbnail" id="thumbnail" accept="image/*" className="w-full text-sm" /></div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50 dark:bg-gray-700">
              <button type="button" onClick={handleClose} disabled={isPending} className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 transition-colors">キャンセル</button>
              <button type="submit" disabled={isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors">{isPending ? '登録中...' : '登録する'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

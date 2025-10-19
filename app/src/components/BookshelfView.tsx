'use client';

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
// ▼▼▼ Squares を ListChecks に変更しました ▼▼▼
import { Trash2, X, FileEdit, CheckSquare, Square, Plus, ListChecks } from 'lucide-react';
import { deleteItemsAction, createItemAction } from '@/lib/actions';

// --- 型定義 (変更なし) ---
type Doujinshi = {
  id: string;
  title: string;
  circle?: string | null;
  authors: string[];
  thumbnailUrl?: string | null;
  publishedDate?: string | null;
};
type BookshelfProps = {
  items: Doujinshi[];
};

// --- 詳細表示モーダル (変更なし) ---
const DetailModal = ({ item, onClose, onEdit }: { item: Doujinshi; onClose: () => void; onEdit: (id: string) => void; }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 10);
    return () => clearTimeout(timer);
  }, []);
  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 200); 
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
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-11/12 max-w-lg max-h-[90vh] flex flex-row overflow-hidden transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-1/3 aspect-[0.707] relative flex-shrink-0">
            {item.thumbnailUrl ? (
              <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500 text-xs text-center p-1">No Image</div>
            )}
          </div>
          <div className="w-2/3 p-3 flex flex-col flex-grow overflow-y-auto">
            <h2 className="text-base font-bold mb-1.5 text-gray-900 dark:text-white leading-tight">{item.title}</h2>
            <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300 mb-3">
              <p><strong>サークル:</strong> {item.circle || '情報なし'}</p>
              <p><strong>作家:</strong> {item.authors.join(', ')}</p>
              {item.publishedDate && (
                <p><strong>発行日:</strong> {new Date(item.publishedDate).toLocaleDateString()}</p>
              )}
            </div>
            <div className="mt-auto flex justify-end space-x-2 pt-2">
              <button onClick={() => onEdit(item.id)} className="flex items-center justify-center px-2.5 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <FileEdit className="w-3 h-3 mr-1" />
                編集
              </button>
              <button onClick={handleClose} className="flex items-center justify-center px-2.5 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                <X className="w-3 h-3 mr-1" />
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// --- 新規追加モーダル (変更なし) ---
const AddModal = ({ onClose }: { onClose: () => void }) => {
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
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">タイトル (必須)</label>
                <input type="text" name="title" id="title" required className="w-full border border-gray-300 rounded-md p-2 text-sm" />
              </div>
              <div>
                <label htmlFor="circle" className="block text-sm font-medium mb-1">サークル</label>
                <input type="text" name="circle" id="circle" className="w-full border border-gray-300 rounded-md p-2 text-sm" />
              </div>
              <div>
                <label htmlFor="authors" className="block text-sm font-medium mb-1">作家 (コンマ区切り)</label>
                <input type="text" name="authors" id="authors" className="w-full border border-gray-300 rounded-md p-2 text-sm" />
              </div>
              <div>
                <label htmlFor="genres" className="block text-sm font-medium mb-1">ジャンル (コンマ区切り)</label>
                <input type="text" name="genres" id="genres" className="w-full border border-gray-300 rounded-md p-2 text-sm" />
              </div>
              <div>
                <label htmlFor="publishedDate" className="block text-sm font-medium mb-1">発行日</label>
                <input type="date" name="publishedDate" id="publishedDate" min="1000-01-01" max="9999-12-31" className="w-full border border-gray-300 rounded-md p-2 text-sm" />
              </div>
              <div>
                <label htmlFor="thumbnail" className="block text-sm font-medium mb-1">サムネイル画像</label>
                <input type="file" name="thumbnail" id="thumbnail" accept="image/*" className="w-full text-sm" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
              <button type="button" onClick={handleClose} disabled={isPending} className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 transition-colors">
                キャンセル
              </button>
              <button type="submit" disabled={isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                {isPending ? '登録中...' : '登録する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};


// --- メインの本棚ビュー ---
export default function BookshelfView({ items }: BookshelfProps) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [modalItem, setModalItem] = useState<Doujinshi | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [localItems, setLocalItems] = useState(items);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems(new Set()); 
  };

  const handleItemClick = (item: Doujinshi) => {
    if (isSelectionMode) {
      const newSelection = new Set(selectedItems);
      if (newSelection.has(item.id)) {
        newSelection.delete(item.id);
      } else {
        newSelection.add(item.id);
      }
      setSelectedItems(newSelection);
    } else {
      setModalItem(item);
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;
    if (window.confirm(`${selectedItems.size}件のアイテムを本当に削除しますか？`)) {
      startTransition(async () => {
        const result = await deleteItemsAction(Array.from(selectedItems));
        if (result?.error) {
          alert('削除に失敗しました。');
        } else {
          toggleSelectionMode();
        }
      });
    }
  };

  const handleEdit = (id: string) => {
    alert(`ID: ${id} の編集画面に遷移します。（未実装）`);
    setModalItem(null);
  };

  return (
    <main className="p-4" style={{ maxWidth: '1200px', margin: 'auto' }}>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl sm:text-2xl font-bold">所持同人誌一覧</h1>
        
        <div className="flex items-center space-x-2">
          {isSelectionMode ? (
            <>
              <button
                onClick={handleBulkDelete}
                disabled={selectedItems.size === 0 || isPending}
                className="flex items-center justify-center w-10 sm:w-auto px-3 py-1.5 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">{isPending ? '削除中...' : `削除 (${selectedItems.size})`}</span>
                <span className="sm:hidden text-xs font-bold">{isPending ? '...' : selectedItems.size}</span>
              </button>
              <button
                onClick={toggleSelectionMode}
                disabled={isPending}
                className="flex items-center justify-center w-10 sm:w-auto px-3 py-1.5 text-xs sm:text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 transition-colors"
              >
                <X className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">キャンセル</span>
              </button>
            </>
          ) : (
            <button
              onClick={toggleSelectionMode}
              className="flex items-center justify-center w-10 sm:w-auto px-3 py-1.5 text-xs sm:text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <ListChecks className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">選択</span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center w-10 sm:w-auto px-3 py-1.5 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">新規登録</span>
          </button>
        </div>
      </div>

      {localItems.length === 0 ? (
        <p>まだ登録されている同人誌はありません。</p>
      ) : (
        <div className="flex flex-col space-y-3">
          {localItems.map((item) => (
            <div
              key={item.id}
              className="relative flex flex-row items-center w-full cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              onClick={() => handleItemClick(item)}
            >
              {isSelectionMode && (
                <div className="absolute top-1 left-1 z-10 p-1">
                  {selectedItems.has(item.id) ? (
                    <CheckSquare className="w-5 h-5 text-blue-600 bg-white rounded" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-600 bg-white rounded" />
                  )}
                </div>
              )}
              
              <div className={`relative w-16 aspect-[0.707] rounded-md overflow-hidden transition-all flex-shrink-0 ${selectedItems.has(item.id) ? 'ring-4 ring-blue-500' : ''}`}>
                {item.thumbnailUrl ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200 text-gray-400 text-xs">
                    No Image
                  </div>
                )}
              </div>

              <div className="ml-4 flex-grow min-w-0">
                <h3 className="text-sm font-bold truncate" title={item.title}>
                  {item.title}
                </h3>
                <p className="text-xs text-gray-600 truncate">
                  {item.circle || item.authors.join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalItem && <DetailModal item={modalItem} onClose={() => setModalItem(null)} onEdit={handleEdit} />}
      {showAddModal && <AddModal onClose={() => setShowAddModal(false)} />}
    </main>
  );
}


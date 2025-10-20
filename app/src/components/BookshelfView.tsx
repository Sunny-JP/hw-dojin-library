'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Trash2, X, FileEdit, CheckSquare, Square, Plus, ClipboardPlus, Search, Tags } from 'lucide-react';
import { deleteItemsAction, createItemAction, updateItemAction } from '@/lib/actions';

// --- Types ---
type Doujinshi = {
  id: string;
  title: string;
  circle?: string | null;
  authors: string[];
  genres: string[];
  thumbnailUrl?: string | null;
  publishedDate?: string | null;
};
type BookshelfProps = {
  items: Doujinshi[];
  currentSearch: string;
  currentGenres: string[];
};

// --- Detail Modal ---
const DetailModal = ({ item, onClose, onEdit, onDelete, onTagClick }: { 
  item: Doujinshi; 
  onClose: () => void; 
  onEdit: () => void; 
  onDelete: (id: string) => void;
  onTagClick: (genre: string) => void;
}) => {
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
              <p><strong>サークル:</strong> {item.circle || '情報なし'}</p>
              <p><strong>作家:</strong> {item.authors.length > 0 ? item.authors.join(', ') : '情報なし'}</p>
              {item.publishedDate && <p><strong>発行日:</strong> {new Date(item.publishedDate).toLocaleDateString()}</p>}
              {item.genres && item.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.genres.map((genre) => (
                    <button key={genre} onClick={() => onTagClick(genre)} className="text-[10px] bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-1.5 py-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                      {genre}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-auto flex justify-end space-x-2 pt-2">
              <button onClick={handleDelete} disabled={isPending} className="flex items-center justify-center px-2.5 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 transition-colors">
                <Trash2 className="w-3 h-3 mr-1" />
                {isPending ? '削除中...' : '削除'}
              </button>
              <button onClick={onEdit} disabled={isPending} className="flex items-center justify-center px-2.5 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                <FileEdit className="w-3 h-3 mr-1" />
                編集
              </button>
              <button onClick={handleClose} disabled={isPending} className="flex items-center justify-center px-2.5 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 transition-colors">
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

// --- Add Modal ---
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
      <div className={`fixed inset-0 bg-black/75 z-40 transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose} />
      <div className="fixed inset-0 flex justify-center items-center z-50 p-4" onClick={handleClose}>
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-11/12 max-w-lg max-h-[90vh] flex flex-col overflow-hidden transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={(e) => e.stopPropagation()}>
          <form action={handleSubmit} className="flex flex-col overflow-y-auto">
            <h2 className="text-xl font-bold p-4 border-b">新規アイテム登録</h2>
            <div className="p-4 space-y-3">
              <div><label htmlFor="title" className="block text-sm font-medium mb-1">タイトル (必須)</label><input type="text" name="title" id="title" required className="w-full border border-gray-300 rounded-md p-2 text-sm" /></div>
              <div><label htmlFor="circle" className="block text-sm font-medium mb-1">サークル</label><input type="text" name="circle" id="circle" className="w-full border border-gray-300 rounded-md p-2 text-sm" /></div>
              <div><label htmlFor="authors" className="block text-sm font-medium mb-1">作家 (コンマ区切り)</label><input type="text" name="authors" id="authors" className="w-full border border-gray-300 rounded-md p-2 text-sm" /></div>
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
};

// --- Edit Modal ---
const formatDateForInput = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  try { return new Date(dateString).toISOString().split('T')[0]; } catch (e) { return ''; }
};
const EditModal = ({ item, onClose }: { item: Doujinshi; onClose: () => void }) => {
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
      if (result?.error) { alert(`更新失敗: ${result.error}`); } else { handleClose(); }
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
};

// --- Main Bookshelf View ---
export default function BookshelfView({ items, currentSearch, currentGenres }: BookshelfProps) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [modalItem, setModalItem] = useState<Doujinshi | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Doujinshi | null>(null);
  const [localItems, setLocalItems] = useState(items);
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isComposing, setIsComposing] = useState(false); // IME flag
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null); // Debounce timer ref

  useEffect(() => {
    setLocalItems(items);
  }, [items]);
  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems(new Set()); 
  };

  const handleItemClick = (item: Doujinshi) => {
    if (isSelectionMode) {
      const newSelection = new Set(selectedItems);
      if (newSelection.has(item.id)) { newSelection.delete(item.id); } else { newSelection.add(item.id); }
      setSelectedItems(newSelection);
    } else {
      setModalItem(item);
    }
  };
  
  // --- Search and Filter Logic ---
  const handleSearch = (term: string, genres: string[]) => {
    const params = new URLSearchParams(searchParams);
    if (term) { params.set('search', term); } else { params.delete('search'); }
    params.delete('genres'); 
    genres.forEach(genre => params.append('genres', genre));
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Input change handler with debounce and IME check
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!isComposing) {
      debounceTimerRef.current = setTimeout(() => {
        if (newSearchTerm !== currentSearch) {
          handleSearch(newSearchTerm, currentGenres);
        }
      }, 100); 
    }
  };

  // IME composition handlers
  const handleCompositionStart = () => {
    setIsComposing(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    const finalSearchTerm = (e.target as HTMLInputElement).value; 
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    // Trigger search after composition ends, with debounce
    debounceTimerRef.current = setTimeout(() => {
      if (finalSearchTerm !== currentSearch) {
        handleSearch(finalSearchTerm, currentGenres);
      }
    }, 100);
  };
  
  const handleTagClick = (genre: string) => {
    setModalItem(null); 
    const newGenres = new Set(currentGenres);
    newGenres.add(genre);
    handleSearch(searchTerm, Array.from(newGenres)); // Trigger search immediately
  };
  
  const removeGenre = (genreToRemove: string) => {
    const newGenres = currentGenres.filter(g => g !== genreToRemove);
    handleSearch(searchTerm, newGenres); // Trigger search immediately
  };
  
  // --- Action Handlers ---
  const handleAddToList = () => {
    if (selectedItems.size === 0) { alert('リストに追加するアイテムを選択してください。'); return; }
    alert(`${selectedItems.size}件のアイテムをリストに追加します。（未実装）`);
    toggleSelectionMode();
  };
  
  const handleSingleDelete = async (id: string) => {
    const result = await deleteItemsAction([id]);
    if (result?.error) { alert('削除に失敗しました。'); }
  };

  const handleEdit = () => {
    if (!modalItem) return;
    setEditingItem(modalItem);
    setModalItem(null);
  };

  return (
    <main className="p-4" style={{ maxWidth: '1200px', margin: 'auto' }}>
      {/* --- Header --- */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl sm:text-2xl font-bold">所持同人誌一覧</h1>
        <div className="flex items-center space-x-2">
          {isSelectionMode ? (
            <>
              <button onClick={handleAddToList} disabled={selectedItems.size === 0} className="flex items-center justify-center w-10 sm:w-auto px-3 py-1.5 text-xs sm:text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed">
                <ClipboardPlus className="w-4 h-4 sm:mr-1.5" /><span className="hidden sm:inline">{`追加 (${selectedItems.size})`}</span><span className="sm:hidden text-xs font-bold">{selectedItems.size}</span>
              </button>
              <button onClick={toggleSelectionMode} className="flex items-center justify-center w-10 sm:w-auto px-3 py-1.5 text-xs sm:text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600">
                <X className="w-4 h-4 sm:mr-1.5" /><span className="hidden sm:inline">キャンセル</span>
              </button>
            </>
          ) : (
            <button onClick={toggleSelectionMode} className="flex items-center justify-center w-10 sm:w-auto px-3 py-1.5 text-xs sm:text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              <ClipboardPlus className="w-4 h-4 sm:mr-1.5" /><span className="hidden sm:inline">リストへ</span>
            </button>
          )}
          <button onClick={() => setShowAddModal(true)} className="flex items-center justify-center w-10 sm:w-auto px-3 py-1.5 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
            <Plus className="w-4 h-4 sm:mr-1.5" /><span className="hidden sm:inline">新規登録</span>
          </button>
        </div>
      </div>

      {/* --- Search Bar & Filters --- */}
      <div className="mb-5 space-y-3">
        {/* Input with IME handlers */}
        <div className="relative"> 
          <input 
            type="text" 
            value={searchTerm} 
            onChange={handleSearchInputChange} 
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="タイトル, サークル, 作家名で検索..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm" 
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        {/* Selected tags display */}
        {currentGenres.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Tags className="w-4 h-4 text-gray-500" />
            {currentGenres.map(genre => (
              <div key={genre} className="flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                <span>{genre}</span>
                <button onClick={() => removeGenre(genre)} className="ml-1.5 text-blue-500 hover:text-blue-700"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Item List --- */}
      {localItems.length === 0 ? (
        <div className="text-center py-10">
          <p>該当するアイテムはありません。</p>
          <button onClick={() => handleSearch('', [])} className="mt-2 text-sm text-blue-600 hover:underline">検索をリセット</button>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {localItems.map((item) => (
            <div key={item.id} className="relative flex flex-row items-center w-full cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleItemClick(item)}>
              {isSelectionMode && <div className="absolute top-1 left-1 z-10 p-1">{selectedItems.has(item.id) ? <CheckSquare className="w-5 h-5 text-blue-600 bg-white rounded" /> : <Square className="w-5 h-5 text-gray-600 bg-white rounded" />}</div>}
              <div className={`relative w-16 aspect-[0.707] rounded-md overflow-hidden transition-all flex-shrink-0 ${selectedItems.has(item.id) ? 'ring-4 ring-blue-500' : ''}`}>
                {item.thumbnailUrl ? <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" sizes="64px" /> : <div className="flex items-center justify-center h-full bg-gray-200 text-gray-400 text-xs">No Image</div>}
              </div>
              <div className="ml-4 flex-grow min-w-0">
                <h3 className="text-sm font-bold truncate" title={item.title}>{item.title}</h3>
                <p className="text-xs text-gray-600 truncate">{item.circle || (item.authors.length > 0 ? item.authors.join(', ') : '情報なし')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Modals --- */}
      {modalItem && <DetailModal item={modalItem} onClose={() => setModalItem(null)} onEdit={handleEdit} onDelete={handleSingleDelete} onTagClick={handleTagClick} />}
      {showAddModal && <AddModal onClose={() => setShowAddModal(false)} />}
      {editingItem && <EditModal item={editingItem} onClose={() => setEditingItem(null)} />}
    </main>
  );
}
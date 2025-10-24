'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Trash2, X, FileEdit, CheckSquare, Square } from 'lucide-react';
import Header from './Header';
import SearchFilter from './SearchFilter';
import AddModal from './AddModal';
import EditModal from './EditModal';
import DetailModal from './DetailModal';
import { deleteItemsAction, createItemAction, updateItemAction } from '@/lib/actions';
import type { Doujinshi } from '@/types';

// --- Types ---
type BookshelfProps = {
  items: Doujinshi[];
  currentSearch: string;
  currentGenres: string[];
  pageTitle?: string;
  filterContext?: { type: 'circle' | 'author'; value: string };
};

// --- Main Bookshelf View ---
export default function BookshelfView({ items, currentSearch, currentGenres, pageTitle, filterContext }: BookshelfProps) {
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
  const [initialAddValues, setInitialAddValues] = useState<Record<string, string>>({});

  useEffect(() => { setLocalItems(items); }, [items]);
  useEffect(() => { setSearchTerm(currentSearch); }, [currentSearch]);

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

  const handleResetSearch = () => {
    handleSearch('', []);
  };

  const openAddModal = () => {
    let initialVals: Record<string, string> = {};
    if (filterContext?.type === 'circle') {
      initialVals.circle = filterContext.value;
    } else if (filterContext?.type === 'author') {
      initialVals.author = filterContext.value; // AddModal側でauthorsにマッピング
    }
    setInitialAddValues(initialVals);
    setShowAddModal(true);
  };

  return (
    <main className="p-4 mx-auto" style={{ maxWidth: '1200px' }}>
      {/* ▼▼▼ Header コンポーネントを使用 ▼▼▼ */}
      <Header
        pageTitle={pageTitle}
        isSelectionMode={isSelectionMode}
        toggleSelectionMode={toggleSelectionMode}
        selectedCount={selectedItems.size}
        handleAddToList={handleAddToList}
        setShowAddModal={openAddModal}
      />

      {/* ▼▼▼ SearchFilter コンポーネントを使用 ▼▼▼ */}
      <SearchFilter
        searchTerm={searchTerm}
        currentGenres={currentGenres}
        onSearchChange={handleSearchInputChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onRemoveGenre={removeGenre}
        onResetSearch={handleResetSearch} // リセットハンドラを渡す
        showResetButton={!!currentSearch || currentGenres.length > 0} // 検索条件がある場合のみリセット表示
      />

      {/* --- Item List --- */}
      {localItems.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          <p>該当するアイテムはありません。</p>
          {/* リセットボタンは SearchFilter に移動 */}
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {localItems.map((item) => (
            <div key={item.id} className="relative flex flex-row items-center w-full cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleItemClick(item)}>
              {isSelectionMode && <div className="absolute top-1 left-1 z-10 p-1">{selectedItems.has(item.id) ? <CheckSquare className="w-5 h-5 text-blue-600 bg-white rounded dark:bg-gray-800" /> : <Square className="w-5 h-5 text-gray-600 bg-white rounded dark:bg-gray-800" />}</div>}
              <div className={`relative w-16 aspect-[0.707] rounded-md overflow-hidden transition-all flex-shrink-0 ${selectedItems.has(item.id) ? 'ring-2 sm:ring-4 ring-blue-500' : ''}`}>
                {item.thumbnailUrl ? <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" sizes="64px" /> : <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-600 text-gray-400 text-xs">No Image</div>}
              </div>
              <div className="ml-4 flex-grow min-w-0">
                <h3 className="text-sm font-bold truncate dark:text-gray-100" title={item.title}>{item.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{item.circle || (item.authors.length > 0 ? item.authors.join(', ') : '情報なし')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Modals --- */}
      {modalItem && <DetailModal item={modalItem} onClose={() => setModalItem(null)} onEdit={handleEdit} onDelete={handleSingleDelete} onTagClick={handleTagClick} />}
      {showAddModal && <AddModal onClose={() => setShowAddModal(false)} initialValues={initialAddValues} />}
      {editingItem && <EditModal item={editingItem} onClose={() => setEditingItem(null)} />}
    </main>
  );
}
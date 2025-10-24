'use client';

import { Search, Tags, X } from 'lucide-react';

type SearchFilterProps = {
  searchTerm: string;
  currentGenres: string[];
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCompositionStart: () => void;
  onCompositionEnd: (event: React.CompositionEvent<HTMLInputElement>) => void;
  onRemoveGenre: (genre: string) => void;
  onResetSearch: () => void; // 検索リセット用ハンドラを追加
  showResetButton?: boolean; // リセットボタン表示条件
};

export default function SearchFilter({
  searchTerm,
  currentGenres,
  onSearchChange,
  onCompositionStart,
  onCompositionEnd,
  onRemoveGenre,
  onResetSearch,
  showResetButton = false, // デフォルトは非表示
}: SearchFilterProps) {
  return (
    <div className="mb-5 space-y-3">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          placeholder="タイトル, サークル, 作家名で検索..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* Selected Genres & Reset Button */}
      {(currentGenres.length > 0 || showResetButton) && (
        <div className="flex flex-wrap items-center gap-2">
          {currentGenres.length > 0 && <Tags className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
          {currentGenres.map(genre => (
            <div key={genre} className="flex items-center text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
              <span>{genre}</span>
              <button onClick={() => onRemoveGenre(genre)} className="ml-1.5 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {/* 検索リセットボタン */}
          {showResetButton && (
            <button onClick={onResetSearch} className="ml-auto text-xs text-blue-600 hover:underline dark:text-blue-400">
                検索をリセット
            </button>
          )}
        </div>
      )}
    </div>
  );
}
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardPlus, X, Plus, Library, Users } from 'lucide-react';

type HeaderProps = {
  pageTitle?: string;
  isSelectionMode?: boolean;
  toggleSelectionMode?: () => void;
  selectedCount?: number;
  handleAddToList?: () => void;
  setShowAddModal: (show: boolean) => void;
  isPending?: boolean;
};

const getLinkClasses = (isDisabled: boolean, baseClasses: string): string => {
  return `${baseClasses} ${isDisabled ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'hover:bg-gray-700'}`;
};

export default function Header({
  pageTitle,
  isSelectionMode = false,
  toggleSelectionMode,
  selectedCount = 0,
  handleAddToList,
  setShowAddModal,
  isPending = false,
}: HeaderProps) {
const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isCirclePage = pathname === '/circles' || pathname.startsWith('/circle/');
  const isAuthorPage = pathname === '/authors' || pathname.startsWith('/author/');
  
  const canSelectItems = !!toggleSelectionMode && !!handleAddToList; 

  const baseButtonClasses = "flex items-center justify-center h-8 w-8 sm:h-9 sm:w-auto sm:px-3 sm:py-1.5 text-xs text-white rounded-md transition-colors";

return (
    <div className="flex justify-between items-center mb-5 gap-2 sm:gap-4">
      {/* Title Section */}
      <div className="flex items-center min-w-0 flex-1">
        <h1 className="text-lg sm:text-2xl font-bold truncate">
          {pageTitle || '所持同人誌一覧'}
        </h1>
      </div>

      {/* Buttons Section - Tile Style */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
        {/* Home Button (Link) */}
        <Link 
            href="/" 
            className={getLinkClasses(isHomePage, `${baseButtonClasses} bg-gray-600`)}  
            aria-disabled={isHomePage} 
            tabIndex={isHomePage ? -1 : undefined}
            title={isHomePage ? undefined : "本棚トップへ"}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline ml-1.5">ホーム</span>
          </Link>
        {/* Circle Link */}
        <Link 
          href="/circles" 
          className={getLinkClasses(isCirclePage, `${baseButtonClasses} bg-gray-600`)} 
          aria-disabled={isCirclePage} 
          tabIndex={isCirclePage ? -1 : undefined}
          title="サークル一覧"
        >
          <Library className="w-4 h-4" />
          <span className="hidden sm:inline ml-1.5">サークル</span>
        </Link>
        
        {/* Author Link */}
        <Link 
          href="/authors" 
          className={getLinkClasses(isAuthorPage, `${baseButtonClasses} bg-gray-600`)} 
          aria-disabled={isAuthorPage} 
          tabIndex={isAuthorPage ? -1 : undefined}
          title="作家一覧"
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline ml-1.5">作家</span>
        </Link>

        {/* Action Buttons: Conditional based on Selection Mode */}
        {isSelectionMode ? (
          <>
            {/* Add to List Button */}
            <button
              onClick={handleAddToList!} // Assumes handleAddToList exists when isSelectionMode is true
              disabled={selectedCount === 0 || isPending}
              className={`${baseButtonClasses} bg-teal-600 relative hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed`}
              title={`選択 (${selectedCount})`}
            >
              <ClipboardPlus className="w-4 h-4" />
              <span className="hidden sm:inline ml-1.5">{`追加 (${selectedCount})`}</span>
              {selectedCount > 0 && <span className="sm:hidden text-xs font-bold absolute -top-1 -right-1 bg-teal-700 rounded-full px-1">{selectedCount}</span>}
            </button>
            {/* Cancel Button (Replaces Add New) */}
            <button
              onClick={toggleSelectionMode!} // Assumes toggleSelectionMode exists
              disabled={isPending}
              className={`${baseButtonClasses} bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300`}
              title="キャンセル"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline ml-1.5">キャンセル</span>
            </button>
          </>
        ) : (
          <>
            {/* List Button (Start Selection Mode) */}
            <button
              onClick={toggleSelectionMode!} // Assumes toggleSelectionMode exists
              // Disable if not on a bookshelf page OR if handlers aren't provided
              disabled={isPending || !canSelectItems} 
              className={`${baseButtonClasses} bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed`}
              title="リストへ追加"
            >
              <ClipboardPlus className="w-4 h-4" />
              <span className="hidden sm:inline ml-1.5">リストへ</span>
            </button>
            {/* Add New Button */}
            <button
              onClick={() => setShowAddModal(true)}
              disabled={isPending}
              className={getButtonClasses('bg-green-600', 'hover:bg-green-700', 'bg-green-300', isPending)}
              title="新規登録"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline ml-1.5">新規</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const getButtonClasses = (
  baseColor: string, hoverColor: string, disabledColor: string,
  isDisabled: boolean, isLink: boolean = false
): string => {
  const commonClasses = "flex items-center justify-center h-8 w-8 sm:h-9 sm:w-auto sm:px-3 sm:py-1.5 text-xs text-white rounded-md transition-colors";
  if (isDisabled) {
    // isLink の場合のみ pointer-events-none を追加
    return `${commonClasses} ${disabledColor} ${isLink ? 'opacity-70 pointer-events-none cursor-not-allowed' : 'cursor-not-allowed'}`;
  } else {
    return `${commonClasses} ${baseColor} ${hoverColor}`;
  }
};
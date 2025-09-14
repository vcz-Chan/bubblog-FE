'use client';

import Link from 'next/link';
import { Button } from "@/components/Common/Button";
import { Pencil, Cog, LayoutGrid, List } from 'lucide-react';
import { SORT_OPTIONS, SortOption } from '@/utils/constants';


type ViewMode = 'card' | 'list';

interface Props {
  userId?: string;
  sort: SortOption;
  setSort: (sort: SortOption) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  showUserControls?: boolean;
  isViewModeToggleDisabled?: boolean;
}

export function BlogControls({ 
  userId, 
  sort, 
  setSort, 
  viewMode, 
  setViewMode, 
  showUserControls = true,
  isViewModeToggleDisabled = false
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
      {/* 좌측: 글쓰기, 설정 버튼 (선택적 렌더링) */}
      {showUserControls ? (
        <div className="flex gap-4">
          <Link href="/write">
            <Button variant='outline'>
              <Pencil className="h-5 w-5 mr-2" />
              새 글 작성
            </Button>
          </Link>
          <Link href={`/settings/${userId}`}>
            <Button variant='outline'>
              <Cog className="h-5 w-5 mr-2" />
              블로그 설정
            </Button>
          </Link>
        </div>
      ) : <div /> /* 레이아웃 유지를 위한 빈 div */}

      {/* 우측: 정렬, 뷰 모드 토글 */}
      <div className="flex items-center gap-4">
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          <option value={SORT_OPTIONS.LATEST}>최신순</option>
          <option value={SORT_OPTIONS.OLDEST}>오래된순</option>
          <option value={SORT_OPTIONS.TITLE_ASC}>가나다순</option>
          <option value={SORT_OPTIONS.VIEWS}>조회순</option>
          <option value={SORT_OPTIONS.LIKES}>좋아요순</option>
        </select>

        <div className={`flex items-center gap-1 p-1 rounded-lg bg-gray-100 border ${isViewModeToggleDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'card' && !isViewModeToggleDisabled ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            aria-label="Card view"
            disabled={isViewModeToggleDisabled}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'list' && !isViewModeToggleDisabled ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            aria-label="List view"
            disabled={isViewModeToggleDisabled}
          >
            <List size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

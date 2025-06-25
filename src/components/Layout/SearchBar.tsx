'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import SearchHistoryList from './SearchHistoryList';

export default function SearchBar() {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  // 1) localStorage에서 초기 로드
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('searchHistory') || '[]');
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 2) 히스토리 저장 함수 (최대 10개)
  const addHistory = (term: string) => {
    setHistory(prev => {
      const next = [term, ...prev.filter(x => x !== term)].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(next));
      return next;
    });
  };

  const doSearch = (kw: string) => {
    addHistory(kw);
    router.push(`/search?query=${encodeURIComponent(kw)}`);
    setShowHistory(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isComposing && input.trim()) doSearch(input.trim());
  };

  // 외부 클릭 시 히스토리 닫기
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-md pr-2">
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-white rounded-full px-4 py-2"
        style={{ boxShadow: "0 1px 6px 0 rgba(0,0,0,0.2)" }}
      >
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.currentTarget.value)}
          onFocus={() => setShowHistory(true)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="검색어를 입력하세요"
          className="flex-1 ml-2 outline-none bg-transparent text-gray-800 placeholder-gray-500"
        />
      </form>

      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow rounded-md z-10">
          <SearchHistoryList
            searchHistory={history}
            onClick={(item: string) => {
              setInput(item);
              doSearch(item);
            }}
          />
        </div>
      )}
    </div>
  );
}
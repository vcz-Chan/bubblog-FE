'use client';

import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export interface PaginationProps {
  page: number; // 0-based
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  showWhenSingle?: boolean; // default: false
  prevLabel?: string; // default: '이전'
  nextLabel?: string; // default: '다음'
  rangeDesktop?: number; // default: 2
  rangeMobile?: number; // default: 1
}

function buildPageItems(current: number, total: number, range: number) {
  const items: (number | 'ellipsis')[] = [];
  const allThreshold = 2 * range + 5; // first/last + range*2 around current
  if (!total || total <= allThreshold) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const firstIdx = 0;
  const lastIdx = total - 1;
  const set = new Set<number>([firstIdx, lastIdx]);

  for (let i = current - range; i <= current + range; i++) {
    if (i >= firstIdx && i <= lastIdx) set.add(i);
  }

  if (current <= range) {
    for (let i = 1; i <= range; i++) set.add(i);
  }
  if (current >= lastIdx - range) {
    for (let i = 1; i <= range; i++) set.add(lastIdx - i);
  }

  const pages = Array.from(set).sort((a, b) => a - b);
  for (let i = 0; i < pages.length; i++) {
    const prev = pages[i - 1];
    const curr = pages[i];
    if (i > 0 && curr - prev > 1) items.push('ellipsis');
    items.push(curr);
  }
  return items;
}

export function Pagination({
  page,
  totalPages,
  onChange,
  className = '',
  showWhenSingle = false,
  prevLabel = '이전',
  nextLabel = '다음',
  rangeDesktop = 2,
  rangeMobile = 1,
}: PaginationProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const range = isMobile ? rangeMobile : rangeDesktop;

  if (!showWhenSingle && totalPages <= 1) return null;

  const items = buildPageItems(page, totalPages, range);
  const isFirst = page <= 0;
  const isLast = page >= totalPages - 1;

  return (
    <nav className={`py-4 flex justify-center space-x-2 ${className}`} aria-label="Pagination">
      {!isFirst && (
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          className="px-3 py-1 border rounded"
          aria-label="Previous page"
        >
          {prevLabel}
        </button>
      )}

      {items.map((item, idx) =>
        item === 'ellipsis' ? (
          <span key={`e-${idx}`} className="px-3 py-1 text-gray-400 select-none">…</span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={`px-3 py-1 border rounded ${
              item === page ? 'font-bold underline text-blue-600' : ''
            }`}
          >
            {item + 1}
          </button>
        )
      )}

      {!isLast && (
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          className="px-3 py-1 border rounded"
          aria-label="Next page"
        >
          {nextLabel}
        </button>
      )}
    </nav>
  );
}

export default Pagination;


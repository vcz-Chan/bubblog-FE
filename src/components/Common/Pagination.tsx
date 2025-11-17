'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
    <nav className={`py-4 flex justify-center items-center gap-2 ${className}`} aria-label="Pagination">
      {!isFirst && (
        <motion.button
          type="button"
          onClick={() => onChange(page - 1)}
          className="px-4 py-2 min-h-[44px] bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Previous page"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          {prevLabel}
        </motion.button>
      )}

      {items.map((item, idx) =>
        item === 'ellipsis' ? (
          <span key={`e-${idx}`} className="px-2 text-gray-400 select-none font-bold">…</span>
        ) : (
          <motion.button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={`
              px-4 py-2 min-h-[44px] min-w-[44px] rounded-lg font-medium
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${
                item === page
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          >
            {item + 1}
          </motion.button>
        )
      )}

      {!isLast && (
        <motion.button
          type="button"
          onClick={() => onChange(page + 1)}
          className="px-4 py-2 min-h-[44px] bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Next page"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          {nextLabel}
        </motion.button>
      )}
    </nav>
  );
}

export default Pagination;


'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // 컴포넌트가 마운트된 후에만 window 객체에 접근
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => {
      setMatches(media.matches);
    };

    // 최신 Safari에서는 addEventListener/removeEventListener를 사용해야 함
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // 구버전 브라우저 호환성
      media.addListener(listener);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [matches, query]);

  return matches;
}

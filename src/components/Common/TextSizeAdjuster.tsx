'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';

const TEXT_SCALE_KEY = 'text-scale';
const DEFAULT_TEXT_SCALE = 1.0;
const MIN_TEXT_SCALE = 0.8;
const MAX_TEXT_SCALE = 1.2;
const STEP_TEXT_SCALE = 0.1;

export default function TextSizeAdjuster() {
  const [currentScale, setCurrentScale] = useState<number>(DEFAULT_TEXT_SCALE);

  useEffect(() => {
    const savedScale = localStorage.getItem(TEXT_SCALE_KEY);
    const initialScale = savedScale ? parseFloat(savedScale) : DEFAULT_TEXT_SCALE;
    setCurrentScale(initialScale);
    document.documentElement.style.setProperty('--text-scale', initialScale.toString());
  }, []);

  const adjustTextSize = (direction: 'increase' | 'decrease') => {
    setCurrentScale((prevScale) => {
      let newScale = prevScale;
      if (direction === 'increase') {
        newScale = Math.min(MAX_TEXT_SCALE, prevScale + STEP_TEXT_SCALE);
      } else {
        newScale = Math.max(MIN_TEXT_SCALE, prevScale - STEP_TEXT_SCALE);
      }
      localStorage.setItem(TEXT_SCALE_KEY, newScale.toString());
      document.documentElement.style.setProperty('--text-scale', newScale.toString());
      return newScale;
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex space-x-2 p-2 bg-gray-800 text-white rounded-full shadow-lg">
      <button
        onClick={() => adjustTextSize('decrease')}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        aria-label="Decrease text size"
      >
        <FaMinus />
      </button>
      <button
        onClick={() => adjustTextSize('increase')}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        aria-label="Increase text size"
      >
        <FaPlus />
      </button>
    </div>
  );
}

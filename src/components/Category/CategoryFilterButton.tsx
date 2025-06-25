'use client'

import { CategoryNode } from "@/services/categoryService"

interface CategoryFilterButtonProps {
  selectedCategory: CategoryNode | null
  onOpen: () => void
}

export function CategoryFilterButton({
  selectedCategory,
  onOpen
}: CategoryFilterButtonProps) {
  return (
    <div >
      <button
        onClick={onOpen}
        className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
      >
        {selectedCategory
          ? `카테고리: ${selectedCategory.name}`
          : '카테고리 필터 열기'}
      </button>
    </div>
  )
}
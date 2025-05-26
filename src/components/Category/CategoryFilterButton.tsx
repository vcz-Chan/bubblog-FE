'use client'

interface Props {
  selectedCategory: number | null
  onOpen: () => void
}

export function CategoryFilterButton({ selectedCategory, onOpen }: Props) {
  return (
    <div className="mb-6">
      <button
        onClick={onOpen}
        className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
      >
        {selectedCategory
          ? `카테고리 필터: ${selectedCategory}`
          : '카테고리 필터 열기'}
      </button>
    </div>
  )
}
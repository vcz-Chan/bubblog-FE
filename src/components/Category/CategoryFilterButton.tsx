'use client'

import { CategoryNode } from "@/apis/categoryApi"
import { Button } from "@/components/Common/Button"
import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline'

interface CategoryFilterButtonProps {
  selectedCategory: CategoryNode | null
  onOpen: () => void
  size?: 'sm' | 'md'
}

export function CategoryFilterButton({
  selectedCategory,
  onOpen,
  size = 'md',
}: CategoryFilterButtonProps) {
  const iconClass = size === 'sm' ? 'h-4 w-4 mr-1' : 'h-5 w-5 mr-1'
  const label = selectedCategory ? selectedCategory.name : undefined
  return (
    <div className="flex items-center">
      <Button
        type="button"  
        onClick={onOpen}
        variant="ghost"
        title={label}
      >
        <Bars3BottomLeftIcon className={iconClass} />
        <span className="hidden md:inline">
          {selectedCategory
            ? `카테고리: ${selectedCategory.name}`
            : '카테고리 선택'}
        </span>
        <span className=" text-xs inline md:hidden">
          {selectedCategory
            ? `${selectedCategory.name}`
            : '카테고리'}
        </span>
      </Button>
    </div>
  )
}

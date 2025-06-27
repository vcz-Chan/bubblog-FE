'use client'

import { CategoryNode } from "@/services/categoryService"
import { Button } from "@/components/Common/Button"
import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline'

interface CategoryFilterButtonProps {
  selectedCategory: CategoryNode | null
  onOpen: () => void
}

export function CategoryFilterButton({
  selectedCategory,
  onOpen,
}: CategoryFilterButtonProps) {
  return (
    <div className="flex items-center">
      <Button
        type="button"  
        onClick={onOpen}
        variant="ghost"
      >
        <Bars3BottomLeftIcon className="h-5 w-5 mr-1" />
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
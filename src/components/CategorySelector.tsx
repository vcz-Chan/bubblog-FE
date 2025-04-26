// components/CategorySelector.tsx
"use client";

import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";

interface Category {
  id: number;
  name: string;
  children: { id: number; name: string }[];
}

interface CategorySelectorProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  categories: Category[];
  selectedCategory: number | null;
  selectedParentId: number | null;
  setSelectedCategory: (id: number) => void;
  setSelectedParentId: (id: number) => void;
  selectedText: string | null;
}

export function CategorySelector({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  selectedParentId,
  setSelectedCategory,
  setSelectedParentId,
  selectedText,
}: CategorySelectorProps) {
  return (
    <div className="mb-6">
      <button
        className="px-4 py-2 bg-purple-600 text-black rounded-full hover:bg-purple-700 shadow"
        onClick={onClose}
      >
        카테고리 선택
      </button>
      {selectedText && (
        <p className="mt-2 text-sm text-black">선택된 카테고리: {selectedText}</p>
      )}

      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md">
            <Dialog.Title className="text-lg font-bold mb-4">카테고리 선택</Dialog.Title>
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((parent) => (
                  <motion.div
                    key={parent.id}
                    whileTap={{ scale: 0.9, opacity: 0.6 }}
                    className={`w-24 h-24 flex items-center justify-center text-center rounded-full font-bold text-sm cursor-pointer ${
                      selectedParentId === parent.id ? "bg-purple-500 text-white" : "bg-purple-200 hover:bg-purple-300"
                    }`}
                    onClick={() => setSelectedParentId(parent.id)}
                  >
                    {parent.name}
                  </motion.div>
                ))}
              </div>
              {selectedParentId && (
                <div className="flex flex-wrap gap-3 justify-center">
                  {categories
                    .find((p) => p.id === selectedParentId)?.children.map((child) => (
                      <motion.button
                        key={child.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95, opacity: 0.7 }}
                        onClick={() => {
                          setSelectedCategory(child.id);
                          onClose();
                        }}
                        className={`w-20 h-20 rounded-full font-medium text-sm flex items-center justify-center ${
                          selectedCategory === child.id ? "bg-purple-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {child.name}
                      </motion.button>
                    ))}
                </div>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
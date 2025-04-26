// WritePostPage.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { CategorySelector } from "@/components/CategorySelector";
import ReactMDEEditor from "@/components/ReactMDEEditor";
import { EditorToolbar } from "@/components/EditorToolbar";

const mockCategories = [
  {
    id: 1,
    name: "공부",
    children: [
      { id: 2, name: "알고리즘" },
      { id: 3, name: "컴퓨터구조" },
      { id: 4, name: "영어" },
    ],
  },
  {
    id: 5,
    name: "일상",
    children: [
      { id: 6, name: "학교" },
      { id: 7, name: "취미" },
    ],
  },
];

export default function WritePostPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [markdown, setMarkdown] = useState<string>('# 여기에 글을 작성하세요\n');

  const insertImage = (file: File) => {
    const url = URL.createObjectURL(file);
    insertTextAtCursor(`\n![이미지](${url})\n`);
  };

  const insertTextAtCursor = (text: string, selectStartOffset = 0, selectEndOffset = 0) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const before = markdown.slice(0, start);
    const after = markdown.slice(end);
    const newText = before + text + after;

    setMarkdown(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + selectStartOffset,
        start + selectEndOffset
      );
    }, 0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
      if (!isCtrlOrCmd || !textareaRef.current) return;

      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          insertTextAtCursor("**굵게**", 2, 4);
          break;
        case "i":
          e.preventDefault();
          insertTextAtCursor("*기울임*", 1, 4);
          break;
        case "k":
          e.preventDefault();
          insertTextAtCursor("[링크텍스트](https://example.com)", 1, 6);
          break;
        case "/":
          e.preventDefault();
          insertTextAtCursor("```\n코드\n```", 4, 6);
          break;
        case "1":
          e.preventDefault();
          insertTextAtCursor("\n# 제목1\n", 0, 0);
          break;
        case "2":
          e.preventDefault();
          insertTextAtCursor("\n## 제목2\n", 0, 0);
          break;
        case "3":
          e.preventDefault();
          insertTextAtCursor("\n### 제목3\n", 0, 0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [markdown]);

  const selectedText = selectedCategory
    ? `${mockCategories.find((p) => p.id === selectedParentId)?.name || "없음"} > ` +
      `${mockCategories.flatMap((p) => p.children).find((c) => c.id === selectedCategory)?.name || "없음"}`
    : null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">글 작성하기</h1>

      <CategorySelector
        isOpen={isModalOpen}
        onOpen={() => setIsModalOpen(true)}
        onClose={() => setIsModalOpen(false)}
        categories={mockCategories}
        selectedCategory={selectedCategory}
        selectedParentId={selectedParentId}
        setSelectedCategory={setSelectedCategory}
        setSelectedParentId={setSelectedParentId}
        selectedText={selectedText}
      />

      <EditorToolbar
        imageInputRef={imageInputRef}
        insertImage={insertImage}
        insertTextAtCursor={insertTextAtCursor}
      />

      <ReactMDEEditor
        value={markdown}
        onChange={setMarkdown}
        textareaRef={textareaRef}
      />

      <button
        className="mt-6 px-6 py-3 bg-purple-600 text-black rounded-full shadow hover:bg-purple-700 transition-all"
        onClick={() => {
          alert(`카테고리: ${selectedCategory}`);
        }}
      >
        글 저장하기
      </button>
    </div>
  );
}

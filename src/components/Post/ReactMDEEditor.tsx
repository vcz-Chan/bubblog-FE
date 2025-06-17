"use client";

import { RefObject } from "react";
import MarkdownViewer from "@/components/Post/MarkdownViewer";

export default function ReactMDEEditor({
  value,
  onChange,
  textareaRef,
}: {
  value: string;
  onChange: (val: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      const markdownImage = `\n![업로드된 이미지](${url})\n`;
      onChange(value + markdownImage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const updated = value.slice(0, start) + "\t" + value.slice(end);
      onChange(updated);
      setTimeout(() => textarea.setSelectionRange(start + 1, start + 1), 0);
    }
    if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      if (value.slice(start - 1, start) === "\t") {
        const updated = value.slice(0, start - 1) + value.slice(end);
        onChange(updated);
        setTimeout(() => textarea.setSelectionRange(start - 1, start - 1), 0);
      }
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onDrop={handleDrop}
            onKeyDown={handleKeyDown}
            placeholder="여기에 마크다운을 작성하세요"
            className="w-full h-[400px] p-3 border border-gray-300 rounded focus:outline-none resize-none font-mono"
          />
        </div>

        <div className="w-full md:w-1/2 border rounded p-4 bg-gray-50 overflow-auto">
          <MarkdownViewer value={value} />
        </div>
      </div>
    </div>
  );
}
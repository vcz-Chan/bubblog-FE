// components/ReactMDEEditor.tsx
"use client";

import dynamic from "next/dynamic";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { RefObject } from "react";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

export default function ReactMDEEditor({
  value,
  onChange,
  textareaRef,
}: {
  value: string;
  onChange: (val: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
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
          <div className="prose prose-sm sm:prose-base whitespace-pre-wrap break-words max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-4" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-4" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-4" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-1" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 space-y-1" {...props} />,
                li: ({ node, ...props }) => <li className="ml-2" {...props} />,
                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 pl-4 italic text-gray-600" {...props} />,
                hr: () => <hr className="my-4 border-t border-gray-300" />,
                code: ({ node, inline, className, children, ...props }) => (
                  <code className={`bg-gray-200 px-1 py-0.5 rounded text-sm ${inline ? '' : 'block whitespace-pre overflow-auto p-2'}`} {...props}>
                    {children}
                  </code>
                ),
                img: ({ node, ...props }) => (
                  <img {...props} className="rounded max-w-full h-auto" />
                ),
                a: ({ node, ...props }) => (
                  <a className="text-blue-600 underline" target="_blank" rel="noopener noreferrer" {...props} />
                ),
                p: ({ node, ...props }) => <p className="mb-2" {...props} />, // 줄바꿈 처리용
              }}
            >
              {value}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

// components/MarkdownViewer.tsx
"use client";

import dynamic from "next/dynamic";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

export default function MarkdownViewer({ value }: { value: string }) {
  return (
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
          p: ({ node, ...props }) => <p className="mb-2" {...props} />,
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
}
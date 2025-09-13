'use client';

import Markdown from '@uiw/react-markdown-preview';
import rehypeHighlight from 'rehype-highlight';

export function PostDetailBody({ content }: { content: string }) {
  return (
    <div data-color-mode="light" className="prose prose-sm sm:prose-base max-w-none p-6">
      <Markdown
        source={content}
        rehypePlugins={[[rehypeHighlight, { detect: true }]]}
        components={{
          img: (props) => <img {...props} style={{ maxWidth: '100%' }} />,
        }}
      />
    </div>
  );
}
'use client';

import Markdown from '@uiw/react-markdown-preview';
import rehypeHighlight from 'rehype-highlight';
import { useState } from 'react';
import ImageZoomModal from '@/components/Common/ImageZoomModal';
import CodeBlock from '@/components/Common/CodeBlock';

export function PostDetailBody({ content }: { content: string }) {
  const [zoomedImage, setZoomedImage] = useState<{ src: string; alt: string } | null>(null);

  return (
    <>
      <div data-color-mode="light" className="prose prose-sm sm:prose-base max-w-none md:p-6 font-sans">
        <Markdown
          source={content}
          rehypePlugins={[[rehypeHighlight, { detect: true }]]}
          components={{
            img: (props) => (
              <img
                {...props}
                style={{ maxWidth: '100%', cursor: 'zoom-in' }}
                onClick={() => setZoomedImage({
                  src: typeof props.src === 'string' ? props.src : '',
                  alt: props.alt || ''
                })}
                className="rounded-lg hover:opacity-90 transition-opacity"
                alt={props.alt || ''}
              />
            ),
            pre: (props) => (
              <CodeBlock className={props.className}>
                {props.children}
              </CodeBlock>
            ),
          }}
        />
      </div>

      <ImageZoomModal
        isOpen={!!zoomedImage}
        onClose={() => setZoomedImage(null)}
        imageSrc={zoomedImage?.src || ''}
        imageAlt={zoomedImage?.alt}
      />
    </>
  );
}
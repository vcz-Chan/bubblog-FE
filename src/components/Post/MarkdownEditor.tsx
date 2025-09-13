'use client';

import MDEditor, { commands, ContextStore, MDEditorProps } from '@uiw/react-md-editor';
import rehypeHighlight from 'rehype-highlight';
import { getPresignedUrl, uploadToS3 } from '@/apis/uploadApi';

// S3에 이미지를 업로드하는 핸들러
const imageUploadHandler = async (file: File): Promise<string> => {
  try {
    const timestamp = Date.now();
    const key = `content-images/${timestamp}_${file.name.replace(/\s+/g, '_')}`;
    const { fileUrl: s3Url, uploadUrl: presignedUrl } = await getPresignedUrl(key, file.type);
    await uploadToS3(presignedUrl, file);
    return s3Url;
  } catch (err: any) {
    console.error('이미지 업로드 실패:', err);
    return ''; // 실패 시 빈 문자열 반환
  }
};

// 커스텀 이미지 업로드 커맨드 정의
const customImageCommand = {
  ...commands.image,
  execute: (state: ContextStore, api: ContextStore['api']) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const url = await imageUploadHandler(file);
      if (url) {
        // 에디터에 이미지 마크다운 삽입
        api.replaceSelection(`![](${url})`);
      }
    };
    input.click();
  },
};

export default function MarkdownEditor(props: MDEditorProps) {
  return (
    <div data-color-mode="light">
      <MDEditor
        {...props}
        height={500}
        preview="live"
        // 커스텀 커맨드를 포함한 전체 커맨드 설정
        commands={[
          commands.bold,
          commands.italic,
          commands.strikethrough,
          commands.hr,
          commands.title,
          commands.divider,
          commands.link,
          commands.quote,
          commands.code,
          commands.codeBlock,
          customImageCommand, // 기존 이미지 커맨드 대신 커스텀 커맨드 사용
          commands.divider,
          commands.unorderedListCommand,
          commands.orderedListCommand,
          commands.checkedListCommand,
        ]}
        // 미리보기 영역에 rehype 플러그인 적용
        previewOptions={{
            rehypePlugins: [[rehypeHighlight]],
        }}
      />
    </div>
  );
}
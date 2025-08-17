'use client';

import { RefObject, useState } from 'react';
import {
  Bold, Italic, Link as LinkIcon, Code as CodeIcon,
  List as ListIcon, ListChecks, Minus as HrIcon,
  Heading1, Heading2, Heading3, Image as ImageIcon,
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { getPresignedUrl, uploadToS3 } from '@/apis/uploadApi';

interface EditorToolbarProps {
  imageInputRef: RefObject<HTMLInputElement | null>;
  insertImage: (url: string) => void;
  insertTextAtCursor: (
    text: string,
    selectStartOffset?: number,
    selectEndOffset?: number
  ) => void;
}

export function EditorToolbar({
  imageInputRef,
  insertImage,
  insertTextAtCursor,
}: EditorToolbarProps) {
  const [uploading, setUploading] = useState(false);

  const ButtonWithTooltip = ({
    label,
    shortcut,
    onClick,
    children,
  }: {
    label: string;
    shortcut?: string;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={onClick}
            className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 hover:text-white hover:bg-purple-600 rounded transition"
          >
            {children}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content side="top" className="bg-black text-white px-2 py-1 text-xs rounded shadow">
            {label} {shortcut && <span className="text-gray-300">({shortcut})</span>}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );

  // 제목 삽입 헬퍼
  const insertHeading = (level: 1 | 2 | 3) => {
    const prefix = '#'.repeat(level) + ' 제목' + level;
    insertTextAtCursor(`\n${prefix}\n`, 0, 0);
  };

  // 파일 선택 후 호출되는 핸들러
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      e.target.value = '';
      return;
    }

    e.target.value = '';
    setUploading(true);

    try {
      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/\s+/g, '_');
      const key = `content-images/${timestamp}_${sanitizedFilename}`;

      const { fileUrl: s3Url, uploadUrl: presignedUrl } = await getPresignedUrl(key, file.type);
      await uploadToS3(presignedUrl, file);
      
      insertImage(s3Url);
    } catch (err: any) {
      console.error(err);
      alert(err.message || '이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm w-full">
      <ButtonWithTooltip label="제목1" onClick={() => insertHeading(1)}>
        <Heading1 size={25} />
      </ButtonWithTooltip>

      <ButtonWithTooltip label="제목2" onClick={() => insertHeading(2)}>
        <Heading2 size={20} />
      </ButtonWithTooltip>

      <ButtonWithTooltip label="제목3" onClick={() => insertHeading(3)}>
        <Heading3 size={15} />
      </ButtonWithTooltip>

      <ButtonWithTooltip label="굵게" shortcut="Ctrl+B" onClick={() => insertTextAtCursor('**굵게**', 2, 4)}>
        <Bold size={20} />
      </ButtonWithTooltip>

      <ButtonWithTooltip label="기울임" shortcut="Ctrl+I" onClick={() => insertTextAtCursor('*기울임*', 1, 4)}>
        <Italic size={20} />
      </ButtonWithTooltip>

      <ButtonWithTooltip
        label="링크"
        shortcut="Ctrl+K"
        onClick={() => insertTextAtCursor('[링크텍스트](https://example.com)', 1, 6)}
      >
        <LinkIcon size={20} />
      </ButtonWithTooltip>

      <ButtonWithTooltip label="코드블럭" shortcut="Ctrl+/" onClick={() => insertTextAtCursor('```\n코드\n```', 4, 6)}>
        <CodeIcon size={20} />
      </ButtonWithTooltip>

      <ButtonWithTooltip label="리스트" onClick={() => insertTextAtCursor('- 리스트 항목', 2, 7)}>
        <ListIcon size={20} />
      </ButtonWithTooltip>

      <ButtonWithTooltip
        label="체크리스트"
        onClick={() => insertTextAtCursor('- [ ] 체크리스트 항목', 6, 14)}
      >
        <ListChecks size={20} />
      </ButtonWithTooltip>

      <ButtonWithTooltip label="구분선" onClick={() => insertTextAtCursor('---', 0, 0)}>
        <HrIcon size={20} />
      </ButtonWithTooltip>

      {/* 이미지 업로드 버튼 (이 버튼 클릭 시 파일선택창) */}
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading}
              className={`
                flex items-center gap-1 px-3 py-1 text-sm font-medium ${
                  uploading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                } rounded-full transition
              `}
            >
              <ImageIcon size={16} /> 이미지
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="top" className="bg-black text-white px-2 py-1 text-xs rounded shadow">
              {uploading ? '업로드 중…' : '이미지 업로드'}
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      {/* 실제 input[type="file"]: 화면에는 보이지 않으며, 오로지 ‘이미지’ 버튼을 통해 클릭 */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={imageInputRef}
        disabled={uploading}
        onChange={handleFileChange}
      />
    </div>
  );
}
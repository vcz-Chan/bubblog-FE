// components/EditorToolbar.tsx
"use client";

import { RefObject, useState } from "react";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Code as CodeIcon,
  List as ListIcon,
  ListChecks,
  Minus as HrIcon,
  Heading1,
  Image as ImageIcon,
  Heading3,
  Heading2
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

interface EditorToolbarProps {
  imageInputRef: RefObject<HTMLInputElement>;
  insertImage: (file: File) => void;
  insertTextAtCursor: (text: string, selectStartOffset?: number, selectEndOffset?: number) => void;
}

export function EditorToolbar({ imageInputRef, insertImage, insertTextAtCursor }: EditorToolbarProps) {
  const ButtonWithTooltip = ({ label, shortcut, onClick, children }: {
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

  const insertHeading = (level: 1 | 2 | 3) => {
    const prefix = "#".repeat(level) + " 제목" + level;
    insertTextAtCursor(`\n${prefix}\n`, 0, 0);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm">
      
      <ButtonWithTooltip label="제목1" onClick={() => insertHeading(1)}>
        <Heading1 size={25} />
      </ButtonWithTooltip>
      <ButtonWithTooltip label="제목2" onClick={() => insertHeading(2)}>
        <Heading2 size={20} />
      </ButtonWithTooltip>
      <ButtonWithTooltip label="제목3" onClick={() => insertHeading(3)}>
        <Heading3 size={15} />
      </ButtonWithTooltip>
      <ButtonWithTooltip label="굵게" shortcut="Ctrl+B" onClick={() => insertTextAtCursor("**굵게**", 2, 4)}>
        <Bold size={20} />
      </ButtonWithTooltip>
      <ButtonWithTooltip label="기울임" shortcut="Ctrl+I" onClick={() => insertTextAtCursor("*기울임*", 1, 4)}>
        <Italic size={20} />
      </ButtonWithTooltip>
      <ButtonWithTooltip label="링크" shortcut="Ctrl+K" onClick={() => insertTextAtCursor("[링크텍스트](https://example.com)", 1, 6)}>
        <LinkIcon size={20} />
      </ButtonWithTooltip>
      <ButtonWithTooltip label="코드블럭" shortcut="Ctrl+/" onClick={() => insertTextAtCursor("```\n코드\n```", 4, 6)}>
        <CodeIcon size={20} />
      </ButtonWithTooltip>
      <ButtonWithTooltip label="리스트" onClick={() => insertTextAtCursor("- 리스트 항목", 2, 7)}>
        <ListIcon size={20} />
      </ButtonWithTooltip>
      <ButtonWithTooltip label="체크리스트" onClick={() => insertTextAtCursor("- [ ] 체크리스트 항목", 6, 14)}>
        <ListChecks size={20} />
      </ButtonWithTooltip>
      <ButtonWithTooltip label="구분선" onClick={() => insertTextAtCursor("---", 0, 0)}>
        <HrIcon size={20} />
      </ButtonWithTooltip>
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-full transition"
            >
              <ImageIcon size={16} /> 이미지
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="top" className="bg-black text-white px-2 py-1 text-xs rounded shadow">
              이미지 업로드
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={imageInputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) insertImage(e.target.files[0]);
        }}
      />
    </div>
  );
}
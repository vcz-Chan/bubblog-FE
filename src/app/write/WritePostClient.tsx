'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CategorySelector } from '@/components/Category/CategorySelector';
import ReactMDEEditor from '@/components/Post/ReactMDEEditor';
import { EditorToolbar } from '@/components/Post/EditorToolbar';
import {
  getBlogById,
  updateBlog,
  createBlog,
  BlogDetail,
} from '@/services/blogService';
import ThumbnailUploader from '@/components/Post/ThumbnailUploader';
import { getPresignedUrl, uploadToS3 } from '@/services/uploadService';

interface Props {
  postId?: string;
  initialData?: BlogDetail | null;
}

export default function WritePostClient({ postId, initialData }: Props) {
  const router = useRouter();
  const { userId } = useAuth();
  const isEdit = Boolean(postId);

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [summary, setSummary] = useState(initialData?.summary ?? '');
  const [markdown, setMarkdown] = useState(
    initialData?.content ?? '# 여기에 글을 작성하세요\n'
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    initialData?.categoryId ?? null
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl ?? '');
  const [publicVisible, setPublicVisible] = useState(initialData?.publicVisible ?? true);

  // 카테고리 모달 열림 상태
  const [isCatOpen, setIsCatOpen] = useState(false);

  // 에디터 관련 ref
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // 편집 모드라면 추가로 서버에서 불러오기 (초기Data가 없을 때)
  useEffect(() => {
    if (!isEdit) return;
    // initialData가 이미 넘어왔으면 이 useEffect는 생략해도 되지만,
    // 혹시 서버 fetch 결과가 없을 경우를 대비해 남겨둡니다.
    if (initialData) return;

    getBlogById(Number(postId))
      .then((data: BlogDetail) => {
        setTitle(data.title);
        setSummary(data.summary);
        setMarkdown(data.content);
        setSelectedCategory(data.categoryId);
        setThumbnailUrl(data.thumbnailUrl);
        setPublicVisible(data.publicVisible);
      })
      .catch(() => {
        alert('게시글을 불러오는 데 실패했습니다.');
        router.back();
      });
  }, [isEdit, postId, initialData, router]);

  const handleSave = async () => {
    if (!title || !summary || !selectedCategory || !thumbnailUrl) {
      alert('제목, 요약, 카테고리, 썸네일은 필수입니다.');
      return;
    }

    const payload = {
      title,
      summary,
      content: markdown,
      categoryId: selectedCategory,
      thumbnailUrl,
      publicVisible,
    };

    try {
      if (isEdit) {
        await updateBlog(Number(postId), payload);
        alert('수정되었습니다.');
        router.push(`/post/${postId}`);
      } else {
        const created = await createBlog(payload);
        alert('작성되었습니다.');
        router.push(`/post/${created.id}`);
      }
    } catch (e: any) {
      alert(`저장에 실패했습니다: ${e.message}`);
    }
  };

  // 마크다운 커서 위치에 텍스트 삽입
  const insertTextAtCursor = (
    text: string,
    selectStartOffset = 0,
    selectEndOffset = 0
  ) => {
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

  // ─── 본문 에디터 드래그&드롭 핸들러 ───
  const handleEditorDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    for (const file of imageFiles) {
      try {
        const timestamp = Date.now();
        const sanitized = file.name.replace(/\s+/g, '_');
        const key = `content-images/${timestamp}_${sanitized}`;

        const { fileUrl: s3Url, uploadUrl: presignedUrl } = await getPresignedUrl(key, file.type);
        await uploadToS3(presignedUrl, file);
        insertTextAtCursor(`\n![이미지](${s3Url})\n`);
      } catch (err: any) {
        console.error(err);
        alert(err.message || '이미지 업로드 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">
        {isEdit ? '글 수정하기' : '글 작성하기'}
      </h1>

      {/* 제목 입력 */}
      <div className="mb-4">
        <label>제목</label>
        <input
          className="w-full border p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 요약 입력 */}
      <div className="mb-4">
        <label>요약</label>
        <textarea
          className="w-full border p-2"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      {/* 카테고리 선택 */}
      <div className="mb-4">
        <button
          onClick={() => setIsCatOpen(true)}
          className="px-3 py-1 bg-indigo-600 text-white rounded-full"
        >
          {selectedCategory ? `카테고리: ${selectedCategory}` : '카테고리 선택'}
        </button>
        <CategorySelector
          userId={userId}
          isOpen={isCatOpen}
          onClose={() => setIsCatOpen(false)}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>

      {/* 썸네일 업로더 */}
      <div className="mb-6">
        <label className="block mb-1">썸네일</label>
        <ThumbnailUploader
          initialUrl={thumbnailUrl}
          onChange={(url) => setThumbnailUrl(url)}
        />
      </div>

      {/* 공개 여부 */}
      <div className="mb-6">
        <label>
          <input
            type="checkbox"
            checked={publicVisible}
            onChange={(e) => setPublicVisible(e.target.checked)}
          />
          {' '}공개 여부
        </label>
      </div>

      {/* ─── 에디터 툴바 ─── */}
      <div className="mb-4 flex items-center gap-2">
        <EditorToolbar
          imageInputRef={imageInputRef}
          insertImage={(url: string) =>
            insertTextAtCursor(`\n![이미지](${url})\n`)
          }
          insertTextAtCursor={insertTextAtCursor}
        />
      </div>

      {/* ─── 드래그&드롭을 처리하기 위해 감싸는 <div> ─── */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleEditorDrop}
        className="border border-gray-300 rounded-md p-2"
      >
        <ReactMDEEditor
          value={markdown}
          onChange={setMarkdown}
          textareaRef={textareaRef}
        />
        <div className="mt-1 text-sm text-gray-500">
          * 이미지를 드래그&드롭하거나 툴바의 “이미지” 버튼을 눌러 업로드할 수 있습니다.
        </div>
      </div>

      {/* 저장 버튼 */}
      <button
        className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-full shadow hover:bg-purple-700 transition-all"
        onClick={handleSave}
      >
        저장하기
      </button>
    </div>
  );
}
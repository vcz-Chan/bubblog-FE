'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CategorySelector } from '@/components/Category/CategorySelector';
import ReactMDEEditor from '@/components/Post/ReactMDEEditor';
import { EditorToolbar } from '@/components/Post/EditorToolbar';
import { useAuth } from '@/contexts/AuthContext';
import {
  getBlogById,
  updateBlog,
  createBlog,
  BlogDetail,
} from '@/services/blogService';

export default function WritePostPage() {
  const searchParams = useSearchParams();
  const postId = searchParams.get('postId');
  const {userId} = useAuth();
  const isEdit = Boolean(postId);
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isCatOpen, setIsCatOpen] = useState(false)
  const [markdown, setMarkdown] = useState('# 여기에 글을 작성하세요\n');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [publicVisible, setPublicVisible] = useState(true);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 편집 모드라면 기존 데이터 불러오기
  useEffect(() => {
    if (!isEdit) return;
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
  }, [isEdit, postId, router]);

  const handleSave = async () => {
    if (!title || !summary || !selectedCategory) {
      alert('제목, 요약, 카테고리는 필수입니다.');
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

  const insertImage = (file: File) => {
    const url = URL.createObjectURL(file);
    insertTextAtCursor(`\n![이미지](${url})\n`);
  };

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

  // 단축키 등 기존 로직 생략…

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">
        {isEdit ? '글 수정하기' : '글 작성하기'}
      </h1>

      <div className="mb-4">
        <label>제목</label>
        <input
          className="w-full border p-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label>요약</label>
        <textarea
          className="w-full border p-2"
          value={summary}
          onChange={e => setSummary(e.target.value)}
        />
      </div>

      
      <CategorySelector
        userId = {userId}
        isOpen={isCatOpen}
        onClose={() => setIsCatOpen(false)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <button onClick={() => setIsCatOpen(true)}>
        {selectedCategory ? `카테고리: ${selectedCategory}` : '카테고리 선택'}
      </button>

      <div className="mb-4">
        <label>썸네일 URL</label>
        <input
          className="w-full border p-2"
          value={thumbnailUrl}
          onChange={e => setThumbnailUrl(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label>
          <input
            type="checkbox"
            checked={publicVisible}
            onChange={e => setPublicVisible(e.target.checked)}
          />
          공개 여부
        </label>
      </div>

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
        onClick={handleSave}
      >
        저장하기
      </button>
    </div>
  );
}
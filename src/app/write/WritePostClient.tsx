'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, selectUserId } from '@/store/AuthStore';
import { CategorySelector } from '@/components/Category/CategorySelector';
import ReactMDEEditor from '@/components/Post/ReactMDEEditor';
import { EditorToolbar } from '@/components/Post/EditorToolbar';
import {
  getBlogById,
  updateBlog,
  createBlog,
  BlogDetail,
} from '@/apis/blogApi';
import ThumbnailUploader from '@/components/Post/ThumbnailUploader';
import { getPresignedUrl, uploadToS3 } from '@/apis/uploadApi';
import { CategoryNode } from '@/apis/categoryApi';

interface Props {
  postId?: string;
  initialData?: BlogDetail | null;
}


export default function WritePostClient({ postId, initialData }: Props) {
  const router = useRouter();
  const userId = useAuthStore(selectUserId);
  const isEdit = Boolean(postId);

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [summary, setSummary] = useState(initialData?.summary ?? '');
  const [markdown, setMarkdown] = useState(
    initialData?.content ?? '# 여기에 글을 작성하세요\n'
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(
    initialData?.categoryId != null
      ? { id: initialData.categoryId, name: '', children: [], root: false }
      : null
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl ?? '');
  const [publicVisible, setPublicVisible] = useState(initialData?.publicVisible ?? true);

  const [isCatOpen, setIsCatOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isEdit || initialData) return;

    getBlogById(Number(postId))
      .then((data: BlogDetail) => {
        setTitle(data.title);
        setSummary(data.summary);
        setMarkdown(data.content);
        setSelectedCategory({
          id: data.categoryId,
          name: '',
          children: [],
          root: false,
        });
        setThumbnailUrl(data.thumbnailUrl);
        setPublicVisible(data.publicVisible);
      })
      .catch(() => {
        alert('게시글을 불러오는 데 실패했습니다.');
        router.back();
      });
  }, [isEdit, postId, initialData, router]);

  const handleSave = async () => {
    if (!title || !summary || !selectedCategory?.id || !thumbnailUrl) {
      alert('제목, 요약, 카테고리, 썸네일은 필수입니다.');
      return;
    }

    const payload = {
      title,
      summary,
      content: markdown,
      categoryId: selectedCategory.id,
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

  const handleEditorDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const images = files.filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) return;

    for (const file of images) {
      try {
        const timestamp = Date.now();
        const key = `content-images/${timestamp}_${file.name.replace(/\s+/g, '_')}`;
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
    <div className="w-full p-8 lg:px-40 ">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? '글 수정하기' : '글 작성하기'}
      </h1>
      <div className="space-y-6 mb-6">
        <div>
          <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            id="title"
            type="text"
            placeholder="제목을 입력하세요"
            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row">
          <div className='flex-1 mr-0 md:mr-4 mb-4 md:mb-0'>
            <label htmlFor="summary" className="block mb-1 text-sm font-medium text-gray-700">
              요약
            </label>
            <textarea
              id="summary"
              placeholder="간단한 요약을 입력하세요"
              className="block w-full border border-gray-300 rounded-md px-3 py-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">썸네일</label>
            <ThumbnailUploader
              initialUrl={thumbnailUrl}
              onChange={(url) => setThumbnailUrl(url)}
            />
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-8">
        <button
          onClick={() => setIsCatOpen(true)}
          className="px-3 py-1 bg-indigo-600 text-white rounded-full"
        >
          {selectedCategory
            ? `카테고리: ${selectedCategory.name || selectedCategory.id}`
            : '카테고리 선택'}
        </button>
        <CategorySelector
          userId={userId}
          isOpen={isCatOpen}
          onClose={() => setIsCatOpen(false)}
          selectedCategory={selectedCategory}
          setSelectedCategory={(cat) =>
            setSelectedCategory(
              cat ? {
                id: cat.id,
                name: '',
                children: [],
                root: false,
              } : null
            )
          }
        />
        <label>
          <input
            type="checkbox"
            checked={publicVisible}
            onChange={(e) => setPublicVisible(e.target.checked)}
          />{' '}
          공개 여부
        </label>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <EditorToolbar
          imageInputRef={imageInputRef}
          insertImage={(url: string) => insertTextAtCursor(`\n![이미지](${url})\n`)}
          insertTextAtCursor={insertTextAtCursor}
        />
      </div>

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

      <button
        className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-full shadow hover:bg-purple-700 transition-all"
        onClick={handleSave}
      >
        저장하기
      </button>
    </div>
  );
}
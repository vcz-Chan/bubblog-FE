'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, selectUserId } from '@/store/AuthStore';
import { CategorySelector } from '@/components/Category/CategorySelector';
import {
  getBlogById,
  updateBlog,
  createBlog,
  BlogDetail,
} from '@/apis/blogApi';
import ThumbnailUploader from '@/components/Post/ThumbnailUploader';
import { CategoryNode } from '@/apis/categoryApi';
import MarkdownEditor from '@/components/Post/MarkdownEditor';

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
    if (!title || !summary || !selectedCategory?.id) {
      alert('제목, 요약, 카테고리는 필수입니다.');
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

  return (
    <div className="w-full p-4 md:pt-8 md:px-16">
      <div className="space-y-8 mb-8">
        <div>
          <input
            id="title"
            type="text"
            placeholder="제목을 입력하세요"
            className="w-full bg-transparent text-4xl font-extrabold border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-indigo-500 transition-colors placeholder-gray-400 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-8 items-start">
          <div className='flex-1 w-full'>
            <label htmlFor="summary" className="block mb-2 text-lg font-bold text-gray-800">
              요약
            </label>
            <textarea
              id="summary"
              placeholder="이 글에 대한 간단한 요약을 입력하세요..."
              className="w-full border-0 border-gray-300 rounded-lg bg-gray-50 p-4 h-36 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-auto">
            <label className="block mb-2 text-lg font-bold text-gray-800">썸네일</label>
            <ThumbnailUploader
              initialUrl={thumbnailUrl}
              onChange={(url) => setThumbnailUrl(url)}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-x-8 gap-y-4 p-4 bg-gray-50 rounded-lg">
        <div>
            <span className="font-semibold mr-4">카테고리:</span>
            <button
              onClick={() => setIsCatOpen(true)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-indigo-50 transition-colors"
            >
              {selectedCategory
                ? `카테고리: ${selectedCategory.name || selectedCategory.id}`
                : '카테고리 선택'}
            </button>
        </div>
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
        <label className="flex items-center gap-2 font-semibold cursor-pointer">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            checked={publicVisible}
            onChange={(e) => setPublicVisible(e.target.checked)}
          />
          <span>공개 발행</span>
        </label>
      </div>

      <div className="mb-8">
        <MarkdownEditor
            value={markdown}
            onChange={(val) => setMarkdown(val || '')}
        />
      </div>

      <div className="flex justify-end">
        <button
          className="px-8 py-3 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
          onClick={handleSave}
        >
          {isEdit ? '수정하기' : '발행하기'}
        </button>
      </div>
    </div>
  );
}

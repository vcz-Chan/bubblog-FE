"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

export default function EditPostPage() {
  const { postId } = useParams();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    // TODO: postId로 기존 글 가져오기
    const fetchedPost = {
      title: "기존 제목입니다",
      content: `# 기존 본문입니다\n\n수정해보세요.`,
    };
    setTitle(fetchedPost.title);
    setContent(fetchedPost.content);
  }, [postId]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요!");
      return;
    }

    // TODO: 실제 PATCH 요청
    alert("수정 완료 (모킹)");
    router.push(`/post/${postId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">글 수정하기</h1>

      {/* 제목 입력 */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
        className="w-full mb-6 p-3 border border-gray-300 rounded focus:outline-none text-lg"
      />

      {/* 에디터 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 입력 */}
        <div className="w-full md:w-1/2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="본문을 입력하세요"
            className="w-full h-[400px] p-3 border border-gray-300 rounded resize-none font-mono focus:outline-none"
          />
        </div>

        {/* 미리보기 */}
        <div className="w-full md:w-1/2 border rounded p-4 bg-gray-50 overflow-auto">
          <div className="prose prose-sm sm:prose-base whitespace-pre-wrap break-words max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeHighlight]}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-purple-600 text-white rounded shadow hover:bg-purple-700 transition-all"
        >
          수정 완료
        </button>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-300 text-black rounded shadow hover:bg-gray-400 transition-all"
        >
          취소
        </button>
      </div>
    </div>
  );
}
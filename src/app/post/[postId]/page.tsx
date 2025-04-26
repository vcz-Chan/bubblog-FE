"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import MarkdownViewer from "@/components/MarkdownViewer";
import { mockPosts } from "@/mocks/posts";
import { getCategoryPath } from "@/components/getCategory";

interface PostDetail {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  categoryId: number;
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const currentUserId = "1"; // 로그인 유저 id (임시)
  const [post, setPost] = useState<PostDetail | null>(null);

  useEffect(() => {
    const fetchedPost = mockPosts.find((p) => p.id === Number(postId));
    if (fetchedPost) setPost(fetchedPost);
  }, [postId]);

  if (!post) {
    return <div className="text-center py-20">로딩 중...</div>;
  }

  const isMyPost = post.author === currentUserId;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 제목 */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{post.title}</h1>

      {/* 작성자/날짜 */}
      <div className="flex items-center text-sm text-gray-500 mb-8">
        <span>{post.author}</span>
        <span className="mx-2">•</span>
        <span>{post.createdAt}</span>
      </div>

      <h2 className="text-sm text-gray-600 mb-4">
       카테고리: {getCategoryPath(post.categoryId)}
      </h2>

      {/* 본문 */}
      <div className="w-full border rounded p-4 bg-gray-50 overflow-auto">
        <MarkdownViewer value={post.content} />
      </div>

      {/* 수정/삭제 버튼 */}
      {isMyPost && (
        <div className="flex gap-3 mt-8">
          <Link
            href={`/edit/${post.id}`}
            className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition"
          >
            수정하기
          </Link>
          <button
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
            onClick={() => {
              if (confirm("정말 삭제하시겠습니까?")) {
                // TODO: 삭제 요청
                alert("삭제 요청 완료 (모킹)");
              }
            }}
          >
            삭제하기
          </button>
        </div>
      )}
    </div>
  );
}
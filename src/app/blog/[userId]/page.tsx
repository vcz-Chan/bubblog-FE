"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Dialog } from "@headlessui/react";
import { myPosts } from "@/mocks/posts";

interface Post {
  id: number;
  title: string;
  summary: string;
}

export default function BlogPage() {
  const params = useParams();
  const userId = params.userId as string;

  const currentUserId = "123"; // 실제 로그인 유저 ID (나중에 인증 붙으면 수정)

  const isMyBlog = userId === currentUserId;

  const [posts, setPosts] = useState<Post[]>(myPosts);

  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  const handleDelete = (id: number) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        {isMyBlog ? "내 블로그" : `${userId}님의 블로그`}
      </h1>

      {isMyBlog && (
        <div className="flex gap-4 mb-6">
          <Link href="/write">
            <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
              ✏️ 새 글 작성
            </button>
          </Link>
          <Link href="/settings">
            <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
              ⚙️ 블로그 설정
            </button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="h-32 bg-gray-100 rounded mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
              <p className="text-gray-600 mb-4">{post.summary}</p>
            </div>

            <div className="flex justify-between items-center">
              <Link href={`/post/${post.id}`} className="text-blue-500 hover:underline text-sm">
                더 보기 →
              </Link>

              {isMyBlog && (
                <div className="flex gap-2 text-sm">
                  <Link href={`/edit/${post.id}`} className="text-green-600 hover:underline">
                    수정
                  </Link>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => setDeleteTarget(post)}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 삭제 모달 */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <Dialog.Title className="text-lg font-bold mb-4">
              삭제 확인
            </Dialog.Title>
            <p className="text-gray-700 mb-6">
              "{deleteTarget?.title}" 글을 정말 삭제하시겠습니까?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deleteTarget!.id)}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
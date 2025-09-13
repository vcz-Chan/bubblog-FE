import Link from "next/link";

export default function NotFound() {
  return (
    <section className="w-full px-6 py-16 flex flex-col items-center text-center">
      <h1 className="text-2xl font-semibold text-gray-900">게시글을 찾을 수 없어요</h1>
      <p className="mt-2 text-gray-600">삭제되었거나 주소가 잘못되었을 수 있습니다.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">홈으로</Link>
        <Link href="/" className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">다른 글 보러가기</Link>
      </div>
    </section>
  );
}


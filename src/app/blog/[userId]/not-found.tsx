import Link from "next/link";

export default function NotFound() {
  return (
    <section className="w-full px-6 py-16 flex flex-col items-center text-center">
      <h1 className="text-2xl font-semibold text-gray-900">블로그를 찾을 수 없어요</h1>
      <p className="mt-2 text-gray-600">사용자가 존재하지 않거나 공개 범위가 아닙니다.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">홈으로</Link>
        <Link href="/" className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">게시글 탐색</Link>
      </div>
    </section>
  );
}


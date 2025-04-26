import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Image
              src="/logo.jpeg" // 흰색 배경에 맞춘 흰색 로고 파일 (public 폴더에 위치)
              alt="서비스 로고"
              width={150}
              height={40}
              priority
            />
          </Link>
          <nav className="flex gap-6 text-2xl">
            <Link
              href="/login"
              className="text-black hover:text-blue-500 transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/mypage"
              className="text-black hover:text-blue-500 transition-colors"
            >
              마이페이지
            </Link>
            <Link
              href="/write"
              className="text-black hover:text-blue-500 transition-colors"
            >
              글쓰기
            </Link>
            <Link
              href="/chatbot"
              className="text-black hover:text-blue-500 transition-colors"
            >
              챗봇 페이지
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero 섹션 */}
      <section className="max-w-6xl mx-auto py-5 bg-gradient-to-r from-purple-300 via-purple-400 to-purple-300 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            기록이 대화가 되는 블로그 Bubblog입니다.
          </h1>
          <p className="text-lg text-gray-600">
            나의 생각과 경험을 기록하고, 나만의 챗봇을 만들어보세요!
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">인기 블로그</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 포스트 카드 예시 */}
          {[1, 2, 3].map((post) => (
            <div
              key={post}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              {/* 포스트 썸네일 자리 */}
              <div className="h-40 bg-gray-100 rounded mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                포스트 제목 {post}
              </h3>
              <p className="text-gray-700 mb-4">
                포스트 요약이나 설명
              </p>
              <Link href="#" className="text-blue-500 hover:underline">
                더 보기 &rarr;
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
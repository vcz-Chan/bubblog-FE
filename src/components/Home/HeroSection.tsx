'use client';

export function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto py-5 bg-gradient-to-r from-purple-300 via-purple-400 to-purple-300 text-white">
      <div className="px-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          기록이 대화가 되는 블로그, Bubblog입니다.
        </h1>
        <p className="text-lg text-gray-600">
          나의 경험을 기록하고, 나만의 챗봇을 만들어보세요!
        </p>
      </div>
    </section>
  );
}
import type { Metadata } from "next";
import "./globals.css";
import ClientAuthInit from '@/components/ClientAuthInit';
import NavBar from '@/components/Layout/NavBar'
import { Nanum_Gothic } from 'next/font/google';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const nanumGothic = Nanum_Gothic({
  subsets: ['latin'],
  weight: ['400', '700', '800'], // 필요한 굵기만 선택
  variable: '--font-nanum-gothic', // CSS 변수명으로 Tailwind와 연동 가능
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Bubblog",
  description: "글이 대화가 되는 블로그",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        suppressHydrationWarning
        className={`${nanumGothic.variable} font-nanum antialiased`}
      >
        {/* 클라이언트에서만 init() 실행 (SSR 레이아웃 유지) */}
        <ClientAuthInit />
        <div className="flex flex-col h-screen">
          <NavBar />
          <div className="flex-1  overflow-auto bg-[rgb(244,246,248)] flex flex-col items-center">
            {children}
          </div>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

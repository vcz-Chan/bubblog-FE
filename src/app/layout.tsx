import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import NavBar from '@/components/Layout/NavBar'
import { Nanum_Gothic } from 'next/font/google';

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
        className={`${nanumGothic.variable} font-nanum antialiased`}
      >
        {/* 최상위에서 Provider로 감싸 인증 context를 모든 컴포넌트에 주입 */}
        <AuthProvider>
          <div className="flex flex-col h-screen">
            <NavBar />
            <div className="flex-1  overflow-auto bg-[rgb(244,246,248)] flex flex-col items-center">
              {children}  
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import ClientAuthInit from '@/components/ClientAuthInit';
import NavBar from '@/components/Layout/NavBar'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from 'next/script'
import { getSiteUrl, toAbsoluteUrl } from '@/utils/seo'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Bubblog',
    template: '%s | Bubblog',
  },
  description: '글이 대화가 되는 블로그',
  openGraph: {
    title: 'Bubblog',
    description: '글이 대화가 되는 블로그',
    siteName: 'Bubblog',
    type: 'website',
    images: ['/logo.jpeg'],
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bubblog',
    description: '글이 대화가 되는 블로그',
    images: ['/logo.jpeg'],
  },
  icons: {
    icon: '/favicon.ico',
  },
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
        className={`font-nanum antialiased`}
      >
        <Script id="ld-website" type="application/ld+json" strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Bubblog',
              url: getSiteUrl(),
              potentialAction: {
                '@type': 'SearchAction',
                target: `${getSiteUrl()}/search?query={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {/* 클라이언트에서만 init() 실행 (SSR 레이아웃 유지) */}
        <ClientAuthInit />
        <div className="flex flex-col h-screen">
          <NavBar />
          <div className="flex-1  overflow-auto flex flex-col items-center">
            {children}
          </div>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

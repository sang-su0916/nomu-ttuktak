import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "노무뚝딱 - 쉽고 빠른 노무서류 작성",
  description: "근로계약서, 임금대장, 급여명세서, 취업규칙을 간편하게 작성하고 출력하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link 
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <Navigation />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}

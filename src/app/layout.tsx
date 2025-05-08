import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Navigation from "./components/Navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "学习文档中心",
  description: "个人学习和生活文档整理中心",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <aside className="fixed inset-y-0 left-0 w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Link 
                href="/" 
                className="text-xl font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors no-underline"
                title="回到首页"
              >
                学习文档中心
              </Link>
            </div>
            <Navigation />
          </aside>
          <main className="flex-1 ml-64 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

// 使用generateMetadata函数替代直接导出
export function generateMetadata(): Metadata {
  return {
    title: "学习文档中心",
    description: "个人学习和生活文档整理中心",
  };
}

// 创建服务器组件作为主布局
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
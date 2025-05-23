'use client';

import { useState } from "react";
import Link from "next/link";
import Navigation from "./Navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <div className="flex min-h-screen">
      {/* 汉堡菜单按钮 - 仅在小屏幕显示 */}
      <button 
        onClick={toggleMenu} 
        className="fixed top-4 left-4 z-40 rounded-md bg-gray-100 p-2 text-gray-600 shadow-md md:hidden"
        aria-label="Toggle menu"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          className="h-6 w-6"
        >
          {menuOpen ? (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          ) : (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 6h16M4 12h16M4 18h16" 
            />
          )}
        </svg>
      </button>
      
      {/* 大屏幕上的固定侧边栏 */}
      <aside 
        className="fixed inset-y-0 left-0 w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto hidden md:block"
      >
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
      
      {/* 小屏幕上的弹出菜单 */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          {/* 完全透明的背景遮罩 */}
          <div 
            className="absolute inset-0 bg-transparent"
            onClick={() => setMenuOpen(false)}
          />
          
          {/* 小弹窗样式的菜单 - 添加左侧间隙，设置背景透明度60% */}
          <div 
            className="relative z-40 bg-white/80 dark:bg-gray-800/60 w-56 max-w-[80%] h-auto overflow-y-auto rounded-r-lg shadow-xl border-r border-t border-b border-gray-200 dark:border-gray-700 animate-slide-in-left self-start mt-16 ml-4"
          >
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
          </div>
        </div>
      )}
      
      {/* 调整主内容区域的左边距也应该是响应式的 */}
      <main className="flex-1 md:ml-64 p-4">{children}</main>
      
      {/* 添加CSS动画 */}
      <style jsx global>{`
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  
  // 检查当前路径是否匹配链接
  const isActive = (path: string) => {
    // 精确匹配路径
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  return (
    <nav className="p-4">
      <ul className="space-y-2">
        <li>
          <Link 
            href="/reading" 
            className={`
              block p-2 rounded transition-colors duration-200 no-underline truncate
              ${isActive('/reading') 
                ? 'text-blue-600 dark:text-blue-400 font-medium' 
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'}
            `}
            title="阅读笔记"
          >
            阅读笔记
          </Link>
        </li>
        <li>
          <Link 
            href="/daily-life" 
            className={`
              block p-2 rounded transition-colors duration-200 no-underline truncate
              ${isActive('/daily-life') 
                ? 'text-blue-600 dark:text-blue-400 font-medium' 
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'}
            `}
            title="日常生活"
          >
            日常生活
          </Link>
        </li>
        <li>
          <Link 
            href="/tech-learning" 
            className={`
              block p-2 rounded transition-colors duration-200 no-underline truncate
              ${isActive('/tech-learning') 
                ? 'text-blue-600 dark:text-blue-400 font-medium' 
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'}
            `}
            title="技术学习"
          >
            技术学习
          </Link>
        </li>
      </ul>
    </nav>
  );
} 
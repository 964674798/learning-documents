'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  
  useEffect(() => {
    console.log("TableOfContents mounted, processing content");
    
    // 提取标题和ID
    const extractedHeadings: Heading[] = [];
    const regex = /^(#{1,3}) <a id="([^"]+)"><\/a>(.+)$/gm;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const id = match[2];
      const text = match[3].trim();
      
      extractedHeadings.push({ id, text, level });
    }
    
    console.log(`Found ${extractedHeadings.length} headings:`, extractedHeadings);
    setHeadings(extractedHeadings);
    
    // 添加滚动事件监听
    const handleScroll = () => {
      const headingElements = document.querySelectorAll('h1[id], h2[id], h3[id]');
      let currentActiveId = '';
      
      headingElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100) {
          currentActiveId = element.id;
        }
      });
      
      setActiveId(currentActiveId);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始化时调用一次
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [content]);
  
  // 修改为侧边栏样式，不再使用fixed定位
  return (
    <div className="w-64 sticky top-4 self-start ml-4 max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">
        目录 {headings.length === 0 ? '(无目录项)' : `(${headings.length}项)`}
      </h3>
      
      {headings.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">未找到目录项</p>
      ) : (
        <nav>
          <ul className="space-y-1">
            {headings.map((heading) => (
              <li 
                key={heading.id} 
                className={`py-1`}
                style={{ paddingLeft: heading.level > 1 ? `${(heading.level - 1) * 0.75}rem` : '0' }}
              >
                <a 
                  href={`#${heading.id}`}
                  className={`
                    block text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors
                    ${activeId === heading.id 
                      ? 'text-blue-600 dark:text-blue-400 font-medium' 
                      : 'text-gray-600 dark:text-gray-400'}
                  `}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(heading.id);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                      window.history.pushState(null, '', `#${heading.id}`);
                      setActiveId(heading.id);
                    }
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
} 
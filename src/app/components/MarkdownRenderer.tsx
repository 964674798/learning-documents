'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import Link from 'next/link';
import GithubSlugger from 'github-slugger';
import { marked } from 'marked';
import 'highlight.js/styles/atom-one-light.css'; // 更明亮的亮色主题
import 'github-markdown-css/github-markdown.css'; // GitHub Markdown 样式

interface MarkdownRendererProps {
  title: string;
  date: string;
  content: string;
  backLink: string;
  backText: string;
}

// 代码复制按钮组件
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);
  
  return (
    <button 
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      aria-label="复制代码"
      title="复制代码"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5"></path>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      )}
    </button>
  );
}

// 得到内容中的所有标题
function extractHeadings(content: string) {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const matches = [...content.matchAll(headingRegex)];
  
  const slugger = new GithubSlugger();
  return matches.map(match => {
    const level = match[1].length;
    const text = match[2].trim();
    const id = slugger.slug(text);
    
    return { id, text, level };
  });
}

// 增强代码块和标题组件
function EnhancedMarkdown({ content, headings }: { content: string, headings: { id: string, text: string, level: number }[] }) {
  const markdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!markdownRef.current) return;
    
    // 1. 处理代码块
    const preElements = markdownRef.current.querySelectorAll('pre');
    preElements.forEach(pre => {
      // 已经处理过的跳过
      if (pre.dataset.enhanced) return;
      
      // 添加样式
      pre.classList.add('pt-10', 'px-4', 'py-4', 'rounded-lg', 'shadow-md');
      
      // 创建外层容器
      const container = document.createElement('div');
      container.className = 'relative my-8 group';
      pre.parentNode?.insertBefore(container, pre);
      container.appendChild(pre);
      
      // 获取代码和语言
      const codeElement = pre.querySelector('code');
      if (!codeElement) return;
      
      const codeText = codeElement.textContent || '';
      const classMatch = codeElement.className.match(/language-(\w+)/);
      const language = classMatch ? classMatch[1] : '';
      
      // 添加语言标签
      if (language) {
        const langTag = document.createElement('div');
        langTag.className = 'absolute top-0 right-12 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-bl-lg rounded-tr-lg border border-gray-200 dark:border-gray-700';
        langTag.textContent = language;
        container.appendChild(langTag);
      }
      
      // 添加复制按钮
      const copyBtn = document.createElement('button');
      copyBtn.className = 'absolute top-2 right-2 p-1.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors';
      copyBtn.setAttribute('aria-label', '复制代码');
      copyBtn.setAttribute('title', '复制代码');
      copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
      
      // 添加复制功能
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(codeText);
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>';
        setTimeout(() => {
          copyBtn.innerHTML = originalHTML;
        }, 2000);
      });
      
      container.appendChild(copyBtn);
      
      // 标记为已处理
      pre.dataset.enhanced = 'true';
    });
    
    // 2. 处理标题，移除下划线并确保具有正确的ID
    const headingElements = markdownRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingsMap = new Map(headings.map(h => [h.text, h.id]));
    
    headingElements.forEach(heading => {
      // 移除标题下划线
      heading.classList.add('border-0', 'border-none');
      heading.setAttribute('style', 'border-bottom: none !important');
      
      // 确保标题有正确的ID
      const text = heading.textContent || '';
      const id = headingsMap.get(text) || '';
      if (id) {
        heading.id = id;
        
        // 添加可点击的锚点
        const anchor = document.createElement('a');
        anchor.className = 'opacity-0 hover:opacity-100 ml-2 text-blue-500';
        anchor.href = `#${id}`;
        anchor.innerHTML = '#';
        heading.appendChild(anchor);
      }
    });
    
  }, [content, headings]);

  return (
    <div ref={markdownRef} className="markdown-body bg-transparent dark:text-white dark:[color-scheme:dark] my-8 prose-pre:p-0 prose-pre:my-0 prose-headings:border-b-0 prose-headings:no-underline">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function MarkdownRenderer({
  title,
  date,
  content,
  backLink,
  backText
}: MarkdownRendererProps) {
  // 提取所有标题，确保目录和内容使用相同的标题列表
  const headings = extractHeadings(content);
  const [activeHeadingId, setActiveHeadingId] = useState('');
  
  return (
    <div className="flex justify-between mx-auto max-w-6xl px-4">
      {/* 主要内容区域 */}
      <div className="w-full max-w-3xl" id="content-area">
        <div className="mb-6 mt-4">
          <Link href={backLink} className="text-blue-600 dark:text-blue-400 hover:underline">
            ← {backText}
          </Link>
        </div>
        
        <article className="prose prose-blue dark:prose-invert max-w-none">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 border-none">{title}</h1>
            <time className="text-gray-500 dark:text-gray-400">{date}</time>
          </div>
          
          {/* 使用增强的Markdown组件渲染内容 */}
          <EnhancedMarkdown content={content} headings={headings} />
        </article>
      </div>
      
      {/* 右侧目录 */}
      <div className="hidden lg:block">
        <TableOfContents 
          headings={headings} 
          activeId={activeHeadingId}
          setActiveId={setActiveHeadingId}
          contentAreaId="content-area"
        />
      </div>
    </div>
  );
}

// 完全重写的目录组件
function TableOfContents({ 
  headings,
  activeId,
  setActiveId,
  contentAreaId
}: { 
  headings: { id: string; text: string; level: number }[];
  activeId: string;
  setActiveId: (id: string) => void;
  contentAreaId: string;
}) {
  // 处理点击导航
  const handleClick = (id: string) => {
    // 找到对应的标题元素
    const headingElement = document.getElementById(id);
    if (!headingElement) {
      console.warn(`找不到ID为 ${id} 的标题元素`);
      return;
    }
    
    // 更新当前激活的标题
    setActiveId(id);
    
    // 获取标题元素的位置
    const rect = headingElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const headingTop = rect.top + scrollTop;
    
    // 滚动到标题位置（减去顶部间距）
    window.scrollTo({
      top: headingTop - 90, // 顶部间距调整
      behavior: 'smooth'
    });
  };
  
  return (
    <div className="sticky top-8 ml-10 p-4 border-l border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-4">目录</h2>
      
      <nav>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li 
              key={heading.id} 
              className={`
                hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ease-in-out
                ${activeId === heading.id ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}
              `}
              style={{ marginLeft: `${(heading.level - 1) * 16}px` }}
            >
              <button 
                onClick={() => handleClick(heading.id)}
                className="block truncate text-sm text-left w-full py-1"
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
} 
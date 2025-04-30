'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import GithubSlugger from 'github-slugger';

interface DocumentRendererProps {
  title: string;
  date: string;
  content: string;
  backLink: string;
  backText: string;
}

// 提取标题函数
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

export default function DocumentRenderer({ 
  title, 
  date, 
  content, 
  backLink, 
  backText 
}: DocumentRendererProps) {
  const markdownRef = useRef<HTMLDivElement>(null);
  const headings = extractHeadings(content);

  // 处理DOM增强
  useEffect(() => {
    if (!markdownRef.current) return;
    
    // 处理代码块
    const preElements = markdownRef.current.querySelectorAll('pre');
    preElements.forEach(pre => {
      // 已经处理过的跳过
      if (pre.dataset.enhanced) return;
      
      // 添加样式
      pre.classList.add('p-4', 'bg-gray-800', 'rounded-lg', 'overflow-x-auto');
      
      // 创建外层容器
      const container = document.createElement('div');
      container.className = 'relative my-6';
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
        langTag.className = 'absolute top-0 right-0 px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-bl';
        langTag.textContent = language;
        container.appendChild(langTag);
      }
      
      // 添加复制按钮
      const copyBtn = document.createElement('button');
      copyBtn.className = 'absolute top-2 right-2 p-1.5 rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 focus:outline-none';
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

    // 处理标题，确保有正确的ID用于目录导航
    const headingElements = markdownRef.current.querySelectorAll('h1, h2, h3');
    const slugger = new GithubSlugger();
    
    headingElements.forEach(heading => {
      const text = heading.textContent || '';
      const id = slugger.slug(text);
      heading.id = id;
      
      // 添加样式
      heading.classList.add('whitespace-normal');
      
      // 根据级别添加不同样式
      if (heading.tagName === 'H1') {
        heading.classList.add('text-3xl', 'font-bold', 'mt-8', 'mb-4');
      } else if (heading.tagName === 'H2') {
        heading.classList.add('text-2xl', 'font-bold', 'mt-6', 'mb-3');
      } else if (heading.tagName === 'H3') {
        heading.classList.add('text-xl', 'font-bold', 'mt-5', 'mb-2');
      }
    });

    // 处理无序列表
    const unorderedLists = markdownRef.current.querySelectorAll('ul');
    unorderedLists.forEach(list => {
      list.classList.add('list-disc', 'pl-6', 'mb-4', 'ml-0');
      list.setAttribute('style', 'list-style-type: disc; padding-left: 1.5rem;');
      
      // 处理嵌套列表
      const nestedLists = list.querySelectorAll('ul');
      nestedLists.forEach(nestedList => {
        nestedList.classList.add('list-circle', 'pl-6', 'mb-2', 'ml-0');
        nestedList.setAttribute('style', 'list-style-type: circle; padding-left: 1.5rem;');
      });
      
      // 处理列表项
      const listItems = list.querySelectorAll('li');
      listItems.forEach(item => {
        item.classList.add('mb-1', 'list-item');
        item.setAttribute('style', 'display: list-item;');
      });
    });
    
    // 处理有序列表
    const orderedLists = markdownRef.current.querySelectorAll('ol');
    orderedLists.forEach(list => {
      list.classList.add('list-decimal', 'pl-6', 'mb-4', 'ml-0');
      list.setAttribute('style', 'list-style-type: decimal; padding-left: 1.5rem;');
      
      // 处理嵌套有序列表
      const nestedOlLists = list.querySelectorAll('ol');
      nestedOlLists.forEach(nestedList => {
        nestedList.classList.add('list-lower-alpha', 'pl-6', 'mb-2', 'ml-0');
        nestedList.setAttribute('style', 'list-style-type: lower-alpha; padding-left: 1.5rem;');
        
        // 第三级嵌套列表
        const thirdLevelLists = nestedList.querySelectorAll('ol');
        thirdLevelLists.forEach(thirdList => {
          thirdList.classList.add('list-lower-roman', 'pl-6', 'mb-2', 'ml-0');
          thirdList.setAttribute('style', 'list-style-type: lower-roman; padding-left: 1.5rem;');
        });
      });
      
      // 处理列表项
      const listItems = list.querySelectorAll('li');
      listItems.forEach(item => {
        item.classList.add('mb-1', 'list-item');
        item.setAttribute('style', 'display: list-item;');
      });
    });

    // 处理表格
    const tables = markdownRef.current.querySelectorAll('table');
    tables.forEach(table => {
      // 创建包装容器
      const wrapper = document.createElement('div');
      wrapper.className = 'overflow-x-auto my-4';
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
      
      // 添加表格样式
      table.classList.add('min-w-full', 'border-collapse', 'border', 'border-gray-300', 'dark:border-gray-700');
      
      // 添加表头样式
      const thead = table.querySelector('thead');
      if (thead) {
        const thElements = thead.querySelectorAll('th');
        thElements.forEach(th => {
          th.classList.add('py-2', 'px-4', 'border', 'border-gray-300', 'dark:border-gray-700', 'bg-gray-100', 'dark:bg-gray-800');
        });
      }
      
      // 添加表格内容样式
      const tdElements = table.querySelectorAll('td');
      tdElements.forEach(td => {
        td.classList.add('py-2', 'px-4', 'border', 'border-gray-300', 'dark:border-gray-700');
      });
    });
  }, [content]);
  
  return (
    <div className="flex justify-between mx-auto max-w-6xl">
      {/* 主要内容区域 - 移除所有右侧内边距 */}
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <Link href={backLink} className="text-blue-600 dark:text-blue-400 hover:underline">
            ← {backText}
          </Link>
        </div>
        
        <article className="prose prose-blue dark:prose-invert max-w-none">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <time className="text-gray-500 dark:text-gray-400">{date}</time>
          </div>
          
          <div ref={markdownRef} className="markdown-body bg-transparent dark:text-white dark:[color-scheme:dark]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
            >
              {content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
      
      {/* 右侧目录 */}
      <div className="hidden lg:block">
        <div className="sticky top-8 ml-10 p-4 border-l border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">目录</h2>
          
          <nav>
            <ul className="space-y-2">
              {headings.map((heading) => (
                <li 
                  key={heading.id} 
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ease-in-out"
                  style={{ marginLeft: `${(heading.level - 1) * 16}px` }}
                >
                  <a 
                    href={`#${heading.id}`}
                    className="block truncate text-sm text-left w-full py-1"
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
} 
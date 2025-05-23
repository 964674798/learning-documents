'use client';

import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import GithubSlugger from 'github-slugger';
import Link from 'next/link';
import 'highlight.js/styles/atom-one-light.css'; // 更明亮的亮色主题
import 'github-markdown-css/github-markdown.css'; // GitHub Markdown 样式
import TableOfContents from './TableOfContents';

interface MarkdownRendererProps {
  title: string;
  date: string;
  content: string;
  backLink: string;
  backText?: string;
}

// 得到内容中的所有标题
function extractHeadings(content: string) {
  // 首先匹配所有代码块并给它们分配占位符ID
  const codeBlocks: string[] = [];
  const contentWithoutCodeBlocks = content.replace(/```[\s\S]*?```/g, (match) => {
    const id = `CODE_BLOCK_${codeBlocks.length}`;
    codeBlocks.push(match);
    return id;
  });
  
  // 匹配行首的#号，避免代码块中的#被错误识别为标题
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const matches = [...contentWithoutCodeBlocks.matchAll(headingRegex)];
  
  const slugger = new GithubSlugger();
  // 确保slugger从头开始，没有之前的slug
  slugger.reset();
  
  const headings = matches.map(match => {
    const level = match[1].length;
    const text = match[2].trim();
    // 确保生成非空ID
    let id;
    if (text) {
      id = slugger.slug(text);
    } else {
      id = `heading-level-${level}-${Math.random().toString(36).substring(2, 9)}`;
    }
    
    return { id, text, level };
  });
  
  return headings;
}

// 增强代码块和标题组件
const EnhancedMarkdown = ({ content, headings }: { content: string, headings: { id: string, text: string, level: number }[] }) => {
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
    
    // 创建标题文本到ID的映射
    const headingsMap = new Map(headings.map(h => [h.text, h.id]));
    
    // 使用新的slugger实例来处理DOM中的标题
    const slugger = new GithubSlugger();
    slugger.reset();
    
    headingElements.forEach((heading, index) => {
      // 移除标题下划线
      heading.classList.add('border-0', 'border-none', 'whitespace-normal', 'break-words');
      heading.setAttribute('style', 'border-bottom: none !important');
      
      // 确保标题有正确的ID
      const text = heading.textContent || '';
      let id = headingsMap.get(text) || '';
      
      if (!id) {
        // 如果在Map中找不到匹配的标题，使用文本生成ID
        id = slugger.slug(text || `heading-${index}`);
      }
      
      // 如果此时ID还是空的，生成一个随机ID
      if (!id) {
        id = `heading-${index}-${Math.random().toString(36).substring(2, 9)}`;
      }
      
      heading.id = id;
      
      // 添加可点击的锚点
      const anchor = document.createElement('a');
      anchor.className = 'opacity-0 hover:opacity-100 ml-2 text-blue-500';
      anchor.href = `#${id}`;
      anchor.innerHTML = '#';
      heading.appendChild(anchor);
    });
    
    // 3. 处理图片，支持data-src属性
    const imgElements = markdownRef.current.querySelectorAll('img');
    imgElements.forEach(img => {
      // 如果存在data-src属性，则使用它替换src属性
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
    
  }, [content, headings]);

  return (
    <div ref={markdownRef} className="markdown-body bg-transparent dark:text-white dark:[color-scheme:dark] my-8 prose-pre:p-0 prose-pre:my-0 prose-headings:border-b-0 prose-headings:no-underline overflow-hidden">
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
  backText = '返回',
}: MarkdownRendererProps) {
  // 提取所有标题，确保目录和内容使用相同的标题列表
  const headings = extractHeadings(content);
  
  // 过滤掉目录标题自身，避免自引用
  const filteredHeadings = headings.filter(heading => heading.text !== '目录');
  
  const contentWithHeadingIdsAsText = `
${content}
${filteredHeadings.map(h => `<!-- ${h.text}: ${h.id} -->`).join('\n')}
`;
  
  return (
    <div className="relative w-full px-4">
      {/* 主要内容区域 - 保持在中央 */}
      <div className="flex">
        {/* 中央内容区域 - 固定宽度并居中 */}
        <div className="flex-grow max-w-3xl mx-auto overflow-hidden" id="content-area">
          {/* 返回链接 */}
          {backLink && (
            <div className="mb-6 mt-4">
              <Link href={backLink} className="text-blue-600 dark:text-blue-400 hover:underline">
                ← {backText}
              </Link>
            </div>
          )}
          
          <article className="prose prose-blue dark:prose-invert max-w-none">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 border-none break-words">{title}</h1>
              {date && <time className="text-gray-500 dark:text-gray-400">{date}</time>}
            </div>
            
            {/* 使用增强的Markdown组件渲染内容 */}
            <EnhancedMarkdown content={contentWithHeadingIdsAsText} headings={filteredHeadings} />
          </article>
        </div>          {/* 右侧目录 - 固定宽度和位置 */}
        {filteredHeadings.length > 0 && (
          <div className="w-64 hidden lg:block flex-shrink-0 ml-8">
            <TableOfContents content={contentWithHeadingIdsAsText} />
          </div>
        )}
      </div>
    </div>
  );
} 
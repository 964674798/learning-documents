'use client';

import { useEffect, useState, useRef } from 'react';

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
  const tocRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const clickedHeadingRef = useRef<string | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // 直接从内容中提取ID映射注释
    const idMappingRegex = /<!-- ([^:]+): ([^ ]+) -->/gm;
    const idMappings = new Map<string, string>();
    const headingsFromMapping: Heading[] = [];
    
    // 收集ID映射的同时，创建标题列表
    let idMappingMatch;
    while ((idMappingMatch = idMappingRegex.exec(content)) !== null) {
      const text = idMappingMatch[1];
      const id = idMappingMatch[2];
      
      // 跳过"目录"标题本身
      if (text === '目录') {
        continue;
      }
      
      idMappings.set(text, id);
      
      // 推测标题级别 - 通常主标题是h1，其他是h2或h3
      // 这个逻辑可以根据实际情况调整
      let level = 2; // 默认为h2
      if (text.includes('：') || text.includes(':')) { // 主标题通常带有冒号
        level = 1;
      } else if (text.length <= 4) { // 短标题可能是主要章节
        level = 2;
      } else if (text.includes('如何') || text.includes('为什么')) { // 问句通常是子章节
        level = 3;
      }
      
      // 保存到标题列表
      headingsFromMapping.push({ id, text, level });
    }
    
    if (headingsFromMapping.length > 0) {
      // 首先检查是否可以从映射中确定标题级别的关系
      // 如果所有标题都是同一级别，则尝试使用内容中的标记来推断层次结构
      const distinctLevels = [...new Set(headingsFromMapping.map(h => h.level))];
      if (distinctLevels.length <= 1) {
        // 首先匹配所有代码块并给它们分配占位符ID，以避免代码块内的#被解析为标题
        const codeBlocks: string[] = [];
        const contentWithoutCodeBlocks = content.replace(/```[\s\S]*?```/g, (match) => {
          const id = `CODE_BLOCK_${codeBlocks.length}`;
          codeBlocks.push(match);
          return id;
        });
        
        // 处理普通markdown标题
        const regex = /^(#{1,3})\s+(.+)$/gm;
        let match;
        
        while ((match = regex.exec(contentWithoutCodeBlocks)) !== null) {
          const level = match[1].length;
          const text = match[2].trim();
          
          // 跳过"目录"标题本身
          if (text === '目录') {
            continue;
          }
          
          // 为映射中的标题设置正确的级别
          const mappedHeading = headingsFromMapping.find(h => h.text === text);
          if (mappedHeading) {
            mappedHeading.level = level;
          }
        }
        
        // 更新标题列表，应用从内容中推断的级别
        headingsFromMapping.forEach(heading => {
          // 这里可以添加额外的级别分配逻辑
          if (heading.text.includes("：") || heading.text.includes(":")) {
            heading.level = 1; // 主标题通常带有冒号
          }
        });
      }
      
      // 排序标题，使其按照文档中的顺序显示
      // 假设第一个是主标题，其余按照级别和文本排序
      const sortedHeadings = [...headingsFromMapping].sort((a, b) => {
        // 主标题(level 1)放在最前
        if (a.level === 1 && b.level !== 1) return -1;
        if (a.level !== 1 && b.level === 1) return 1;
        
        // 同一级别的标题按在映射中的顺序
        const indexA = headingsFromMapping.indexOf(a);
        const indexB = headingsFromMapping.indexOf(b);
        return indexA - indexB;
      });
      
      setHeadings(sortedHeadings);
    } else {
      // 提取标题和ID - 更新正则表达式以兼容多种可能的格式
      const extractedHeadings: Heading[] = [];
      
      // 首先匹配所有代码块并给它们分配占位符ID，以避免代码块内的#被解析为标题
      const codeBlocks: string[] = [];
      const contentWithoutCodeBlocks = content.replace(/```[\s\S]*?```/g, (match) => {
        const id = `CODE_BLOCK_${codeBlocks.length}`;
        codeBlocks.push(match);
        return id;
      });
      
      // 处理普通markdown标题
      const regex = /^(#{1,3})\s+(.+)$/gm;
      let match;
      
      while ((match = regex.exec(contentWithoutCodeBlocks)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        
        // 跳过"目录"标题本身
        if (text === '目录') {
          continue;
        }
        
        // 生成ID，确保没有空ID
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        
        if (!id) {
          continue; // 跳过空ID
        }
        
        extractedHeadings.push({ id, text, level });
      }
      
      // 处理带有明确ID的标题 (如 ## <a id="section-id"></a>Title)
      const idRegex = /^(#{1,3})\s+<a\s+id="([^"]+)"><\/a>(.+)$/gm;
      while ((match = idRegex.exec(contentWithoutCodeBlocks)) !== null) {
        const level = match[1].length;
        const id = match[2];
        const text = match[3].trim();
        
        // 跳过"目录"标题本身
        if (text === '目录') {
          continue;
        }
        
        if (!id) {
          continue; // 跳过空ID
        }
        
        // 避免重复添加
        if (!extractedHeadings.some(h => h.id === id)) {
          extractedHeadings.push({ id, text, level });
        }
      }
      
      // 过滤掉任何可能有空ID的标题
      const validHeadings = extractedHeadings.filter(h => h.id);
      setHeadings(validHeadings);
    }
    
    // 等待DOM更新后再设置观察器
    setTimeout(() => {
      // 创建交叉观察器
      const headingElements = document.querySelectorAll('h1[id], h2[id], h3[id]');
      
      if (headingElements.length === 0) {
        return; // 如果没有找到标题元素，不创建观察器
      }
      
      const headingIds = Array.from(headingElements).map(el => el.id);
      
      // 清理旧的观察器
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // 创建新的观察器
      const observer = new IntersectionObserver(
        (entries) => {
          // 如果有最近点击的标题，不更新高亮
          if (clickedHeadingRef.current) {
            return;
          }
          
          // 检查是否已滚动到页面底部
          const scrollPosition = window.scrollY || document.documentElement.scrollTop;
          const windowHeight = window.innerHeight;
          const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
          );
          
          const isAtBottom = scrollPosition + windowHeight >= documentHeight - 50;
          
          // 如果在底部，直接激活最后一个标题并返回
          if (isAtBottom && headingIds.length > 0) {
            const lastHeadingId = headingIds[headingIds.length - 1];
            setActiveId(lastHeadingId);
            return;
          }
          
          // 获取所有可见的标题
          const visibleHeadings = entries
            .filter(entry => entry.isIntersecting)
            .map(entry => entry.target.id);
            
          // 如果有可见的标题，选择第一个作为当前活动标题
          if (visibleHeadings.length > 0) {
            setActiveId(visibleHeadings[0]);
          } else if (entries.length > 0) {
            // 如果没有可见的标题，尝试确定应该激活的标题
            // 找到最接近视口顶部的标题
            const closestHeading = entries.reduce((closest, current) => {
              const rect = current.target.getBoundingClientRect();
              if (!closest || Math.abs(rect.top) < Math.abs(closest.target.getBoundingClientRect().top)) {
                return current;
              }
              return closest;
            }, null as IntersectionObserverEntry | null);
            
            if (closestHeading) {
              setActiveId(closestHeading.target.id);
            }
          }
        },
        {
          // 根元素是视口
          root: null,
          // 调整rootMargin使其更容易捕捉标题
          rootMargin: '-20px 0px -85% 0px',
          // 任何可见度都会触发
          threshold: 0
        }
      );
      
      // 观察所有标题
      headingElements.forEach(heading => {
        observer.observe(heading);
      });
      
      // 保存观察器引用以便清理
      observerRef.current = observer;
      
      // 处理最后一个章节的边缘情况
      const handleScroll = () => {
        // 如果有最近点击的标题，不更新高亮
        if (clickedHeadingRef.current) {
          return;
        }
        
        // 获取当前滚动位置
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
        
        // 更严格的底部检测 - 使用更小的阈值
        const isAtBottom = scrollPosition + windowHeight >= documentHeight - 30;
        
        if (isAtBottom && headingIds.length > 0) {
          // 如果在底部，激活最后一个标题
          const lastHeadingId = headingIds[headingIds.length - 1];
          setActiveId(lastHeadingId);
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      
      // 初始检查是否在底部
      handleScroll();
      
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
        window.removeEventListener('scroll', handleScroll);
        
        // 清除可能存在的定时器
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
        }
      };
    }, 500); // 给DOM更新一些时间
  }, [content]);
  
  // 当活动ID改变时，滚动目录项到可见区域
  useEffect(() => {
    if (activeId && tocRef.current) {
      const activeElement = tocRef.current.querySelector(`a[href="#${activeId}"]`);
      if (activeElement) {
        // 滚动目录使活动项可见
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [activeId]);
  
  const handleHeadingClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!id) {
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      // 设置点击标题，防止滚动检测覆盖
      clickedHeadingRef.current = id;
      
      // 清除之前的定时器
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      
      element.scrollIntoView({ behavior: 'smooth' });
      // 更新URL中的锚点
      window.history.replaceState(null, '', `#${id}`);
      setActiveId(id);
      
      // 设置定时器，几秒后恢复滚动检测
      clickTimeoutRef.current = setTimeout(() => {
        clickedHeadingRef.current = null;
      }, 2000); // 2秒后恢复滚动检测
    }
  };
  
  return (
    <div 
      ref={tocRef}
      className="sticky top-8 w-full max-h-[80vh] overflow-y-auto"
    >
      <div className="relative">
        <div className="absolute top-0 left-0 bottom-0 border-l-2 border-gray-200 dark:border-gray-700"></div>
        <div className="pl-4 pr-2 py-2">
          {headings.length > 0 ? (
            <div className="toc-nav">
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
                目录
              </h3>
              <ul className="space-y-0">
                {headings.map(heading => {
                  const isActive = activeId === heading.id;
                  return (
                    <li 
                      key={heading.id} 
                      className={`
                        ${
                          heading.level === 1 
                            ? 'pl-0' 
                            : heading.level === 2 
                              ? 'pl-3' 
                              : 'pl-6'
                        } 
                        relative
                      `}
                    >
                      {isActive && (
                        <span 
                          className="absolute top-0 left-0 h-full border-l-2 border-blue-600" 
                          style={{ left: '0', marginLeft: '-1rem', zIndex: 10 }}
                          aria-hidden="true"
                        ></span>
                      )}
                      <a
                        href={`#${heading.id}`}
                        onClick={(e) => handleHeadingClick(e, heading.id)}
                        className={`
                          block py-1.5 text-sm
                          transition-colors duration-150
                          ${isActive 
                            ? 'text-blue-600 dark:text-blue-400 font-medium'
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300'
                          }
                        `}
                      >
                        <span className="truncate block max-w-[200px]">{heading.text}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">无目录内容</p>
          )}
        </div>
      </div>
    </div>
  );
} 
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Document {
  title: string;
  date?: string;
  slug: string;
  subcategory: string;
}

interface SubcategoryPageProps {
  title: string;
  description?: string;
  categoryPath: string;
  subcategoryPath: string;
  documents: Document[];
  emptyMessage?: string;
  totalWords?: number;
}

export default function SubcategoryPage({
  title,
  description,
  categoryPath,
  subcategoryPath,
  documents,
  emptyMessage = "暂无文档",
  totalWords
}: SubcategoryPageProps) {
  // 按日期排序文档
  const sortedDocuments = [...documents].sort((a, b) => {
    const dateA = a.date || '1970-01-01';
    const dateB = b.date || '1970-01-01';
    return dateB.localeCompare(dateA);
  });

  // 分组文档
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    '全部文档': true
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 overflow-x-hidden">
      {/* 顶部标题区域 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-5 mb-3 overflow-hidden">
        <div className="flex items-center flex-wrap sm:flex-nowrap">
          <div className="bg-blue-100 dark:bg-blue-900 p-2.5 xxs:p-3 rounded-lg mr-3 mb-2 sm:mb-0 flex-shrink-0">
            <BookIcon className="text-blue-500 dark:text-blue-300 h-5 w-5 xxs:h-6 xxs:w-6" />
          </div>
          <div className="w-full sm:w-auto min-w-0">
            <h1 className="text-lg xxs:text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">{title}</h1>
            <div className="text-xs xxs:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {documents.length} 文档{totalWords && ` · 约 ${totalWords} 字`}
            </div>
          </div>
        </div>
      </div>

      {/* 欢迎区域 */}
      {description && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-5 mb-3 overflow-hidden">
          <div className="flex items-start">
            <span className="text-lg xxs:text-xl mr-3 flex-shrink-0">👋</span>
            <div className="min-w-0">
              <h2 className="text-base xxs:text-lg font-medium text-gray-900 dark:text-white">欢迎</h2>
              <p className="text-sm xxs:text-base text-gray-600 dark:text-gray-300 mt-1 break-words">
                {description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 文档列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 xxs:p-3 overflow-hidden">
        {sortedDocuments.length > 0 ? (
          <>
            {/* 全部文档组 */}
            <div className="border-b border-gray-100 dark:border-gray-700">
              <button
                className="w-full flex justify-between items-center p-3 xxs:p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg overflow-hidden"
                onClick={() => toggleGroup('全部文档')}
              >
                <div className="flex items-center min-w-0 max-w-[70%]">
                  {expandedGroups['全部文档'] ? (
                    <ChevronDownIcon className="h-3.5 w-3.5 xxs:h-4 xxs:w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  ) : (
                    <ChevronRightIcon className="h-3.5 w-3.5 xxs:h-4 xxs:w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  )}
                  <span className="font-medium text-gray-900 dark:text-white text-sm xxs:text-base truncate">全部文档</span>
                </div>
                <span className="text-xs xxs:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                  {sortedDocuments.length} 篇
                </span>
              </button>
              
              {expandedGroups['全部文档'] && (
                <div className="pl-4 xxs:pl-6 sm:pl-8 pr-3 xxs:pr-4 pb-4">
                  <ul className="divide-y divide-dashed divide-gray-100 dark:divide-gray-700">
                    {sortedDocuments.map((doc, index) => {
                      const linkPath = `/${categoryPath}/${subcategoryPath}/${doc.slug || ''}`;
                      
                      return (
                        <li key={doc.slug || `doc-${index}`} className="w-full">
                          <div className="flex items-center space-x-3 py-3">
                            <Link 
                              href={linkPath}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm xxs:text-base truncate flex-grow"
                              title={doc.title}
                            >
                              {doc.title}
                            </Link>
                            <time className="text-xs xxs:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                              {doc.date || ''}
                            </time>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 xxs:py-10">
            <p className="text-gray-500 dark:text-gray-400 text-sm xxs:text-base">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 内联SVG图标组件
function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

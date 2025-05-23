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
}

export default function SubcategoryPage({
  title,
  description,
  categoryPath,
  subcategoryPath,
  documents,
  emptyMessage = "暂无文档"
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
    <div className="max-w-4xl mx-auto">
      {/* 顶部标题区域 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
            <BookIcon className="text-blue-500 dark:text-blue-300 h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {documents.length} 文档
            </div>
          </div>
        </div>
      </div>

      {/* 欢迎区域 */}
      {description && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start">
            <span className="text-xl mr-2">👋</span>
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">欢迎</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 文档列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2">
        {sortedDocuments.length > 0 ? (
          <>
            {/* 全部文档组 */}
            <div className="border-b border-gray-100 dark:border-gray-700">
              <button
                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                onClick={() => toggleGroup('全部文档')}
              >
                <div className="flex items-center">
                  {expandedGroups['全部文档'] ? (
                    <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                  )}
                  <span className="font-medium text-gray-900 dark:text-white">全部文档</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {sortedDocuments.length} 篇
                </span>
              </button>
              
              {expandedGroups['全部文档'] && (
                <div className="pl-10 pr-4 pb-4">
                  <ul className="space-y-2">
                    {sortedDocuments.map((doc, index) => {
                      const linkPath = `/${categoryPath}/${subcategoryPath}/${doc.slug || ''}`;
                      const isLast = index === sortedDocuments.length - 1;
                      
                      return (
                        <li key={doc.slug || `doc-${index}`} className={`py-3 ${!isLast ? 'border-b border-dashed border-gray-100 dark:border-gray-700' : ''}`}>
                          <div className="flex justify-between items-center">
                            <Link 
                              href={linkPath}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium truncate max-w-[70%]"
                              title={doc.title}
                            >
                              {doc.title}
                            </Link>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2 min-w-[80px] text-right">
                              {doc.date || ''}
                            </div>
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
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
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

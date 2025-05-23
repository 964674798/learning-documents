'use client';

import Link from "next/link";
import { useMemo } from "react";

interface Document {
  title: string;
  date?: string;
  slug: string;
  subcategory: string;
}

interface CategoryPageProps {
  title: string;
  description: string;
  categoryPath: string;
  documents: Document[];
  emptyMessage?: string;
  hideTitle?: boolean;
}

export default function CategoryPage({
  title,
  description,
  categoryPath,
  documents,
  emptyMessage = "暂无文档",
  hideTitle = false
}: CategoryPageProps) {
  // 按子类别分组和排序 - 使用useMemo确保服务器和客户端使用相同的结果
  const { docsBySubcategory, subcategoriesWithData } = useMemo(() => {
    const docsBySub: Record<string, Document[]> = {};
    
    // 第一步：按子类别分组
    documents.forEach(doc => {
      if (!docsBySub[doc.subcategory]) {
        docsBySub[doc.subcategory] = [];
      }
      docsBySub[doc.subcategory].push(doc);
    });
    
    // 第二步：为每个子类别排序文档
    for (const subcategory in docsBySub) {
      docsBySub[subcategory] = [...docsBySub[subcategory]].sort((a, b) => {
        // 使用固定字符串作为默认日期，避免使用new Date()
        const dateA = a.date || '1970-01-01';
        const dateB = b.date || '1970-01-01';
        return dateB.localeCompare(dateA);
      });
    }
    
    return { 
      docsBySubcategory: docsBySub,
      subcategoriesWithData: Object.keys(docsBySub)
    };
  }, [documents]);
  
  return (
    <div className="max-w-4xl mx-auto">
      {!hideTitle && (
        <>
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{title}</h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {description}
          </p>
        </>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subcategoriesWithData.map(subcategory => {
          const subcategoryDocs = docsBySubcategory[subcategory];
          
          // 只取前3个文档
          const limitedDocs = subcategoryDocs.slice(0, 3);
          
          // 文档总数
          const totalDocs = subcategoryDocs.length;
          
          // 确保生成有效的href路径
          const catPath = categoryPath || '';
          const subCatPath = subcategory ? subcategory.toLowerCase() : 'uncategorized';
          const subcategoryHref = `/${catPath}/${subCatPath}`;
          
          return (
            <div 
              key={subcategory}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col"
            >
              {/* 子类别标题 - 可点击跳转到子类别页面 */}
              <Link 
                href={subcategoryHref}
                className="block no-underline"
              >
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 truncate hover:text-blue-600 dark:hover:text-blue-400" title={subcategory}>
                  {subcategory}
                </h2>
              </Link>
              
              <div className="flex-grow overflow-hidden">
                {limitedDocs.length > 0 ? (
                  <ul className="space-y-2">
                    {limitedDocs.map(doc => (
                      <li key={doc.slug || 'no-slug'} className="group flex items-center justify-between space-x-2 py-1">
                        {/* 文档链接 - 直接跳转到文档页面 */}
                        <Link 
                          href={`/${catPath}/${subCatPath}/${doc.slug || ''}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 truncate flex-1"
                          title={doc.title}
                        >
                          {doc.title}
                        </Link>
                        {doc.date && (
                          <time className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {doc.date}
                          </time>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">该分类暂无文档</p>
                )}
              </div>
              
              {/* "查看全部"链接 - 跳转到子类别页面 */}
              {totalDocs > 3 && (
                <Link 
                  href={subcategoryHref}
                  className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 block"
                >
                  查看全部 {totalDocs} 篇文档 →
                </Link>
              )}
              {totalDocs <= 3 && totalDocs > 0 && (
                <Link 
                  href={subcategoryHref}
                  className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 block"
                >
                  查看详情 →
                </Link>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 如果没有文档，显示提示 */}
      {subcategoriesWithData.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
} 
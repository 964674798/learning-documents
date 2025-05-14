'use client';

import Link from "next/link";

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
  // 按子类别分组
  const docsBySubcategory: Record<string, Document[]> = {};
  
  documents.forEach(doc => {
    if (!docsBySubcategory[doc.subcategory]) {
      docsBySubcategory[doc.subcategory] = [];
    }
    docsBySubcategory[doc.subcategory].push(doc);
  });
  
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
        {Object.entries(docsBySubcategory).map(([subcategory, subcategoryDocs]) => (
          <div 
            key={subcategory} 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 truncate" title={subcategory}>
              {subcategory}
            </h2>
            <ul className="space-y-2">
              {subcategoryDocs.map(doc => (
                <li key={doc.slug}>
                  <Link 
                    href={`/${categoryPath}/${subcategory.toLowerCase()}/${doc.slug}`} 
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center no-underline"
                    title={doc.title}
                  >
                    <span className="truncate">{doc.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      {/* 如果没有文档，显示提示 */}
      {Object.keys(docsBySubcategory).length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
} 
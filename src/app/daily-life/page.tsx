import Link from "next/link";
import { getDocumentsByCategory } from "@/utils/docs";

export default async function DailyLifePage() {
  // 从文件系统读取日常生活文档
  const docs = await getDocumentsByCategory('Daily_Life');
  
  // 按子类别分组
  const docsBySubcategory: Record<string, typeof docs> = {};
  
  docs.forEach(doc => {
    if (!docsBySubcategory[doc.subcategory]) {
      docsBySubcategory[doc.subcategory] = [];
    }
    docsBySubcategory[doc.subcategory].push(doc);
  });
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">日常生活</h1>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        这里记录了日常生活中的计划、财务和健康管理内容。
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(docsBySubcategory).map(([subcategory, subcategoryDocs]) => (
          <div 
            key={subcategory} 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
              {subcategory}
            </h2>
            <ul className="space-y-2">
              {subcategoryDocs.map(doc => (
                <li key={doc.slug}>
                  <Link 
                    href={`/daily-life/${subcategory.toLowerCase()}/${doc.date}`} 
                    className="text-blue-600 dark:text-blue-400 hover:underline flex justify-between"
                  >
                    <span>{doc.title}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{doc.date}</span>
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
          <p className="text-gray-500 dark:text-gray-400">暂无日常生活文档</p>
        </div>
      )}
    </div>
  );
} 
import Link from "next/link";
import { getDocumentsByCategory } from "@/utils/docs";

export default async function Home() {
  // 获取各类文档
  const [techDocs, readingDocs, dailyLifeDocs] = await Promise.all([
    getDocumentsByCategory('Tech_Learning'),
    getDocumentsByCategory('Reading'),
    getDocumentsByCategory('Daily_Life')
  ]);
  
  // 合并所有文档并按日期排序（处理可能为undefined的日期）
  const allDocs = [...techDocs, ...readingDocs, ...dailyLifeDocs]
    .sort((a, b) => {
      // 如果日期不存在，使用当前日期
      const dateA = a.date || new Date().toISOString().split('T')[0];
      const dateB = b.date || new Date().toISOString().split('T')[0];
      return dateB.localeCompare(dateA);
    })
    .slice(0, 5); // 只取最近5篇
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">欢迎来到学习文档中心</h1>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        这是一个个人学习和生活文档整理中心，包含阅读笔记、日常生活记录和技术学习文档。
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">阅读笔记</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">包含新闻、文章和书籍的阅读笔记和摘要。</p>
          <Link href="/reading" className="text-blue-600 dark:text-blue-400 no-underline">
            查看阅读笔记 →
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">日常生活</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">记录生活计划、财务预算和健康管理。</p>
          <Link href="/daily-life" className="text-blue-600 dark:text-blue-400 no-underline">
            查看生活记录 →
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">技术学习</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">包含各种编程语言和技术框架的学习笔记。</p>
          <Link href="/tech-learning" className="text-blue-600 dark:text-blue-400 no-underline">
            查看技术笔记 →
          </Link>
        </div>
      </div>
      
      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">最近更新</h2>
        {allDocs.length > 0 ? (
          <ul className="space-y-3 w-full">
            {allDocs.map(doc => (
              <li key={`${doc.category}-${doc.subcategory}-${doc.slug}`} className="flex justify-between items-center w-full">
                <Link 
                  href={`/${doc.category.toLowerCase().replace('_', '-')}/${doc.subcategory.toLowerCase()}/${doc.slug}`} 
                  className="text-blue-600 dark:text-blue-400 no-underline flex-grow"
                >
                  {doc.title} ({doc.subcategory})
                </Link>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-4 flex-shrink-0">{doc.date || ''}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">暂无文档</p>
        )}
      </div>
    </div>
  );
}

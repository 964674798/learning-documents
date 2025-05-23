import Link from "next/link";
import { getAllCategories, getDocumentsByCategory, DocMetadata } from "@/utils/docs";
import { slugToTitle, titleToSlug } from "@/utils/stringUtils";

export default async function Home() {
  // 自动获取所有分类，不再硬编码固定的三个分类
  const categories = await getAllCategories();
  
  // 获取所有分类的文档
  const categoriesWithDocs = await Promise.all(
    categories.map(async (category) => {
      const docs = await getDocumentsByCategory(category, false);
      
      // 格式化分类名称用于显示
      const displayName = category.replace(/_/g, ' ');
      
      // 转换为URL友好的格式
      const urlPath = titleToSlug(displayName);
      
      // 为每个分类获取描述
      let description = "";
      switch (category) {
        case 'Tech_Learning':
          description = "技术学习笔记和知识库，包括编程、设计和其他技术领域";
          break;
        case 'Reading':
          description = "阅读笔记和摘要，包括书籍、文章和其他阅读材料";
          break;
        case 'Daily_Life':
          description = "日常生活记录，包括计划、思考和其他日常项目";
          break;
        default:
          description = `关于${displayName}的文档集合`;
      }
      
      return { 
        category,
        displayName,
        urlPath, 
        description, 
        docs 
      };
    })
  );
  
  // 为每个分类按日期排序并只取前3个
  const sortByDate = (docs: DocMetadata[]) => {
    return [...docs].sort((a, b) => {
      const dateA = a.date || '1970-01-01';
      const dateB = b.date || '1970-01-01';
      return dateB.localeCompare(dateA);
    });
  };
  
  // 合并所有文档并按日期排序获取最近5篇用于"最近更新"区域
  const allDocs = categoriesWithDocs
    .flatMap(c => c.docs)
    .sort((a, b) => {
      // 如果日期不存在，使用默认日期
      const dateA = (a as DocMetadata).date || '1970-01-01';
      const dateB = (b as DocMetadata).date || '1970-01-01';
      return dateB.localeCompare(dateA);
    })
    .slice(0, 5); // 只取最近5篇
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">欢迎来到学习文档中心</h1>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        这是一个个人学习和生活文档整理中心，自动展示Documents目录下所有分类的文档。
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 动态生成分类卡片 */}
        {categoriesWithDocs.map(({ category, displayName, urlPath, description, docs }) => {
          const recentDocs = sortByDate(docs as DocMetadata[]).slice(0, 3);
          
          return (
            <Link href={`/${urlPath || ''}`} key={category} className="no-underline">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow h-80 flex flex-col">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">{displayName}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
                
                <div className="flex-grow overflow-hidden">
                  {recentDocs.length > 0 ? (
                    <ul className="space-y-2">
                      {recentDocs.map(doc => (
                        <li key={`${doc.category}-${doc.subcategory || 'default'}-${doc.slug}`} 
                            className="truncate text-sm">
                          <span className="text-blue-600 dark:text-blue-400">
                            {doc.title} ({doc.subcategory || 'Uncategorized'})
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">暂无文档</p>
                  )}
                </div>
                
                <div className="mt-4 text-blue-600 dark:text-blue-400">
                  查看全部{displayName}文档 →
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">最近更新</h2>
        {allDocs.length > 0 ? (
          <ul className="space-y-3 w-full">
            {allDocs.map(doc => {
              // 确保有效的href路径
              const categoryPath = titleToSlug(doc.category.replace(/_/g, ' ') || '');
              const subcategoryPath = doc.subcategory ? titleToSlug(doc.subcategory) : 'uncategorized';
              const slug = doc.slug || '';
              const href = `/${categoryPath}/${subcategoryPath}/${slug}`;
              
              return (
                <li key={`${doc.category}-${doc.subcategory || 'default'}-${doc.slug}`} className="flex justify-between items-center w-full">
                  <Link 
                    href={href}
                    className="text-blue-600 dark:text-blue-400 no-underline flex-grow"
                  >
                    {doc.title} ({doc.subcategory || 'Uncategorized'})
                  </Link>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-4 flex-shrink-0">{doc.date || ''}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">暂无文档</p>
        )}
      </div>
    </div>
  );
}
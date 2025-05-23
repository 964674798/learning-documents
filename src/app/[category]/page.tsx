import { getAllCategories, getDocumentsByCategory } from "@/utils/docs";
import CategoryPage from "../components/CategoryPage";
import { notFound } from "next/navigation";
import { capitalize, slugToTitle } from "@/utils/stringUtils";

interface PageProps {
  params: {
    category: string;
  };
}

// 生成所有可能的静态路由参数
export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map(category => ({
    category: category.toLowerCase().replace(/_/g, '-')
  }));
}

export default async function DynamicCategoryPage({ params }: PageProps) {
  const { category } = params;
  
  // 将URL参数转换回可能的目录名称
  const possibleDirectories = [
    category,                                      // 原始形式
    category.replace(/-/g, '_'),                  // 将连字符替换为下划线
    category.split('-').map(capitalize).join('_') // 首字母大写并用下划线连接
  ];
  
  // 获取所有可能的分类
  const allCategories = await getAllCategories();
  
  // 查找匹配的分类
  const matchedCategory = allCategories.find(cat => 
    possibleDirectories.includes(cat) || 
    possibleDirectories.includes(cat.replace(/_/g, '-'))
  );
  
  if (!matchedCategory) {
    notFound();
  }
  
  // 获取匹配分类的文档
  const documents = await getDocumentsByCategory(matchedCategory);
  
  // 获取分类的显示名称
  const displayName = matchedCategory.replace(/_/g, ' ');
  
  let description = "";
  switch (matchedCategory) {
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
  
  return (
    <CategoryPage
      title={displayName}
      description={description}
      categoryPath={category}
      documents={documents}
      emptyMessage={`暂无${displayName}相关文档`}
    />
  );
}
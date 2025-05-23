import { getAllCategories, getDocumentsByCategory, getSubcategories } from "@/utils/docs";
import SubcategoryPage from "../../components/SubcategoryPage";
import { notFound } from "next/navigation";
import { capitalize, slugToTitle } from "@/utils/stringUtils";

interface PageProps {
  params: {
    category: string;
    subcategory: string;
  };
}

// 生成可能的静态路由参数
export async function generateStaticParams() {
  const categories = await getAllCategories();
  const params = [];

  for (const category of categories) {
    const subcategories = await getSubcategories(category);
    for (const subcategory of subcategories) {
      params.push({
        category: category.toLowerCase().replace(/_/g, '-'),
        subcategory: subcategory.toLowerCase().replace(/\s+/g, '-')
      });
    }
  }

  return params;
}

export default async function DynamicSubcategoryPage({ params }: PageProps) {
  // 添加安全检查，确保 params 和必要的属性存在
  if (!params || !params.category || !params.subcategory) {
    console.error("Missing required route parameters:", params);
    notFound();
  }
  
  const { category, subcategory } = params;
  
  // 将URL参数转换回可能的目录名称
  const possibleCategoryDirs = [
    category,
    category.replace(/-/g, '_'),
    category.split('-').map(capitalize).join('_')
  ];
  
  // 获取所有分类
  const allCategories = await getAllCategories();
  
  // 查找匹配的分类
  const matchedCategory = allCategories.find(cat => 
    possibleCategoryDirs.includes(cat) || 
    possibleCategoryDirs.includes(cat.replace(/_/g, '-'))
  );
  
  if (!matchedCategory) {
    notFound();
  }
  
  // 处理子类别名称
  const formattedSubcategory = slugToTitle(subcategory);
  
  // 获取所有文档
  const allDocs = await getDocumentsByCategory(matchedCategory);
  
  // 使用稳定的过滤条件
  const subcategoryDocs = allDocs.filter(doc => {
    if (!doc.subcategory) return false;
    
    const docSubLower = doc.subcategory.toLowerCase().trim();
    const formattedSubLower = formattedSubcategory.toLowerCase().trim();
    const paramSubLower = subcategory.toLowerCase().trim();
    
    // 精确匹配
    return docSubLower === formattedSubLower || 
           // 或匹配转换后的格式(空格替换为连字符)
           docSubLower.replace(/\s+/g, "-") === paramSubLower;
  });
  
  // 如果没有找到匹配的文档，返回404
  if (subcategoryDocs.length === 0) {
    notFound();
  }
  
  // 计算文档总字数（假设每篇文档平均500字）
  const estimatedTotalWords = subcategoryDocs.length * 500;
  
  return (
    <SubcategoryPage
      title={formattedSubcategory}
      description={`这里收集了与${formattedSubcategory}相关的所有文档，让多篇文档构成知识架构，方便查找与沉淀。`}
      categoryPath={category}
      subcategoryPath={subcategory}
      documents={subcategoryDocs}
      totalWords={estimatedTotalWords}
      emptyMessage={`暂无${formattedSubcategory}相关文档`}
    />
  );
}
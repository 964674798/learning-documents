import { getAllCategories, getSubcategories, getDocumentBySlug, getDocumentsByCategory } from "@/utils/docs";
import { notFound } from "next/navigation";
import { capitalize, slugToTitle } from "@/utils/stringUtils";
import MarkdownRenderer from "../../../components/MarkdownRenderer";
import Link from "next/link";

interface PageProps {
  params: {
    category: string;
    subcategory: string;
    slug: string;
  };
}

// 生成可能的静态路由参数
export async function generateStaticParams() {
  const categories = await getAllCategories();
  const params = [];

  for (const category of categories) {
    const subcategories = await getSubcategories(category);
    for (const subcategory of subcategories) {
      // 使用getDocumentsByCategory替代getDocumentBySlug
      const allDocs = await getDocumentsByCategory(category);
      
      // 过滤出当前子类别的文档
      const subcategoryDocs = allDocs.filter(doc => {
        const docSubLower = doc.subcategory.toLowerCase().trim();
        const subLower = subcategory.toLowerCase().trim();
        return docSubLower === subLower || 
               docSubLower.replace(/\s+/g, "-") === subLower.replace(/\s+/g, "-");
      });
      
      // 使用每个文档的slug生成参数
      for (const doc of subcategoryDocs) {
        params.push({
          category: category.toLowerCase().replace(/_/g, '-'),
          subcategory: subcategory.toLowerCase().replace(/\s+/g, '-'),
          slug: doc.slug
        });
      }
    }
  }

  return params;
}

export default async function DynamicDocumentPage({ params }: PageProps) {
  const { category, subcategory, slug } = params;
  
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
  
  // 获取文档内容
  const doc = await getDocumentBySlug(matchedCategory, formattedSubcategory, slug);
  
  if (!doc) {
    notFound();
  }
  
  // 返回上一级链接(子类别页面)
  const backLink = `/${category}/${subcategory}`;
  const backText = `返回${formattedSubcategory}`;
  
  // 直接使用MarkdownRenderer组件，不添加外层容器
  return (
    <MarkdownRenderer 
      title={doc.title} 
      date={doc.date || ''} 
      content={doc.content} 
      backLink={backLink}
      backText={backText}
    />
  );
}

// 箭头图标组件
function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

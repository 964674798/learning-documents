import { getDocumentsByCategory } from "@/utils/docs";
import CategoryPage from "../components/CategoryPage";

export default async function DailyLifePage() {
  // 从文件系统读取日常生活文档
  const docs = await getDocumentsByCategory('Daily_Life');
  
  return (
    <CategoryPage
      title="日常生活"
      description="这里记录了日常生活中的计划、财务和健康管理内容。"
      categoryPath="daily-life"
      documents={docs}
      emptyMessage="暂无日常生活文档"
    />
  );
} 
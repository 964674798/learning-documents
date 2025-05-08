import { getDocumentsByCategory } from "@/utils/docs";
import CategoryPage from "../components/CategoryPage";

export default async function TechLearningPage() {
  // 从文件系统读取技术学习文档
  const docs = await getDocumentsByCategory('Tech_Learning');
  
  return (
    <CategoryPage
      title="技术学习"
      description="这里包含各种编程语言和技术框架的学习笔记和总结。"
      categoryPath="tech-learning"
      documents={docs}
      emptyMessage="暂无技术学习文档"
    />
  );
} 
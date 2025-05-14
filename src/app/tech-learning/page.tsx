import { getDocumentsByCategory } from "@/utils/docs";
import CategoryPage from "../components/CategoryPage";

export default async function TechLearningPage() {
  // 从文件系统读取技术学习文档
  const docs = await getDocumentsByCategory('Tech_Learning');
  
  return (
    <CategoryPage
      title="技术学习"
      description="这里包含各种编程语言、技术框架和认证考试的学习资料。"
      categoryPath="tech-learning"
      documents={docs}
      emptyMessage="暂无技术学习文档"
    />
  );
} 
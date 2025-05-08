import { getDocumentsByCategory } from "@/utils/docs";
import CategoryPage from "../components/CategoryPage";

export default async function ReadingPage() {
  // 从文件系统读取阅读笔记
  const docs = await getDocumentsByCategory('Reading');
  
  return (
    <CategoryPage
      title="阅读笔记"
      description="这里收集了各类阅读资料的笔记和摘要，包括新闻、文章和书籍。"
      categoryPath="reading"
      documents={docs}
      emptyMessage="暂无阅读笔记"
    />
  );
} 
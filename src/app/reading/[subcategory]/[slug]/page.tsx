import { notFound } from "next/navigation";
import { getDocumentBySlug } from "@/utils/docs";
import MarkdownRenderer from "../../../components/MarkdownRenderer";

interface PageProps {
  params: Promise<{
    subcategory: string;
    slug: string;
  }>;
}

export default async function DocumentPage({ params }: PageProps) {
  // 使用await解析params对象
  const resolvedParams = await params;
  const { subcategory, slug } = resolvedParams;
  
  // 从文件系统读取文档数据
  const document = await getDocumentBySlug('Reading', subcategory, slug);
  
  // 如果文档不存在，返回404
  if (!document) {
    notFound();
  }
  
  return (
    <MarkdownRenderer
      title={document.title}
      date={document.date}
      content={document.content}
      backLink="/reading"
      backText="返回阅读笔记"
    />
  );
} 
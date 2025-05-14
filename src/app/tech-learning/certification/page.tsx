import { getDocumentsByCategory } from "@/utils/docs";
import CategoryPage from "../../components/CategoryPage";

export default async function CertificationPage() {
  // 获取证书相关文档
  const docs = await getDocumentsByCategory('Tech_Learning');
  
  // 过滤出Certification子类别的文档
  const certificationDocs = docs.filter(doc => doc.subcategory === 'Certification');
  
  return (
    <CategoryPage
      title="认证考试"
      description="项目管理和技术相关的认证资料与学习计划"
      categoryPath="tech-learning/certification"
      documents={certificationDocs}
      emptyMessage="暂无认证相关文档"
    />
  );
} 
import { notFound } from "next/navigation";
import MarkdownRenderer from "../../../components/MarkdownRenderer";
import fs from 'fs';
import path from 'path';

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
  
  console.log(`Accessing document with subcategory: ${subcategory}, slug: ${slug}`);
  
  // 定义文档路径
  const docsRoot = path.join(process.cwd(), 'Documents');
  const categoryPath = path.join(docsRoot, 'Tech_Learning', subcategory);
  
  let title = '';
  let content = '';
  let date = ''; // 默认为空字符串而不是undefined
  
  try {
    // 解码URL编码的slug
    const decodedSlug = decodeURIComponent(slug);
    console.log('Decoded slug:', decodedSlug);
    
    // 检查目录是否存在
    if (!fs.existsSync(categoryPath)) {
      console.log(`Directory does not exist: ${categoryPath}`);
      notFound();
      return;
    }
    
    // 获取目录中的所有文件
    const files = fs.readdirSync(categoryPath);
    console.log('Available files:', files);
    
    // 查找匹配的文件
    const matchingFile = files.find(file => {
      if (!file.endsWith('.md')) return false;
      
      const fileNameWithoutExt = path.basename(file, '.md');
      // 对比时忽略特殊字符和大小写
      const normalizedFileName = fileNameWithoutExt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const normalizedSlug = decodedSlug.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      
      return normalizedFileName === normalizedSlug || 
             normalizedFileName.includes(normalizedSlug) || 
             normalizedSlug.includes(normalizedFileName);
    });
    
    if (!matchingFile) {
      console.log('No matching file found for:', decodedSlug);
      notFound();
      return;
    }
    
    // 找到匹配的文件，读取内容
    const filePath = path.join(categoryPath, matchingFile);
    console.log('Looking for file:', filePath);
    console.log('File exists?', fs.existsSync(filePath));
    
    content = fs.readFileSync(filePath, 'utf8');
    
    // 从文件内容中提取标题
    const firstLine = content.split('\n')[0];
    title = path.basename(matchingFile, '.md');
    if (firstLine && firstLine.startsWith('# ')) {
      title = firstLine.substring(2).trim();
    }
    
    // 提取日期 - 如果文件名包含日期 (例如: 2023-01-01_文件名.md)
    const dateMatch = matchingFile.match(/^(\d{4}-\d{2}-\d{2})_/);
    if (dateMatch) {
      date = dateMatch[1];
    }
    
    // 移除内容中的第一个标题，避免重复
    content = content.split('\n').slice(1).join('\n').trim();
    
    console.log('Successfully loaded document:', title);
  } catch (error) {
    console.error('Error accessing file system:', error);
    notFound();
  }
  
  return (
    <MarkdownRenderer
      title={title}
      date={date}
      content={content}
      backLink="/tech-learning"
      backText="返回技术学习"
    />
  );
} 
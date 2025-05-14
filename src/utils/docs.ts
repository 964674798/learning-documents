import fs from 'fs';
import path from 'path';
import { cache } from 'react';

export interface DocInfo {
  slug: string;
  title: string;
  date?: string; // 使日期可选
  content: string;
  category: string;
  subcategory: string;
}

const DOCS_ROOT = path.join(process.cwd(), 'Documents');

// 使用React的cache函数来缓存结果
export const getDocumentsByCategory = cache(async (category: string): Promise<DocInfo[]> => {
  try {
    const categoryPath = path.join(DOCS_ROOT, category);
    if (!fs.existsSync(categoryPath)) {
      return [];
    }

    const subcategories = fs.readdirSync(categoryPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const allDocs: DocInfo[] = [];

    for (const subcategory of subcategories) {
      const subcategoryPath = path.join(categoryPath, subcategory);
      const files = fs.readdirSync(subcategoryPath)
        .filter(file => file.endsWith('.md'));

      for (const file of files) {
        const filePath = path.join(subcategoryPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 获取文件名（不带扩展名）
        const fileName = path.basename(file, '.md');
        let title = fileName;
        
        // 从文件内容中提取标题（假设第一行是# 标题格式）
        const firstLine = content.split('\n')[0];
        if (firstLine && firstLine.startsWith('# ')) {
          title = firstLine.substring(2).trim();
        }
        
        allDocs.push({
          slug: fileName,
          title,
          content,
          category,
          subcategory
        });
      }
    }

    return allDocs;

  } catch (error) {
    console.error(`Error reading documents from ${category}:`, error);
    return [];
  }
});

export const getDocumentBySlug = cache(async (category: string, subcategory: string, slug: string): Promise<DocInfo | null> => {
  try {
    const subcategoryPath = path.join(DOCS_ROOT, category, subcategory);
    
    // 处理可能被 URL 编码的 slug
    const decodedSlug = decodeURIComponent(slug);
    console.log('Getting document with slug:', slug);
    console.log('Decoded slug:', decodedSlug);
    
    // 尝试完全匹配slug.md
    let fileName = `${decodedSlug}.md`;
    let filePath = path.join(subcategoryPath, fileName);
    
    console.log('Looking for file:', filePath);
    console.log('File exists?', fs.existsSync(filePath));
    
    // 如果精确匹配的文件不存在，尝试模糊匹配
    if (!fs.existsSync(filePath)) {
      console.log('Exact match not found, trying fuzzy matching');
      const files = fs.readdirSync(subcategoryPath)
        .filter(file => file.endsWith('.md'));
      
      console.log('Available files:', files);
      
      // 尝试查找包含slug的文件名
      const matchingFile = files.find(file => {
        const fileNameLower = file.toLowerCase();
        const slugLower = decodedSlug.toLowerCase();
        const match = fileNameLower.includes(slugLower) || slugLower.includes(path.basename(file, '.md').toLowerCase());
        console.log(`Checking ${file} against ${decodedSlug}: ${match ? 'Match' : 'No match'}`);
        return match;
      });
      
      if (!matchingFile) {
        console.log('No matching file found');
        return null;
      }
      
      fileName = matchingFile;
      filePath = path.join(subcategoryPath, fileName);
      console.log('Found matching file:', fileName);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 获取文件名（不带扩展名）
    const fileNameWithoutExt = path.basename(fileName, '.md');
    let title = fileNameWithoutExt;
    
    // 从文件内容中提取标题
    const firstLine = content.split('\n')[0];
    if (firstLine && firstLine.startsWith('# ')) {
      title = firstLine.substring(2).trim();
    }
    
    console.log('Successfully loaded document:', title);
    
    return {
      slug: fileNameWithoutExt,
      title,
      content,
      category,
      subcategory
    };
    
  } catch (error) {
    console.error(`Error reading document ${slug} from ${category}/${subcategory}:`, error);
    return null;
  }
});

export const getAllCategories = cache(async (): Promise<string[]> => {
  try {
    return fs.readdirSync(DOCS_ROOT, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
  } catch (error) {
    console.error('Error reading categories:', error);
    return [];
  }
});

export const getSubcategories = cache(async (category: string): Promise<string[]> => {
  try {
    const categoryPath = path.join(DOCS_ROOT, category);
    if (!fs.existsSync(categoryPath)) {
      return [];
    }

    return fs.readdirSync(categoryPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
  } catch (error) {
    console.error(`Error reading subcategories from ${category}:`, error);
    return [];
  }
}); 
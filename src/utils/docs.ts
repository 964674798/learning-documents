import fs from 'fs';
import path from 'path';
import { cache } from 'react';

export interface DocInfo {
  slug: string;
  title: string;
  date: string;
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
        
        // 从文件名解析信息，格式: 日期_功能_小分类_大分类.md
        const fileName = path.basename(file, '.md');
        const parts = fileName.split('_');
        
        if (parts.length >= 2) {
          const date = parts[0]; // 日期
          const title = parts.length >= 3 ? parts[2] : parts[1]; // 标题
          
          allDocs.push({
            slug: fileName,
            title,
            date,
            content,
            category,
            subcategory
          });
        }
      }
    }

    // 按日期倒序排列
    return allDocs.sort((a, b) => b.date.localeCompare(a.date));

  } catch (error) {
    console.error(`Error reading documents from ${category}:`, error);
    return [];
  }
});

export const getDocumentBySlug = cache(async (category: string, subcategory: string, slug: string): Promise<DocInfo | null> => {
  try {
    const subcategoryPath = path.join(DOCS_ROOT, category, subcategory);
    
    // 寻找匹配slug的文件
    const files = fs.readdirSync(subcategoryPath)
      .filter(file => file.startsWith(slug) && file.endsWith('.md'));
    
    if (files.length === 0) {
      return null;
    }
    
    const filePath = path.join(subcategoryPath, files[0]);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 从文件名解析信息
    const fileName = path.basename(files[0], '.md');
    const parts = fileName.split('_');
    
    if (parts.length >= 2) {
      const date = parts[0]; // 日期
      const title = parts.length >= 3 ? parts[2] : parts[1]; // 标题
      
      return {
        slug: fileName,
        title,
        date,
        content,
        category,
        subcategory
      };
    }
    
    return null;
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
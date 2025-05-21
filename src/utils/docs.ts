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

// 添加新接口，用于仅包含元数据而不包含完整内容
export interface DocMetadata {
  slug: string;
  title: string;
  date?: string;
  category: string;
  subcategory: string;
  filePath: string; // 存储文件路径以便后续按需加载内容
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
    
    // 尝试完全匹配slug.md
    let fileName = `${decodedSlug}.md`;
    let filePath = path.join(subcategoryPath, fileName);
    
    // 如果精确匹配的文件不存在，尝试高效模糊匹配
    if (!fs.existsSync(filePath)) {
      // 只读取目录内容一次
      const files = fs.readdirSync(subcategoryPath)
        .filter(file => file.endsWith('.md'));
      
      // 改进的匹配逻辑 - 首先尝试更精确的匹配
      // 1. 尝试文件名前缀匹配
      const prefixMatches = files.filter(file => 
        file.toLowerCase().startsWith(decodedSlug.toLowerCase())
      );
      
      if (prefixMatches.length > 0) {
        // 使用第一个前缀匹配
        fileName = prefixMatches[0];
      } else {
        // 2. 尝试包含匹配，但限制搜索范围
        for (const file of files) {
          const fileNameLower = path.basename(file, '.md').toLowerCase();
          const slugLower = decodedSlug.toLowerCase();
          
          // 如果文件名包含slug或slug包含文件名，则匹配成功
          if (fileNameLower.includes(slugLower) || slugLower.includes(fileNameLower)) {
            fileName = file;
            break; // 找到第一个匹配项后立即退出循环
          }
        }
      }
      
      // 如果仍未找到匹配，返回null
      if (fileName === `${decodedSlug}.md`) {
        return null;
      }
      
      filePath = path.join(subcategoryPath, fileName);
    }
    
    // 异步读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 获取文件名（不带扩展名）
    const fileNameWithoutExt = path.basename(fileName, '.md');
    let title = fileNameWithoutExt;
    
    // 从文件内容中提取标题
    const firstLine = content.split('\n')[0];
    if (firstLine && firstLine.startsWith('# ')) {
      title = firstLine.substring(2).trim();
    }
    
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

// 优化后的函数 - 只加载元数据而不是完整内容
export const getDocumentsByCategory = cache(async (category: string, loadFullContent: boolean = false): Promise<DocInfo[] | DocMetadata[]> => {
  try {
    const categoryPath = path.join(DOCS_ROOT, category);
    if (!fs.existsSync(categoryPath)) {
      return [];
    }

    const subcategories = fs.readdirSync(categoryPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const allDocs: (DocInfo | DocMetadata)[] = [];

    for (const subcategory of subcategories) {
      const subcategoryPath = path.join(categoryPath, subcategory);
      const files = fs.readdirSync(subcategoryPath)
        .filter(file => file.endsWith('.md'));

      for (const file of files) {
        const filePath = path.join(subcategoryPath, file);
        const fileName = path.basename(file, '.md');
        
        // 尝试从文件名提取日期 (假设格式为 YYYY-MM-DD_其他内容)
        let date: string | undefined;
        const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})_/);
        if (dateMatch) {
          date = dateMatch[1];
        }
        
        if (loadFullContent) {
          // 只在需要时加载完整内容
          const content = fs.readFileSync(filePath, 'utf8');
          
          // 从文件内容中提取标题（假设第一行是# 标题格式）
          let title = fileName;
          const firstLine = content.split('\n')[0];
          if (firstLine && firstLine.startsWith('# ')) {
            title = firstLine.substring(2).trim();
          }
          
          allDocs.push({
            slug: fileName,
            title,
            date,
            content,
            category,
            subcategory
          });
        } else {
          // 仅加载元数据 - 快速读取文件的前几行以获取标题
          let title = fileName;
          try {
            // 只读取文件的第一行以提取标题
            const firstLine = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' })
              .split('\n')[0];
            
            if (firstLine && firstLine.startsWith('# ')) {
              title = firstLine.substring(2).trim();
            }
          } catch (err) {
            // 如果读取失败，使用文件名作为标题
          }
          
          allDocs.push({
            slug: fileName,
            title,
            date,
            category,
            subcategory,
            filePath // 存储路径以便后续按需加载
          } as DocMetadata);
        }
      }
    }

    return allDocs;

  } catch (error) {
    console.error(`Error reading documents from ${category}:`, error);
    return [];
  }
});

// 新增函数 - 按需加载文档内容
export const loadDocumentContent = cache(async (metadata: DocMetadata): Promise<DocInfo> => {
  try {
    const content = fs.readFileSync(metadata.filePath, 'utf8');
    
    return {
      ...metadata,
      content
    };
  } catch (error) {
    console.error(`Error loading content for ${metadata.slug}:`, error);
    return {
      ...metadata,
      content: '加载内容时出错'
    };
  }
});
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const docsRoot = path.join(process.cwd(), 'Documents');
  const certPath = path.join(docsRoot, 'Tech_Learning', 'Certification');
  
  try {
    // 列出目录内容
    const files = fs.readdirSync(certPath);
    
    // 检查特定文件是否存在
    const fileChecks = files.map(file => {
      const filePath = path.join(certPath, file);
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8').substring(0, 100) + '...';
      
      return {
        fileName: file,
        exists: fs.existsSync(filePath),
        isFile: stats.isFile(),
        size: stats.size,
        content: content
      };
    });
    
    // 查找PMP认证文档.md
    const targetFile = 'PMP认证文档.md';
    const targetPath = path.join(certPath, targetFile);
    const targetExists = fs.existsSync(targetPath);
    
    return NextResponse.json({
      certPath,
      files,
      fileChecks,
      targetFile,
      targetExists
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 
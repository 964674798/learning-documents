import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

const DocumentRenderer = dynamic(() => import("../../../components/DocumentRenderer"), {
  ssr: true
});

interface PageProps {
  params: {
    slug: string;
  };
}

interface DocContent {
  title: string;
  date: string;
  content: string;
}

// 模拟的文档数据
const docData: Record<string, DocContent> = {
  "2023-10-12": {
    title: "状态管理",
    date: "2023-10-12",
    content: `
# 状态管理

## What
React 状态管理是指在 React 应用中管理和维护组件状态的方法和工具。状态是组件渲染和行为的核心，包括用户输入、服务器响应、本地缓存等数据。

## Why
- **组件间共享数据**：不同组件可能需要访问和修改相同的数据
- **状态同步**：确保UI与应用状态一致
- **复杂度管理**：随着应用规模增长，状态管理变得越来越复杂
- **性能优化**：减少不必要的渲染

## When to Use
- 当多个组件需要共享状态时
- 当状态逻辑变得复杂时
- 当应用规模扩大，需要更结构化的状态管理时
- 当需要实现时间旅行调试、状态持久化等高级功能时

## 常见的状态管理解决方案

### Context + useReducer
适合中小型应用，利用 React 内置功能实现状态管理。

### Redux
最流行的状态管理库之一，基于单一数据源和纯函数reducer的原则。

### MobX
通过可观察对象和自动追踪依赖实现响应式状态管理。

### Zustand
轻量级状态管理库，API简单且易于使用。

### Recoil
Facebook开发的实验性状态管理库，专为React优化。

### Jotai
原子化状态管理，非常适合细粒度状态更新。
`
  }
};

export default function DocumentPage({ params }: PageProps) {
  const { slug } = params;
  
  // 检查文档是否存在
  if (!docData[slug]) {
    notFound();
  }
  
  const document = docData[slug];
  
  return (
    <DocumentRenderer
      title={document.title}
      date={document.date}
      content={document.content}
      backLink="/tech-learning"
      backText="返回技术学习"
    />
  );
} 
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 启用服务器端组件
  reactStrictMode: true,
  // 配置允许读取文件系统
  experimental: {
    serverComponentsExternalPackages: ['fs', 'path'],
  },
  // 优化输出
  output: 'standalone',
};

export default nextConfig;

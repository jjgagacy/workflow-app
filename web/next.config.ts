import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 指定React严格模式
  reactStrictMode: true,
  // 是否生成源映射（生产环境）
  productionBrowserSourceMaps: false,
  // 配置页面扩展名
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // 自定义构建目录（默认.next）
  distDir: 'build',
  // 静态资源前缀（CDN支持）
  // assetPrefix: 'https://cdn.example.com',
  // 基础路径（适用于部署在子路径）
  basePath: '',
  experimental: {
  },

  images: {
    domains: ['images.unsplash.com'],
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })
    return config
  },

  async redirects() {
    return [
      {
        source: '/old-blog/:slug',
        destination: '/news/:slug',
        permanent: true,
      }
    ]
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      }
    ]
  }
};

export default nextConfig;

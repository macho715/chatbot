/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  output: 'standalone',
  experimental: {
    forceSwcTransforms: false,
  },
  // CSS 최적화 설정
  webpack: (config, { isServer, dev }) => {
    // React 17 JSX 변환 지원
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/jsx-runtime': 'react/jsx-runtime.js',
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
    };
    
    // CSS 로딩 최적화
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@swc/helpers': false,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  // CSS 최적화
  optimizeFonts: true,
  compress: true,
}

module.exports = nextConfig 
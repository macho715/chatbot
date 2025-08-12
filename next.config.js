/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // React 17 호환성을 위해 비활성화
  swcMinify: false,
  output: 'standalone', // Docker support
  experimental: {
    forceSwcTransforms: false,
  },
  // React 17 JSX 변환 호환성 강화
  webpack: (config, { isServer }) => {
    // React 17 JSX 변환 지원
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/jsx-runtime': 'react/jsx-runtime.js',
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
      'react/jsx-runtime.js': 'react/jsx-runtime.js',
      'react/jsx-dev-runtime.js': 'react/jsx-dev-runtime.js',
    };
    
    // SWC 관련 모듈 오류 방지
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@swc/helpers': false,
    };

    // React 17 호환성을 위한 설정
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
}

module.exports = nextConfig 
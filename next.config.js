// PWA 플러그인 임시 비활성화 - JSX 런타임 충돌 해결용
// const withPWA = require('next-pwa')({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development'
// })

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    forceSwcTransforms: true,  // SWC 변환 강제 활성화
  },
  // swcMinify: true,  // Next.js 15에서 제거됨
  // JSX 런타임 명시적 설정
  compiler: {
    reactRemoveProperties: false,
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 에러 리포팅 강화
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // 개발 모드 안정성
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
}

module.exports = nextConfig  // withPWA 제거 
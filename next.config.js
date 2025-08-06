/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  output: 'standalone', // Docker support
  experimental: {
    forceSwcTransforms: false,
  },
}

module.exports = nextConfig 
const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output file tracing root to fix lockfile detection warning
  outputFileTracingRoot: path.join(__dirname, './'),
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [],
    unoptimized: false,
  },
  // Ensure Prisma Client is included in build
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client')
    }
    return config
  },
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/streaks-dashboard' : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
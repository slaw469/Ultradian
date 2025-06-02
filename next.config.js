/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure we're not using static export since we need API routes
  output: 'standalone'
};

module.exports = nextConfig;
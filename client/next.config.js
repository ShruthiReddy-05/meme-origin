/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: process.env.NODE_ENV === 'development' ? 'http' : 'https',
        hostname: process.env.NODE_ENV === 'development' ? 'localhost' : process.env.NEXT_PUBLIC_API_HOST || 'your-production-api-domain.com',
        port: process.env.NODE_ENV === 'development' ? '3001' : '',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig; 
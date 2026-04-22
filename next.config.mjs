/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    /** Allow quality used by next/image (default config is [75] only in Next 15+) */
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '10000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '10000',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;

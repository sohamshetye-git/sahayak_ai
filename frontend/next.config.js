/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript errors during build
  },
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  
  // Optimize build performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Skip source maps for faster builds
  productionBrowserSourceMaps: false,
  
  // Disable Vercel branding and analytics
  analytics: false,
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    DISABLE_VERCEL_BRANDING: 'true',
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };
    
    return config;
  },
  
  // Custom headers to prevent Vercel branding injection
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Powered-By',
            value: 'Sahayak AI',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

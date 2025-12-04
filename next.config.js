/** @type {import('next').NextConfig} */
const config = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Experimental features for faster compilation
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      '@mantine/core',
      '@mantine/hooks',
      'date-fns',
      'react-big-calendar',
      '@blocknote/core',
      '@blocknote/react',
      '@blocknote/mantine',
    ],
    // Use SWC for faster compilation
    swcPlugins: [],
    // Optimize CSS
    optimizeCss: true,
    // Turbo mode for faster builds
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Transpile specific heavy packages
  transpilePackages: [
    '@blocknote/core',
    '@blocknote/react',
    '@blocknote/mantine',
    'react-big-calendar',
  ],

  // Turbopack configuration (Next.js 16+ default bundler)
  turbopack: {
    // Turbopack handles most optimizations automatically
    // and is significantly faster than webpack
    resolveAlias: {
      // Add any module aliases if needed
    },
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
};

module.exports = config;

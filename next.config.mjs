/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  basePath: '/meridian',
  serverExternalPackages: ['better-sqlite3'],
  webpack: (config) => {
    config.externals.push({
      'better-sqlite3': 'commonjs better-sqlite3',
    });
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  async redirects() {
    const redirects = [];

    if (process.env.OPENCLAW_ENABLE_OFFICE_3D !== '1') {
      redirects.push({
        source: '/office/3d',
        destination: '/office',
        permanent: false,
      });
    }

    if (process.env.OPENCLAW_ENABLE_VIBE !== '1') {
      redirects.push({
        source: '/vibe',
        destination: '/kanban',
        permanent: false,
      });
    }

    return redirects;
  },
};

export default nextConfig;

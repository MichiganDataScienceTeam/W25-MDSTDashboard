/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',
  reactStrictMode: true,
  // Disable type checking during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow transpilation of node_modules
  transpilePackages: ["@supabase/ssr"],
  // Required for Supabase Auth
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://accounts.google.com"
          }
        ]
      }
    ]
  },
};

module.exports = nextConfig;

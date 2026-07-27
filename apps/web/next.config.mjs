/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },

  // Proxy /api/v1/* → NestJS API
  // Browser always calls same origin (no CORS, no localhost problem on mobile)
  // Next.js server forwards to the internal API address (server-to-server)
  async rewrites() {
    const apiUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:3001'
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig

import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.pexels.com' }],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // envoi de photos depuis le back-office (redimensionnées côté serveur)
    serverActions: { bodySizeLimit: '12mb' },
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // le back-office ne doit jamais être indexé ni mis en cache partagé
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-store' }] },
    ];
  },
};

export default nextConfig;

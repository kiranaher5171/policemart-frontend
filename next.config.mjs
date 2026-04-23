/**
 * Hostnames allowed for next/image. Strapi may return absolute URLs whose host
 * differs from STRAPI_URL (e.g. S3, CDN, or PUBLIC_URL on Strapi ≠ Vercel build env).
 * Set NEXT_PUBLIC_STRAPI_URL (and NEXT_PUBLIC_MEDIA_HOSTS) on Vercel for **Production**
 * so builds include the right hosts.
 */
function collectImageRemoteHosts() {
  const blobs = [
    process.env.NEXT_PUBLIC_STRAPI_URL,
    process.env.STRAPI_URL,
    process.env.STRAPI_URL_REMOTE,
    process.env.NEXT_PUBLIC_MEDIA_HOSTS,
    process.env.NEXT_PUBLIC_S3_MEDIA_HOST,
    process.env.NEXT_PUBLIC_MEDIA_HOST,
  ]
  const hosts = new Set()

  const addFromRaw = (raw) => {
    if (!raw || typeof raw !== 'string') return
    const trimmed = raw.trim()
    if (!trimmed) return
    try {
      const host = new URL(trimmed.replace(/\/api\/?$/i, '')).hostname
      if (host) hosts.add(host)
    } catch {
      /* ignore invalid URL */
    }
  }

  for (const blob of blobs) {
    if (!blob) continue
    for (const part of blob.split(',')) {
      addFromRaw(part)
    }
  }

  if (hosts.size === 0) {
    hosts.add('policemart-backend.onrender.com')
  }

  return [...hosts]
}

const imageHosts = collectImageRemoteHosts()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    /** Must list every `quality` passed to next/image (BlogCard uses 100). */
    qualities: [100, 75, 90],
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
      ...imageHosts.map((hostname) => ({
        protocol: 'https',
        hostname,
        /** Strapi + S3/CDN paths; `/uploads/**` alone misses many absolute media URLs */
        pathname: '/**',
      })),
    ],
  },
}

export default nextConfig

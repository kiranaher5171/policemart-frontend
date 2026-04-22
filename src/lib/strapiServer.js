import { normalizeStrapiMediaList, pickStrapiMediaPath } from '@/lib/strapiMedia'

/**
 * Newest first by publishedAt, then updatedAt, then createdAt.
 * @param {Array<Record<string, unknown>>} rows
 * @returns {Array<Record<string, unknown>>}
 */
function sortBlogsNewestFirst(rows) {
  if (!Array.isArray(rows)) return []
  return [...rows].sort((a, b) => {
    const ta = Date.parse(String(a?.publishedAt || a?.updatedAt || a?.createdAt || 0)) || 0
    const tb = Date.parse(String(b?.publishedAt || b?.updatedAt || b?.createdAt || 0)) || 0
    return tb - ta
  })
}

/**
 * Strapi base URL for server-side fetches (Server Components, Route Handlers).
 * Set STRAPI_URL in frontend/.env.local (e.g. http://localhost:10000).
 */
export function getStrapiBaseUrl() {
  const raw = process.env.STRAPI_URL || 'http://localhost:10000'
  return raw.replace(/\/$/, '')
}

/**
 * Absolute cover URL for next/image, or undefined to use a local fallback.
 * @param {Record<string, unknown> | undefined} blog
 */
export function resolveStrapiBlogCoverUrl(blog) {
  if (!blog) return undefined
  const images = normalizeStrapiMediaList(blog.image)
  if (images.length === 0) return undefined
  const path = pickStrapiMediaPath(images[0])
  if (!path) return undefined
  const base = getStrapiBaseUrl()
  if (path.startsWith('http')) return path
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function fetchStrapiBlogs() {
  const base = getStrapiBaseUrl()
  /* populate=* pulls media relations; shallow populate=image can omit files on some Strapi versions */
  const params = new URLSearchParams()
  params.set('populate', '*')
  params.set('sort', 'publishedAt:desc')
  const url = `${base}/api/blogs?${params.toString()}`

  const headers = { Accept: 'application/json' }
  if (process.env.STRAPI_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.STRAPI_API_TOKEN}`
  }

  try {
    const res = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const json = await res.json()
    const rows = json?.data
    return sortBlogsNewestFirst(Array.isArray(rows) ? rows : [])
  } catch {
    return []
  }
}

/**
 * @param {Record<string, unknown> | undefined} blog
 * @returns {string}
 */
function blogRowKey(blog) {
  if (!blog || typeof blog !== 'object') return ''
  const id = blog.documentId ?? blog.id ?? blog.slug
  return id != null ? String(id) : ''
}

/**
 * Latest blogs (newest first), optionally excluding one slug (e.g. current post).
 * When `category` is set, same-category posts are returned first; the list is filled
 * up to `limit` with other recent posts if needed.
 * @param {{ excludeSlug?: string, limit?: number, category?: string }} [opts]
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function fetchStrapiLatestBlogs(opts = {}) {
  const { excludeSlug, limit = 4, category } = opts
  const cat = typeof category === 'string' ? category.trim() : ''
  const base = getStrapiBaseUrl()

  const headers = { Accept: 'application/json' }
  if (process.env.STRAPI_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.STRAPI_API_TOKEN}`
  }

  /**
   * @param {{ pageLimit: number, categoryEq?: string }} q
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  async function fetchPage(q) {
    const params = new URLSearchParams()
    params.set('populate', '*')
    params.set('sort', 'publishedAt:desc')
    params.set('pagination[limit]', String(q.pageLimit))
    if (excludeSlug) params.set('filters[slug][$ne]', excludeSlug)
    if (q.categoryEq) params.set('filters[category][$eq]', q.categoryEq)
    const url = `${base}/api/blogs?${params.toString()}`
    try {
      const res = await fetch(url, { headers, next: { revalidate: 60 } })
      if (!res.ok) return []
      const json = await res.json()
      const rows = json?.data
      return sortBlogsNewestFirst(Array.isArray(rows) ? rows : [])
    } catch {
      return []
    }
  }

  const picked = []
  const seen = new Set()

  const pushUnique = (rows) => {
    for (const row of rows) {
      const key = blogRowKey(row)
      if (!key || seen.has(key)) continue
      seen.add(key)
      picked.push(row)
      if (picked.length >= limit) break
    }
  }

  try {
    if (cat) {
      const sameCategory = await fetchPage({ pageLimit: limit, categoryEq: cat })
      pushUnique(sameCategory)
    }

    if (picked.length < limit) {
      const pool = await fetchPage({ pageLimit: Math.max(limit * 4, 24) })
      pushUnique(pool)
    }

    return picked.slice(0, limit)
  } catch {
    return []
  }
}

/**
 * @param {string} slug
 * @returns {Promise<Record<string, unknown> | null>}
 */
export async function fetchStrapiBlogBySlug(slug) {
  const base = getStrapiBaseUrl()
  const url = `${base}/api/blogs?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`

  const headers = { Accept: 'application/json' }
  if (process.env.STRAPI_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.STRAPI_API_TOKEN}`
  }

  try {
    const res = await fetch(url, { headers, next: { revalidate: 60 } })
    if (!res.ok) return null
    const json = await res.json()
    const rows = json?.data
    if (!Array.isArray(rows) || rows.length === 0) return null
    return rows[0]
  } catch {
    return null
  }
}

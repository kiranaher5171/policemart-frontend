import { normalizeStrapiMediaList, pickStrapiMediaPath } from '@/lib/strapiMedia'

/**
 * Flatten Strapi v4 REST rows (`{ id, attributes }`) or pass through v5 flat documents.
 * @param {Record<string, unknown> | null | undefined} row
 * @returns {Record<string, unknown> | null}
 */
export function normalizeStrapiDocument(row) {
  if (!row || typeof row !== 'object') return null
  if ('attributes' in row && row.attributes && typeof row.attributes === 'object') {
    const attrs = /** @type {Record<string, unknown>} */ (row.attributes)
    return {
      ...attrs,
      ...(row.id != null ? { id: row.id } : {}),
      ...(row.documentId != null ? { documentId: row.documentId } : {}),
    }
  }
  return /** @type {Record<string, unknown>} */ (row)
}

/**
 * Strapi list/detail `data` may be an array or a single object.
 * @param {unknown} data
 * @returns {Array<Record<string, unknown>>}
 */
function strapiDataToRows(data) {
  if (Array.isArray(data)) return /** @type {Array<Record<string, unknown>>} */ (data.filter(Boolean))
  if (data && typeof data === 'object') return [/** @type {Record<string, unknown>} */ (data)]
  return []
}

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
 * Pick Strapi origin from env. Supports two backends via STRAPI_USE:
 * - STRAPI_USE=local  → STRAPI_URL_LOCAL, else STRAPI_URL, else http://localhost:10000
 * - STRAPI_USE=remote → STRAPI_URL_REMOTE, else STRAPI_URL
 * If STRAPI_USE is unset, STRAPI_URL is used (backward compatible).
 * Optional: NEXT_PUBLIC_STRAPI_URL (same origin, no /api) if you only set public env on Vercel.
 *
 * Use the site origin only (no /api): e.g. https://policemart-backend.onrender.com
 * A trailing `/api` is stripped so fetches stay `${base}/api/...` and never `/api/api/...`.
 */
export function getStrapiBaseUrl() {
  const use = String(process.env.STRAPI_USE || '')
    .trim()
    .toLowerCase()

  const publicFallback = process.env.NEXT_PUBLIC_STRAPI_URL || ''

  let raw = ''
  if (use === 'local') {
    raw = process.env.STRAPI_URL_LOCAL || process.env.STRAPI_URL || publicFallback
  } else if (use === 'remote' || use === 'production' || use === 'render') {
    raw = process.env.STRAPI_URL_REMOTE || process.env.STRAPI_URL || publicFallback
  } else {
    raw = process.env.STRAPI_URL || publicFallback
  }

  if (!raw) {
    const isProd =
      process.env.NODE_ENV === 'production' ||
      process.env.VERCEL === '1' ||
      process.env.VERCEL_ENV === 'production'
    if (isProd) {
      throw new Error(
        'Missing Strapi URL: set STRAPI_URL or NEXT_PUBLIC_STRAPI_URL (and optionally STRAPI_URL_REMOTE) on Vercel.',
      )
    }
    raw = 'http://localhost:10000'
  }

  let base = raw.replace(/\/$/, '')
  base = base.replace(/\/api\/?$/i, '')
  return base
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
    const rows = strapiDataToRows(json?.data)
      .map((r) => normalizeStrapiDocument(r))
      .filter((r) => r && typeof r === 'object')
    return sortBlogsNewestFirst(rows)
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
      const rows = strapiDataToRows(json?.data)
        .map((r) => normalizeStrapiDocument(r))
        .filter((r) => r && typeof r === 'object')
      return sortBlogsNewestFirst(rows)
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
    const rows = strapiDataToRows(json?.data)
    const first = rows[0]
    return first ? normalizeStrapiDocument(first) : null
  } catch {
    return null
  }
}

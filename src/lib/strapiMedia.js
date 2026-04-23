/**
 * Strapi media helpers (no Node env — safe for Client Components).
 */

/**
 * @param {unknown} imageField
 * @returns {Array<Record<string, unknown>>}
 */
export function normalizeStrapiMediaList(imageField) {
  if (!imageField) return []
  if (Array.isArray(imageField)) return imageField.filter((x) => x && typeof x === 'object')
  if (typeof imageField === 'object' && imageField !== null && 'data' in imageField) {
    const d = /** @type {{ data?: unknown }} */ (imageField).data
    if (Array.isArray(d)) return d.filter((x) => x && typeof x === 'object')
    if (d && typeof d === 'object') return [/** @type {Record<string, unknown>} */ (d)]
    return []
  }
  // Single populated media (Strapi v5) — not wrapped in `data` or an array
  if (typeof imageField === 'object' && imageField !== null) {
    const o = /** @type {Record<string, unknown>} */ (imageField)
    if (typeof o.url === 'string' || (o.formats && typeof o.formats === 'object')) {
      return [o]
    }
  }
  return []
}

/**
 * @param {Record<string, unknown>} entry
 */
export function unwrapMedia(entry) {
  const attrs = entry.attributes
  if (attrs && typeof attrs === 'object') return /** @type {Record<string, unknown>} */ (attrs)
  return entry
}

/**
 * @param {Record<string, unknown> | undefined} media
 * @returns {string | undefined}
 */
export function pickStrapiMediaPath(media) {
  const m = media ? unwrapMedia(media) : undefined
  if (!m || typeof m !== 'object') return undefined
  const formats = m.formats
  if (formats && typeof formats === 'object') {
    const order = ['large', 'medium', 'small']
    for (const key of order) {
      const f = formats[key]
      if (f && typeof f === 'object' && typeof f.url === 'string') return f.url
    }
  }
  // Prefer master file before thumbnail: derivatives are often missing on ephemeral disks (e.g. Render)
  // while the original URL still exists or points to durable storage.
  if (typeof m.url === 'string' && m.url) return m.url
  if (formats && typeof formats === 'object') {
    const thumb = formats.thumbnail
    if (thumb && typeof thumb === 'object' && typeof thumb.url === 'string') return thumb.url
  }
  return undefined
}

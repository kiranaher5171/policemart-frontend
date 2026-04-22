import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Box, Container, Grid, Typography, Button } from '@mui/material'
import HeaderFooterLayout from '@/components/layout/HeaderFooterLayout/HeaderFooterLayout'
import { fetchStrapiBlogBySlug, fetchStrapiLatestBlogs, resolveStrapiBlogCoverUrl } from '@/lib/strapiServer'
import { normalizeStrapiMediaList, unwrapMedia } from '@/lib/strapiMedia'
import BlogCard from '../BlogCard'
import { MdKeyboardArrowLeft } from 'react-icons/md'

/**
 * Plain text only (no trim) — used to detect truly empty blocks.
 * @param {unknown} children
 * @returns {string}
 */
function textFromStrapiChildren(children) {
  if (!Array.isArray(children)) return ''
  return children
    .map((node) => {
      if (node && typeof node === 'object' && typeof node.text === 'string') return node.text
      if (node && typeof node === 'object' && Array.isArray(node.children)) {
        return textFromStrapiChildren(node.children)
      }
      return ''
    })
    .join('')
}

/**
 * @param {unknown} children
 * @returns {boolean}
 */
function strapiBlockChildrenAreEmpty(children) {
  return textFromStrapiChildren(children).length === 0
}

/**
 * Strapi blocks inline leaf (bold, italic, underline, strikethrough, code) + nested links.
 * @param {Record<string, unknown>} node
 * @param {string} k
 */
function renderStrapiTextLeaf(node, k) {
  const text = typeof node.text === 'string' ? node.text : ''
  /** @type {React.ReactNode} */
  let el = text
  if (node.code === true) el = <code>{text}</code>
  if (node.strikethrough === true || node.strike === true) el = <s>{el}</s>
  if (node.underline === true) el = <u>{el}</u>
  if (node.italic === true) el = <em>{el}</em>
  if (node.bold === true) el = <strong>{el}</strong>
  return <React.Fragment key={k}>{el}</React.Fragment>
}

/**
 * @param {unknown} children
 * @param {string} keyPrefix
 * @returns {React.ReactNode[]}
 */
function renderStrapiRichChildren(children, keyPrefix) {
  if (!Array.isArray(children)) return []
  return children
    .map((node, idx) => {
      const k = `${keyPrefix}-${idx}`
      if (!node || typeof node !== 'object') return null

      if (node.type === 'text') {
        const text = typeof node.text === 'string' ? node.text : ''
        const hasMark =
          node.bold === true ||
          node.italic === true ||
          node.underline === true ||
          node.strikethrough === true ||
          node.strike === true ||
          node.code === true
        if (text === '' && !hasMark) return null
        return renderStrapiTextLeaf(node, k)
      }

      if (node.type === 'link') {
        const url =
          (typeof node.url === 'string' && node.url) ||
          (typeof node.href === 'string' && node.href) ||
          ''
        const inner = renderStrapiRichChildren(node.children, `${k}-lnk`)
        return (
          <a key={k} href={url || '#'} target="_blank" rel="noopener noreferrer">
            {inner}
          </a>
        )
      }

      if (Array.isArray(node.children)) {
        return (
          <React.Fragment key={k}>{renderStrapiRichChildren(node.children, `${k}-c`)}</React.Fragment>
        )
      }

      return null
    })
    .filter(Boolean)
}

/**
 * @param {Record<string, unknown>} block
 * @returns {Array<{ children: unknown[] }>}
 */
function strapiListItemChildrenFromBlock(block) {
  if (!block || block.type !== 'list' || !Array.isArray(block.children)) return []
  const items = []
  for (const child of block.children) {
    if (child && typeof child === 'object' && child.type === 'list-item' && Array.isArray(child.children)) {
      if (strapiBlockChildrenAreEmpty(child.children)) continue
      items.push({ children: child.children })
    }
  }
  return items
}

/**
 * Strapi list block → ordered vs bullets (handles alternate format strings).
 * @param {Record<string, unknown>} block
 * @returns {'ordered' | 'unordered'}
 */
function strapiListFormat(block) {
  const f = block.format
  if (f === 'ordered' || f === 'number' || f === 'numbered' || f === 'order') return 'ordered'
  return 'unordered'
}

/**
 * Strapi rich-text blocks → ordered parts (paragraphs + lists) for JSX.
 * Consecutive lists with the same format merge into one list.
 * Preserves spaces; inline marks rendered in the UI.
 * @param {unknown} blocks
 * @returns {Array<{ type: 'paragraph'; children: unknown[] } | { type: 'list'; format: 'ordered' | 'unordered'; items: Array<{ children: unknown[] }> }>}
 */
function strapiDescriptionToContentParts(blocks) {
  if (!Array.isArray(blocks)) return []

  /** @type {Array<{ type: 'paragraph'; children: unknown[] } | { type: 'list'; format: 'ordered' | 'unordered'; items: Array<{ children: unknown[] }> }>} */
  const parts = []

  for (const block of blocks) {
    if (!block || typeof block !== 'object') continue

    if (block.type === 'paragraph') {
      const ch = block.children
      if (!Array.isArray(ch) || strapiBlockChildrenAreEmpty(ch)) continue
      parts.push({ type: 'paragraph', children: ch })
      continue
    }

    if (block.type === 'list') {
      const format = strapiListFormat(block)
      const items = strapiListItemChildrenFromBlock(block)
      if (items.length === 0) continue
      const last = parts[parts.length - 1]
      if (last && last.type === 'list' && last.format === format) {
        last.items.push(...items)
      } else {
        parts.push({ type: 'list', format, items })
      }
    }
  }

  return parts
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const blog = await fetchStrapiBlogBySlug(slug)

  if (!blog) {
    return (
      <HeaderFooterLayout>
        <Container maxWidth="md" sx={{ pt: '100px', pb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Post not found
          </Typography>
          <Link href="/blogs">Back to blogs</Link>
        </Container>
      </HeaderFooterLayout>
    )
  }

  const title = blog.title ?? 'Blog'
  const category = blog.category ?? ''
  const latestBlogs = await fetchStrapiLatestBlogs({
    excludeSlug: slug,
    limit: 4,
    category: typeof category === 'string' ? category : '',
  })
  const recommendedTitle =
    typeof category === 'string' && category.trim()
      ? `Recommended in ${category.trim()}`
      : 'Recommended latest blogs'
  const coverUrl = resolveStrapiBlogCoverUrl(blog)
  const mediaList = normalizeStrapiMediaList(blog.image)
  const firstFlat = mediaList[0] ? unwrapMedia(mediaList[0]) : undefined
  const coverAlt =
    (firstFlat && typeof firstFlat.alternativeText === 'string' && firstFlat.alternativeText) || title
  const coverIsRemote = typeof coverUrl === 'string' && /^https?:\/\//i.test(coverUrl)

  const overviewSections = Array.isArray(blog.clientOverview) ? blog.clientOverview : []

  return (
    <HeaderFooterLayout>
      <Container maxWidth="lg" sx={{ pt: '100px', pb: 4 }}>
        <Typography variant="overline" className='card-tag'>
          {category}
        </Typography>
        <Typography variant="h4" className='secondary   lora  fw6' gutterBottom sx={{ letterSpacing: '0.05em' }}>
          {title}
        </Typography>
        {coverUrl ? (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '300px',
              borderRadius: 1,
              overflow: 'hidden',
              my: 3,
            }}
          >
            <Image
              src={coverUrl}
              alt={coverAlt}
              fill
              sizes="(max-width: 900px) 100vw, 900px"
              style={{ objectFit: 'cover' }}
              priority
              unoptimized={coverIsRemote}
            />
          </Box>
        ) : null}

        {overviewSections.length > 0 ? (
          <Box sx={{ borderBottom: '4px solid var(--secondary)', mb: 3 }}>
            {overviewSections.map((section, idx) => {
              const sectionHeading =
                (section && typeof section.Heading === 'string' && section.Heading) ||
                (section && typeof section.heading === 'string' && section.heading) ||
                ''
              const contentParts = strapiDescriptionToContentParts(section?.Description)
              const key = section?.documentId ?? section?.id ?? idx
              return (
                <Box key={key} sx={{ mb: 2 }}>
                  {sectionHeading ? (
                    <Typography
                      variant="h3"
                      className="black card-title lora fw6"
                      gutterBottom
                      sx={{ mb: 2, whiteSpace: 'pre-wrap' }}
                    >
                      {sectionHeading}
                    </Typography>
                  ) : null}
                  {contentParts.map((part, partIdx) => {
                    const topSpacing = partIdx === 0 && sectionHeading ? 2 : 0
                    if (part.type === 'paragraph') {
                      return (
                        <Typography
                          key={partIdx}
                          variant="h6"
                          className="paragraph justify fw4"
                          component="div"
                          sx={{ mt: topSpacing, whiteSpace: 'pre-wrap', mb: 2 }}
                        >
                          {renderStrapiRichChildren(part.children, `p-${partIdx}`)}
                        </Typography>
                      )
                    }
                    const isOrdered = part.format === 'ordered'
                    const ListTag = isOrdered ? 'ol' : 'ul'
                    return (
                      <Box
                        key={partIdx}
                        component={ListTag}
                        className={isOrdered ? 'blog-rich-list blog-rich-list--ol' : 'blog-rich-list blog-rich-list--ul'}
                        sx={{
                          mt: 2,
                          mb: 2,
                          pl: 2,
                          listStyleType: isOrdered ? 'decimal' : 'disc',
                          listStylePosition: 'outside',
                          '& li': {
                            display: 'list-item',
                            listStyleType: isOrdered ? 'decimal' : 'disc',
                          },
                          '& li::marker': {
                            color: 'var(--secondary)',
                            fontWeight: isOrdered ? 600 : undefined,
                          },
                        }}
                      >
                        {part.items.map((item, liIdx) => (
                          <li key={liIdx}>
                            <Typography
                              variant="h6"
                              className="paragraph justify fw4"
                              gutterBottom
                              component="div"
                              sx={{ whiteSpace: 'pre-wrap' }}
                            >
                              {renderStrapiRichChildren(item.children, `li-${partIdx}-${liIdx}`)}
                            </Typography>
                          </li>
                        ))}
                      </Box>
                    )
                  })}
                </Box>
              )
            })}
          </Box>
        ) : null}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" className="secondary lora fw6" gutterBottom sx={{ letterSpacing: '0.05em' }}>
            {recommendedTitle}
          </Typography>
        </Box>

        {latestBlogs.length > 0 ? (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {latestBlogs.map((item, index) => (
              <Grid key={item.documentId || item.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <BlogCard
                  blog={item}
                  coverSrc={resolveStrapiBlogCoverUrl(item)}
                  priority={index === 0}
                />
              </Grid>
            ))}
          </Grid>
        ) : null}

        <Button variant="text" color="primary" href="/blogs" startIcon={<MdKeyboardArrowLeft />}>Back to blogs</Button>
      </Container>
    </HeaderFooterLayout>
  )
}

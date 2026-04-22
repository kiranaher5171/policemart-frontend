'use client'

import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import { MdKeyboardArrowRight } from 'react-icons/md'
import { normalizeStrapiMediaList, unwrapMedia } from '@/lib/strapiMedia'

const DEFAULT_COVER = '/images/sampalimage.jpg'

/**
 * @param {{
 *   blog?: {
 *     category?: string
 *     title?: string
 *     slug?: string
 *     image?: Array<{ alternativeText?: string | null; caption?: string | null }>
 *   }
 *   coverSrc?: string
 *   priority?: boolean
 * }} props
 */
const BlogCard = ({ blog, coverSrc, priority = false }) => {
  const categoryRaw = blog?.category ?? 'Blog'
  const category = typeof categoryRaw === 'string' ? categoryRaw.trim() || 'Blog' : 'Blog'
  const titleRaw = blog?.title ?? 'Untitled'
  const title = typeof titleRaw === 'string' ? titleRaw.trim() || 'Untitled' : 'Untitled'
  const slug = blog?.slug
  const href = slug ? `/blogs/${slug}` : '/blogs'
  const imageSrc = coverSrc || DEFAULT_COVER
  const mediaList = normalizeStrapiMediaList(blog?.image)
  const firstFlat = mediaList[0] ? unwrapMedia(mediaList[0]) : undefined
  const imageAlt =
    (firstFlat && typeof firstFlat.alternativeText === 'string' && firstFlat.alternativeText) ||
    title ||
    'Blog cover'
  /** Remote Strapi URLs: avoid optimizer / hostname mismatch in dev */
  const isRemote = typeof imageSrc === 'string' && /^https?:\/\//i.test(imageSrc)

  return (
    <Box className="card-container" sx={{ position: 'relative', height: 370, width: '100%' }}>
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Image
          src={imageSrc}
          alt={typeof imageAlt === 'string' ? imageAlt : 'Blog cover'}
          fill 
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          quality={100}
          priority={priority}
          unoptimized={isRemote}
        />
      </Box>

      <Box className="gradient-overlay" aria-hidden />

      <Box className="content">
        <Box sx={{ width: '100%' }}>
          <Typography variant="h5" className="white card-tag" gutterBottom>
            {category}
          </Typography>
          <Typography
            variant="body1"
            className="white card-title"
            gutterBottom
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </Typography>
        </Box>
        <Button
          variant="contained"
          disableRipple
          className="card-button"
          component={Link}
          href={href}
          endIcon={<MdKeyboardArrowRight  style={{fontSize: '16px'}}/>}
        >
          Read More
        </Button>
      </Box>
    </Box>
  )
}

export default BlogCard

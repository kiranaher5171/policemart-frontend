import React from 'react'
import BlogCard from './BlogCard'
import { Box, Container, Grid, Typography } from '@mui/material'
import HeaderFooterLayout from '@/components/layout/HeaderFooterLayout/HeaderFooterLayout'
import { fetchStrapiBlogs, resolveStrapiBlogCoverUrl } from '@/lib/strapiServer'

export default async function BlogsPage() {
  const blogs = await fetchStrapiBlogs()

  return (
    <HeaderFooterLayout>
      <Box sx={{ pt: '70px' }}>
        <Container maxWidth="lg">
          {blogs.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, maxWidth: 560 }}>
              No blog posts were loaded. If you already have published entries in Strapi, the app may not be able to
              reach the server from this environment, or the Blogs type may not allow public read. Ask your developer
              to verify the backend connection and permissions. A sample environment file is included in the repository as
              env.example.txt.
            </Typography>
          ) : (
            <Grid container spacing={1}>
              {blogs.map((blog, index) => (
                <Grid key={blog.documentId || blog.id} size={{ xl: 3, lg: 3, md: 4, sm: 6, xs: 12 }}>
                  <BlogCard
                    blog={blog}
                    coverSrc={resolveStrapiBlogCoverUrl(blog)}
                    priority={index === 0}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </HeaderFooterLayout>
  )
}

'use client';
import { Box, Divider, Skeleton, Stack } from '@mui/material';
import React from 'react';

export default function TableSkeleton() {
  return (
    <Box className="table-skeleton" >
      {/* First row (header) - 40px height */}
      <Skeleton variant="rectangular" width="100%" height={40} />

      {/* Divider */}
      <Box py={1}>
        <Divider />
      </Box>

      {/* Table rows skeleton (simulate 30 rows) */}
      <Stack spacing={1}>
        {Array.from({ length: 30 }).map((_, index) => (
          <Skeleton key={index} variant="text" height={30} />
        ))}
      </Stack>
    </Box>
  );
}

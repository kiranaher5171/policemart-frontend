 import React from 'react'
 import DummyTable from './DummyTable'
import MainLayout from '@/components/layout/MainLayout/MainLayout'
import { Box, Typography } from '@mui/material'
 
 const page = () => {
   return (
    <MainLayout>
      <DummyTable/> 
    </MainLayout>
   )
 }
 
 export default page
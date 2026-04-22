import React from 'react'
import Header from './Header'
import Footer from './Footer'

const HeaderFooterLayout = ({children}) => {
  return (
     <>
     <Header/> 
     <main className='page-content'>
        {children}
     </main>
     <Footer/>
     </>
  )
}

export default HeaderFooterLayout
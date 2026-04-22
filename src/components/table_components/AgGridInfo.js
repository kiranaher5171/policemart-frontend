import { Box, Typography } from '@mui/material';
import style from "./pagination.module.css";


const AgGridInfo = ({currentPage,rowsPerPage,totalRows}) => {
    const startRow = (currentPage - 1) * rowsPerPage + 1;
    const endRow = Math.min(currentPage * rowsPerPage, totalRows);
    return (
        <>
            <Box id={style.tableInfo}>
                <Typography variant='h6' className='txt fw5'>Showing {startRow} to {endRow} of <span className={style.totalEntries}>{totalRows} entries</span></Typography>
            </Box>
        </>
    )
}

export default AgGridInfo
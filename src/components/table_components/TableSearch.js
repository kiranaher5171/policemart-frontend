import React from "react";
import SearchIcon from '@mui/icons-material/Search';
import { Box, InputAdornment, TextField } from "@mui/material";

const TableSearch = () => {
  return (
    <Box className="table-search">
      <TextField
        variant="outlined"
        size="small"
        placeholder="SEARCH"
        sx={{ width: 220 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ fontSize: 20 }} />
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );
};

export default TableSearch; 
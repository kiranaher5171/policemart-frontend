"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Box, Typography } from "@mui/material";
import AgGridInfo from "@/components/table_components/AgGridInfo";
import AgGridPagination from "@/components/table_components/AgGridPagination";
import TableSkeleton from "@/components/table_components/TableSkeleton";
import TableSearch from "@/components/table_components/TableSearch";

ModuleRegistry.registerModules([AllCommunityModule]);

const DummyTable = () => {
  const headerHeight = 35;
  const rowHeight = 30;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [rowData, setRowData] = useState([]);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/contact", { method: "GET", cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || json.detail || `HTTP ${res.status}`);
      }
      setRowData(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load");
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const columnDefs = useMemo(
    () => [
      { headerName: "First name", field: "firstName", minWidth: 110, flex: 0.8 },
      { headerName: "Last name", field: "lastName", minWidth: 110, flex: 0.8 },
      { headerName: "Email", field: "email", minWidth: 180, flex: 1.2 },
      { headerName: "Phone", field: "phone", minWidth: 150, flex: 0.9 },
      { headerName: "Industry", field: "industryType", minWidth: 120, flex: 0.9 },
      { headerName: "Inquiry", field: "inquiryType", minWidth: 120, flex: 0.9 },
      { headerName: "Organization", field: "organization", minWidth: 130, flex: 1 },
      { headerName: "City", field: "city", minWidth: 90, flex: 0.6 },
      { headerName: "Country", field: "country", minWidth: 100, flex: 0.7 },
      {
        headerName: "Message",
        field: "message",
        minWidth: 160, 
        valueFormatter: (p) => {
          const v = p.value == null ? "" : String(p.value);
          return v.length > 80 ? `${v.slice(0, 80)}…` : v;
        },
      },
      
    ],
    [],
  );

  const defaultColDef = {
    sortable: true,
    autoHeight: false,
    filter: false,
    flex: 1,
    suppressMovable: true,
    resizable: true,
  };

  const totalRows = rowData.length;

  return (
    <>
      <Box className="whitebx">
        <Box className="fx_sb" sx={{ pb: 1 }}>
          <Typography variant="h6" className="table-heading" sx={{ flexShrink: 0 }}>
            Contact messages
          </Typography>
          <TableSearch />
        </Box>
        {loadError ? (
          <Typography color="error" sx={{ py: 2 }} role="alert">
            {loadError}
          </Typography>
        ) : null}
        {loading ? (
          <Box
            style={{ width: "100%", height: "60vh", overflow: "hidden" }}
            aria-label="Loading..."
          >
            <TableSkeleton />
          </Box>
        ) : (
          <>
            <Box className="ag-theme-quartz" style={{ width: "100%", height: "60vh" }}>
              <AgGridReact
                theme="legacy"
                rowData={rowData}
                getRowId={(p) =>
                  String(p.data?.documentId ?? p.data?.id ?? `${p.data?.email}-${p.data?.createdAt}`)
                }
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowHeight={rowHeight}
                headerHeight={headerHeight}
                rowClassRules={{
                  "even-row": (params) => params.node.rowIndex % 2 !== 0,
                  "odd-row": (params) => params.node.rowIndex % 2 === 0,
                }}
              />
            </Box>
          </>
        )}
        <Box id="tb_footer" className="fx_sb" sx={{ mt: 1 }}>
          <AgGridInfo
            currentPage={1}
            rowsPerPage={totalRows || 1}
            totalRows={totalRows}
          />
          <AgGridPagination
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
          />
        </Box>
      </Box>
    </>
  );
};

export default DummyTable;

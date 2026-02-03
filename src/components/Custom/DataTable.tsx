"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  RowSelectionOptions,
} from "ag-grid-community";
import {
  AG_GRID_LOCALE_EN,
  AG_GRID_LOCALE_EG,
} from "@ag-grid-community/locale";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import Loader from "../Global/Loader";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

export interface DataTableProps<T extends object> {
  rowData: T[];
  columnDefs: ColDef<T>[];
  height?: string | number | "auto";
  mobileHeight?: string | number;
  pagination?: boolean;
  paginationPageSize?: number;
  paginationPageSizeSelector?: number[];
  rowSelection?: "single" | "multiple" | false;
  showRowNumbers?: boolean;
  defaultColDef?: ColDef;
  onRowClicked?: (row: T) => void;
  className?: string;
  locale?: string;
  loading?: boolean;
  installLoading?: boolean;
}

export default function DataTable<T extends object>({
  loading = false,
  rowData,
  columnDefs,
  height = "auto",
  mobileHeight,
  pagination = true,
  paginationPageSize = 10,
  paginationPageSizeSelector = [10, 20, 50, 100],
  rowSelection = false,
  showRowNumbers = true,
  defaultColDef,
  onRowClicked,
  className = "",
  installLoading = true,
  locale: propLocale,
}: DataTableProps<T>) {
  const nextIntlLocale = useLocale();
  const [installLoadingState, setInstallLoadingState] =
    useState(installLoading);
  const locale = propLocale || nextIntlLocale || "en";
  const isRTL = locale === "ar";

  // Add row number column if enabled
  const finalColumnDefs = useMemo(() => {
    if (!showRowNumbers) return columnDefs;

    const rowNumberColumn: ColDef<T> = {
      headerName: "#",
      valueGetter: (params) => {
        if (!params.node) return "";
        const pageSize =
          params.api?.paginationGetPageSize() || paginationPageSize;
        const currentPage = params.api?.paginationGetCurrentPage() || 0;
        const displayedRowIndex = params.node.rowIndex ?? 0;
        return currentPage * pageSize + displayedRowIndex + 1;
      },
      sortable: false,
      width: 70,
      pinned: isRTL ? "right" : "left",
      cellStyle: {
        backgroundColor: "#f8fafc",
        fontWeight: "500",
        color: "#64748b",
        textAlign: "center",
        justifyContent: "center",
      },
      headerClass: "ag-header-cell-number",
    };

    return isRTL
      ? [...columnDefs, rowNumberColumn]
      : [rowNumberColumn, ...columnDefs];
  }, [columnDefs, showRowNumbers, paginationPageSize, isRTL]);

  const finalDefaultColDef: ColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      autoHeight: true,
      wrapText: true,
      cellStyle: {
        display: "flex",
        alignItems: "flex-start",
        whiteSpace: "normal",
        wordWrap: "break-word",
        overflow: "visible",
      },
      headerClass: "ag-header-cell-custom",
      ...defaultColDef,
    }),
    [defaultColDef]
  );

  const borderDirection = isRTL ? "left" : "right";

  useEffect(() => {
    setTimeout(() => {
      setInstallLoadingState(false);
    }, 500);
  }, []);

  return (
    <div className={`w-full relative ${className}`} dir={isRTL ? "rtl" : "ltr"}>
      {installLoadingState && (
        <div className="absolute inset-0 bg-white overflow-hidden z-10 flex items-center justify-center loading-overlay">
          <div className="w-[calc(100%-3px)] z-10 h-[calc(100%-3px)] bg-white absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"></div>
          <div className="blob"></div>
          <div className="z-20">
            <Loader />
          </div>
        </div>
      )}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .data-table-wrapper {
          width: 100%;
          overflow-x: auto;
          overflow-y: visible;
          -webkit-overflow-scrolling: touch;
        }
        .ag-theme-alpine{
        border-radius: 4px !important;}
        .data-table-wrapper::-webkit-scrollbar {
          height: 8px;
        }
        
        .data-table-wrapper::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        .data-table-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        .data-table-wrapper::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        .ag-theme-alpine {
          --ag-header-background-color: #f8fafc;
          --ag-header-foreground-color: #1e293b;
          --ag-border-color: #e2e8f0;
          --ag-row-border-color: #f1f5f9;
          --ag-odd-row-background-color: #ffffff;
          --ag-even-row-background-color: #fafbfc;
          --ag-row-hover-color: #f0f9ff;
          --ag-selected-row-background-color: #e0f2fe;
          --ag-font-family: inherit;
          --ag-font-size: 14px;
          --ag-header-height: 48px;
          --ag-header-cell-hover-background-color: #f1f5f9;
          --ag-header-cell-moving-background-color: #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          direction: ${isRTL ? "rtl" : "ltr"};
          min-width: 100%;
        }
          .ag-theme-alpine .ag-paging-button{
          margin: 0 !important;
          }
          .ag-paging-panel{
          height: auto;
          }
        @media (max-width: 1100px) {
    .ag-paging-panel{
        flex-wrap:wrap;
        justify-content: space-between;
        gap: 10px;
        }.ag-paging-page-summary-panel{
        margin: auto !important;
        }
        }
         .ag-paging-panel{
        flex-wrap:wrap;
        justify-content: space-between;
        gap: 10px;
        }
        @media (max-width: 768px) {
          .ag-theme-alpine {
            --ag-font-size: 12px;
            --ag-header-height: 44px;
            border-radius: 8px;
          }
         .ag-theme-alpine .ag-paging-button:nth-child(1){
          display: none;
         }
         .ag-theme-alpine .ag-paging-button:nth-last-child(1){
          display: none;
         }
          .ag-theme-alpine .ag-header-cell {
            padding: 0 12px;
          }
           .ag-paging-panel{
        flex-wrap:wrap;
        justify-content: center;
        gap: 10px;
        }
          .ag-theme-alpine .ag-cell {
            padding: 10px 12px;
            font-size: 12px;
            white-space: normal !important;
            word-wrap: break-word;
          }
          
          .ag-theme-alpine .ag-paging-panel {
            padding: 12px;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .ag-theme-alpine .ag-paging-button {
            padding: 4px 8px;
            font-size: 12px;
          }
          
          .ag-theme-alpine .ag-paging-page-summary-panel {
            margin: 0 8px;
            font-size: 12px;
          }
        }
        
        @media (max-width: 640px) {
          .ag-theme-alpine {
            --ag-font-size: 11px;
            --ag-header-height: 40px;
          }
          
          .ag-theme-alpine .ag-header-cell {
            padding: 0 8px;
          }
          
          .ag-theme-alpine .ag-cell {
            padding: 8px;
            font-size: 11px;
            white-space: normal !important;
            word-wrap: break-word;
          }
          
          .ag-theme-alpine .ag-paging-panel {
            padding: 8px;
            flex-direction: column;
            align-items: center;
          }
          
          .ag-theme-alpine .ag-paging-button {
            padding: 4px 6px;
            font-size: 11px;
          }
          
          ${
            mobileHeight
              ? `
          .ag-theme-alpine {
            height: ${
              typeof mobileHeight === "number"
                ? `${mobileHeight}px`
                : mobileHeight
            } !important;
          }
          `
              : ""
          }
        }
        
        .ag-theme-alpine .ag-header {
          border-bottom: 2px solid #e2e8f0;
          font-weight: 600;
          text-transform: none;
          letter-spacing: 0.01em;
        }
        
        .ag-theme-alpine .ag-header-cell {
          padding: 0 16px;
          border-${borderDirection}: 1px solid #e2e8f0;
        }
        
        .ag-theme-alpine .ag-header-cell:last-child {
          border-${borderDirection}: none;
        }
        
        .ag-theme-alpine .ag-cell {
          padding: 12px 16px;
          display: flex;
          align-items: flex-start;
          border-${borderDirection}: 1px solid #f1f5f9;
          font-size: 14px;
          color: #475569;
          text-align: ${isRTL ? "right" : "left"};
          white-space: normal !important;
          word-wrap: break-word;
          overflow: visible;
          line-height: 1.5;
        }
        
        .ag-theme-alpine .ag-cell:last-child {
          border-${borderDirection}: none;
        }
        
        .ag-theme-alpine .ag-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.2s ease;
        }
        
        .ag-theme-alpine .ag-row:hover {
          background-color: #f0f9ff !important;
          cursor: ${onRowClicked ? "pointer" : "default"};
        }
        
        .ag-theme-alpine .ag-row-selected {
          background-color: #e0f2fe !important;
        }
        
        .ag-theme-alpine .ag-paging-panel {
          padding: 16px 5px;
          border-top: 1px solid #e2e8f0;
          background-color: #fafbfc;
          color: #475569;
          direction: ${isRTL ? "rtl" : "ltr"};
        }
          .ag-paging-panel > *{
          margin: 0;
          }
        
        .ag-theme-alpine .ag-paging-button {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background-color: white;
          color: #475569;
          transition: all 0.2s ease;
        }
        
        .ag-theme-alpine .ag-paging-button:hover:not(.ag-disabled) {
          background-color: #f1f5f9;
          border-color: #94a3b8;
        }
        
        .ag-theme-alpine .ag-paging-button.ag-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .ag-theme-alpine .ag-paging-page-summary-panel {
        gap: 5px !important;
        }
        
        .ag-theme-alpine .ag-select {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 4px 8px;
          background-color: white;
        }
        
        .ag-theme-alpine .ag-icon {
          color: #64748b;
        }
        
        .ag-theme-alpine .ag-icon-menu {
          color: #94a3b8;
        }
        
        .ag-theme-alpine .ag-icon-asc,
        .ag-theme-alpine .ag-icon-desc {
          color: #3b82f6;
        }
        
        ${
          isRTL
            ? `
        .ag-theme-alpine .ag-header-cell-text {
          text-align: right;
        }
        .ag-theme-alpine .ag-header-cell {
          text-align: right;
        }
        .ag-theme-alpine .ag-paging-panel {
          flex-direction: row-reverse;
        }
        `
            : ""
        }
        
        @media (max-width: 640px) {
          ${
            isRTL
              ? `
          .ag-theme-alpine .ag-paging-panel {
            flex-direction: column-reverse;
          }
          `
              : `
          .ag-theme-alpine .ag-paging-panel {
            flex-direction: column;
          }
          `
          }
        }
      `,
        }}
      />
      <div className="data-table-wrapper">
        <div
          className="ag-theme-alpine"
          style={{
            ...(height === "auto" || !height
              ? {
                  // Calculate height for paginationPageSize rows
                  // Header (48px) + (paginationPageSize rows * ~52px per row) + Pagination (~60px)
                  height: `${48 + paginationPageSize * 52 + 60}px`,
                  minHeight: "400px",
                }
              : {
                  height: typeof height === "number" ? `${height}px` : height,
                }),
            minWidth: "100%",
          }}
        >
          <AgGridReact<T>
            theme="legacy"
            rowData={rowData}
            columnDefs={finalColumnDefs}
            defaultColDef={finalDefaultColDef}
            pagination={pagination}
            paginationPageSize={paginationPageSize}
            paginationPageSizeSelector={paginationPageSizeSelector}
            animateRows={true}
            rowSelection={rowSelection as unknown as RowSelectionOptions<T>}
            suppressRowClickSelection={rowSelection === false}
            suppressMenuHide={true}
            loading={loading}
            loadingOverlayComponent={() => (
              <div className="flex justify-center items-center h-full">
                <Loader />
              </div>
            )}
            onRowClicked={
              onRowClicked
                ? (params) => onRowClicked(params.data as T)
                : undefined
            }
            localeText={isRTL ? AG_GRID_LOCALE_EG : AG_GRID_LOCALE_EN}
            enableRtl={isRTL}
            suppressHorizontalScroll={false}
            domLayout="normal"
          />
        </div>
      </div>
    </div>
  );
}

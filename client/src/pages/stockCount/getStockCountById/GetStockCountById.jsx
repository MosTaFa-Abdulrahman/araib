import "./getStockCountById.scss";
import { Upload, Printer } from "lucide-react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";

// RTKQ
import { countInvoiceById, countInvoiceProducts } from "../../../dummyData";

function GetStockCountById() {
  const { invoiceId } = useParams();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Top section data
  const headerData = {
    location: {
      label: "Location",
      value: countInvoiceById.stockLocationName,
    },
    productCount: {
      label: "Number of products",
      value: `${countInvoiceById.countedItems} counted products`,
    },
    countName: {
      label: "Count Name",
      value: countInvoiceById.name,
    },
    countDate: {
      label: "Count Date",
      value: new Date(countInvoiceById.countDate).toLocaleDateString(),
    },
    identicalProducts: {
      label: "Products of identical quantities",
      value: "4 counted products",
    },
    createdBy: {
      label: "Created By",
      value: countInvoiceById.userName,
    },
  };

  // Columns
  const columns = [
    {
      field: "name",
      headerName: "Product Name / SKU",
      width: 300,
      renderCell: (params) => (
        <div>
          <div>{params.row.name}</div>
          <div>{params.row.sku}</div>
        </div>
      ),
      headerClassName: "name-column-header",
    },
    {
      field: "currentQty",
      headerName: "Expected",
      width: 220,
      align: "center",
      headerAlign: "center",
      headerClassName: "name-column-header",
    },
    {
      field: "newQty",
      headerName: "Counted",
      width: 220,
      align: "center",
      headerAlign: "center",
      headerClassName: "name-column-header",
    },
    {
      field: "difference",
      headerName: "Difference",
      width: 220,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const diff = params.row.newQty - params.row.currentQty;
        return (
          <span>
            {diff > 0 ? "+" : ""}
            {diff.toFixed(2)}
          </span>
        );
      },
      headerClassName: "name-column-header",
    },
    {
      field: "totalCost",
      headerName: "Total cost",
      width: 220,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => {
        const diff = params.row.newQty - params.row.currentQty;
        const totalCost = diff * params.row.cost;
        return <span>{totalCost.toFixed(2)}</span>;
      },
      headerClassName: "name-column-header",
    },
  ];

  //  Handle Export
  const handleExport = () => {
    const csvContent = countInvoiceProducts
      .map((row) =>
        Object.values(row)
          .filter((value) => typeof value !== "object")
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "count_invoice.csv";
    link.click();
  };

  // Language Transfer
  const arSD = {
    components: {
      MuiDataGrid: {
        defaultProps: {
          localeText: {
            columnMenuLabel: "القائمة",
            columnMenuShowColumns: "إظهار الأعمدة",
            columnMenuFilter: "تصفية",
            columnMenuHideColumn: "إخفاء العمود",
            columnMenuUnsort: "إلغاء الترتيب",
            columnMenuSortAsc: "ترتيب تصاعدي",
            columnMenuSortDesc: "ترتيب تنازلي",
            columnsPanelTextFieldLabel: "البحث عن العمود",
            columnsPanelTextFieldPlaceholder: "عنوان العمود",
            columnsPanelDragIconLabel: "إعادة ترتيب العمود",
            columnsPanelShowAllButton: "إظهار الكل",
            columnsPanelHideAllButton: "إخفاء الكل",
            filterPanelAddFilter: "إضافة تصفية",
            filterPanelRemoveAll: "حذف الكل",
            filterPanelDeleteIconLabel: "حذف",
            filterPanelLogicOperator: "عامل منطقي",
            filterPanelOperator: "عامل",
            filterPanelOperatorAnd: "و",
            filterPanelOperatorOr: "أو",
            filterPanelColumns: "الأعمدة",
            filterPanelInputLabel: "القيمة",
            filterPanelInputPlaceholder: "قيمة التصفية",
            filterOperatorContains: "يحتوي",
            filterOperatorEquals: "يساوي",
            filterOperatorStartsWith: "يبدأ بـ",
            filterOperatorEndsWith: "ينتهي بـ",
            filterOperatorIs: "يكون",
            filterOperatorNot: "ليس",
            filterOperatorAfter: "بعد",
            filterOperatorOnOrAfter: "في أو بعد",
            filterOperatorBefore: "قبل",
            filterOperatorOnOrBefore: "في أو قبل",
            filterOperatorIsEmpty: "فارغ",
            filterOperatorIsNotEmpty: "ليس فارغاً",
            filterOperatorIsAnyOf: "أي من",
            columnMenuManageColumns: "إدارة الأعمدة",
            footerRowSelected: (count) =>
              count !== 1
                ? `${count.toLocaleString()} صفوف محددة`
                : `صف واحد محدد`,
            footerTotalRows: "إجمالي الصفوف:",
            footerTotalVisibleRows: (visibleCount, totalCount) =>
              `${visibleCount.toLocaleString()} من ${totalCount.toLocaleString()}`,
            checkboxSelectionHeaderName: "تحديد",
            columnHeaderSortIconLabel: "ترتيب",
            MuiTablePagination: {
              labelRowsPerPage: "عدد الصفوف في الصفحة:",
              labelDisplayedRows: ({ from, to, count }) =>
                `${from}–${to} من ${count !== -1 ? count : `أكثر من ${to}`}`,
            },
          },
        },
      },
    },
  };

  return (
    <div className={`getStockCountById ${isRTL ? "rtl" : ""}`}>
      <div className="container">
        {/* Header Actions */}
        <div className="action-section">
          <button className="export-btn" onClick={handleExport}>
            <Upload size={18} />
            {t("Export Products")}
          </button>
          <button className="print-btn">
            <Printer size={18} />
            {t("Print")}
          </button>
        </div>

        {/* Info Cards */}
        <div className="headerInfoContainer">
          {Object.entries(headerData).map(([key, { label, value }]) => (
            <div key={key} className="headerInfoWrapper">
              <div className="labelText">{label}</div>
              <div className="valueText">{value}</div>
            </div>
          ))}
        </div>

        <Paper
          sx={{
            width: "100%",
            overflow: "hidden",
            margin: "20px 0",
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          }}
          className="data-grid-paper"
        >
          <DataGrid
            rows={countInvoiceProducts}
            columns={columns}
            rowHeight={64}
            headerHeight={48}
            disableColumnMenu
            getRowHeight={() => "auto"}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            pageSizeOptions={[25, 50, 100]}
            disableRowSelectionOnClick
            showColumnVerticalBorder
            showCellVerticalBorder
            columnVisibilityModel={{}}
            sx={{
              "& .name-column-header": {
                backgroundColor: "#f7f0fa",
              },
              border: 0,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
              },
              "& .MuiDataGrid-pinnedColumns": {
                boxShadow: 2,
                backgroundColor: "#fff",
              },
              "& .MuiDataGrid-pinnedColumnHeaders": {
                boxShadow: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiDataGrid-row--lastVisible": {
                "& .MuiDataGrid-cell--pinned": {
                  boxShadow: 2,
                },
              },
            }}
            localeText={
              isRTL
                ? arSD.components.MuiDataGrid.defaultProps.localeText
                : undefined
            }
            pinnedColumns={{
              left: isRTL ? [] : ["invoiceNumber"],
              right: isRTL ? ["invoiceNumber"] : ["actions"],
            }}
          />
        </Paper>
      </div>
    </div>
  );
}

export default GetStockCountById;

import "./payments.scss";
import { useState } from "react";
import { Eye, Printer, Search, Upload } from "lucide-react";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";
import moment from "moment";

// Mock Data
import { supplierPayments } from "../../../dummyData";

function Payments() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { theme } = useTheme();

  const [searchText, setSearchText] = useState("");

  // Action Buttons Component
  const ActionButtons = ({ params }) => {
    return (
      <div className={`action-buttons ${isRTL ? "rtl" : ""}`}>
        <NavLink
          to={`/invoices/payments/pay-purchase-order/${params.row.invoiceNumber}/view`}
          className="removeLine"
        >
          <Eye className="icon" size={20} />
        </NavLink>
        <Printer className="icon" size={20} />
      </div>
    );
  };

  // Columns
  const columns = [
    {
      field: "invoiceNumber",
      headerName: isRTL ? "رقم الفاتورة" : "Invoice Number",
      width: 150,
      renderCell: (params) => (
        <NavLink
          to={`/invoices/payments/pay-purchase-order/${params.value}/view`}
          className="invoice-link"
        >
          {params.value}
        </NavLink>
      ),
      align: isRTL ? "right" : "left",
      pinned: isRTL ? "right" : "left",
    },
    {
      field: "issueDate",
      headerName: isRTL ? "تاريخ الإصدار" : "Issue Date",
      width: 150,
      align: isRTL ? "right" : "left",
      renderCell: (params) => {
        if (isRTL) {
          const date = moment(params.value);
          return `${date.format("DD")} ${t(
            `${date.format("MMMM")}`
          )} ${date.format("YYYY")}`;
        }
        // For English, format as "DD MMM YYYY"
        return moment(params.value).format("DD MMM YYYY");
      },
    },
    {
      field: "supplierName",
      headerName: isRTL ? "المورد" : "Supplier",
      width: 180,
      align: isRTL ? "right" : "left",
      renderCell: (params) => {
        return params?.row?.suppliers?.name;
      },
    },
    {
      field: "paymentType",
      headerName: isRTL ? "النوع" : "Type",
      width: 150,
      align: isRTL ? "right" : "left",
    },
    {
      field: "status",
      headerName: isRTL ? "نوع الفاتورة" : "Status",
      width: 130,
      align: isRTL ? "right" : "left",
    },
    {
      field: "paymentMethodName",
      headerName: isRTL ? "نوع الدفع" : "Payment Method",
      width: 180,
      align: isRTL ? "right" : "left",
      renderCell: (params) => {
        const paymentMethod = params.row.paymentLines?.[0]?.paymentMethodName;
        return paymentMethod || "-";
      },
    },
    {
      field: "amount",
      headerName: isRTL ? "نوع الدفع" : "Total Paid",
      width: 130,
      align: isRTL ? "right" : "left",
      renderCell: (params) => {
        return params?.row?.paymentLines?.amount;
      },
    },

    {
      field: "actions",
      headerName: isRTL ? "الإجراءات" : "Actions",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => <ActionButtons params={params} />,
      align: isRTL ? "right" : "left",
      pinned: isRTL ? "left" : "right",
    },
  ];

  //  Handle Export
  const handleExport = () => {
    const csvContent = supplierPayments
      .map((row) =>
        Object.values(row)
          .filter((value) => typeof value !== "object")
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "supplier_payments.csv";
    link.click();
  };

  // Handle Search
  const filteredRows = supplierPayments.filter((row) => {
    const searchStr = searchText.toLowerCase();
    return (
      row.invoiceNumber.toLowerCase().includes(searchStr) ||
      row?.suppliers?.name.toLowerCase().includes(searchStr)
    );
  });

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
    <div className={`payments ${isRTL ? "rtl" : ""} ${theme}`}>
      {/* Header */}
      <div className="header-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder={t("Search by Invoice No., Supplier Name. 😍")}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="action-section">
          <button className="export-btn" onClick={handleExport}>
            <Upload size={18} />
            {t("Export All")}
          </button>
        </div>
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
          rows={filteredRows}
          columns={columns}
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
  );
}

export default Payments;

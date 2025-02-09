import "./getReturnInvoices.scss";
import { useState, useEffect, useRef } from "react";
import {
  Eye,
  Printer,
  MoreHorizontal,
  PenLine,
  Search,
  Upload,
  CircleDollarSign,
  Plus,
} from "lucide-react";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";
import moment from "moment";

// /invoices/suppliers/56062/payments/receive-debit

// DummyData
import { Return_Invoices } from "../../../dummyData";

function GetReturnInvoices() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { theme } = useTheme();

  const [searchText, setSearchText] = useState("");

  // Action Buttons Component
  const ActionButtons = ({ params }) => {
    const menuRef = useRef(null);
    const status = params.row.paymentStatus;
    const [activeMenu, setActiveMenu] = useState(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setActiveMenu(null);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMenuClick = (e, id) => {
      e.stopPropagation();
      if (status !== "Draft") {
        setActiveMenu(activeMenu === id ? null : id);
      }
    };

    const handleActionClick = (action) => {
      setActiveMenu(null);
      console.log(`${action} clicked for invoice ${params.row.invoiceNumber}`);
    };

    if (status === "Fully Paid") {
      return (
        <div className="action-buttons">
          <Eye className="icon" size={20} />
          <Printer className="icon" size={20} />
        </div>
      );
    } else if (status === "Draft") {
      return (
        <div className="action-buttons">
          <PenLine className="icon" size={20} />
          <MoreHorizontal className="icon disabled" size={20} />
        </div>
      );
    } else {
      const menuId = `menu-${params.row.id}`;
      return (
        <div className={`action-buttons ${isRTL ? "rtl" : ""}`}>
          <Eye className="icon" size={20} />
          <div className="menu-container" ref={menuRef}>
            <MoreHorizontal
              className="icon"
              size={20}
              onClick={(e) => handleMenuClick(e, menuId)}
            />
            {activeMenu === menuId && (
              <div className={`submenu ${isRTL ? "rtl" : ""}`}>
                <NavLink
                  to={`/invoices/suppliers/${params?.row?.supplierId}/payments/receive-debit?invoiceNumber=${params?.row?.invoiceNumber}`}
                  className="removeLine"
                >
                  <button
                    className="submenu-item"
                    onClick={() => handleActionClick("Pay")}
                  >
                    {!isRTL && <CircleDollarSign size={14} />}
                    <span>{t("Pay")}</span>
                    {isRTL && <CircleDollarSign size={14} />}
                  </button>
                </NavLink>
                <button
                  className="submenu-item"
                  onClick={() => handleActionClick("Print")}
                >
                  {!isRTL && <Printer size={14} />}
                  <span>{t("Print")}</span>
                  {isRTL && <Printer size={14} />}
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  // Columns
  const columns = [
    {
      field: "invoiceNumber",
      headerName: isRTL ? "رقم الفاتورة" : "Invoice Number",
      width: 150,
      renderCell: (params) => (
        <NavLink
          to={`/invoices/return-stocks/${params.value}/view`}
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
      width: 120,
      align: isRTL ? "right" : "left",
    },
    {
      field: "stockLocationName",
      headerName: isRTL ? "الموقع" : "Location",
      width: 120,
      align: isRTL ? "right" : "left",
    },
    {
      field: "orderType",
      headerName: isRTL ? "نوع الفاتورة" : "Invoice Type",
      width: 130,
      align: isRTL ? "right" : "left",
    },
    {
      field: "status",
      headerName: isRTL ? "نوع الفاتورة" : "Status",
      width: 130,
      align: isRTL ? "right" : "left",
    },

    {
      field: "paymentStatus",
      headerName: isRTL ? "حالة الدفع" : "Payment Status",
      width: 130,
      align: isRTL ? "right" : "left",
      renderCell: (params) => (
        <div
          className={`status-chip ${params.value
            .toLowerCase()
            .replace(" ", "-")}`}
        >
          {params.value}
        </div>
      ),
    },

    {
      field: "notes",
      headerName: isRTL ? "الملاحظة" : "Notes",
      width: 130,
      align: isRTL ? "right" : "left",
      // renderCell: (params) => {
      //   if (params.value) {
      //     return params.value.slice(0, 12);
      //   }
      //   return "";
      // },
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
    const csvContent = Return_Invoices.map((row) =>
      Object.values(row)
        .filter((value) => typeof value !== "object")
        .join(",")
    ).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "return_invoices.csv";
    link.click();
  };

  // Handle Search
  const filteredRows = Return_Invoices.filter((row) => {
    const searchStr = searchText.toLowerCase();
    return (
      row.invoiceNumber.toLowerCase().includes(searchStr) ||
      row.supplierName.toLowerCase().includes(searchStr) ||
      row.stockLocationName.toLowerCase().includes(searchStr)
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
    <div className={`return-order-container ${isRTL ? "rtl" : ""} ${theme}`}>
      {/* Header */}
      <div className="header-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder={t(
              "Search by Invoice No., Supplier Name or Location Name. 😍"
            )}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="action-section">
          <button className="export-btn" onClick={handleExport}>
            <Upload size={18} />
            {t("Export All")}
          </button>
          <NavLink to="/invoices/return-stocks/new" className="removeLine">
            <button className="new-invoice-btn">
              <Plus size={20} />
              {t("Return Invoice")}
            </button>
          </NavLink>
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

export default GetReturnInvoices;

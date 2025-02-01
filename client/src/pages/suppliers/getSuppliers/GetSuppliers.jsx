import "./getSuppliers.scss";
import { useState, useEffect, useRef } from "react";
import {
  MoreHorizontal,
  Search,
  Upload,
  DollarSign,
  Plus,
  Pen,
  HandCoins,
} from "lucide-react";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Mock Data
import { suppliers } from "../../../dummyData";

function GetSuppliers() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [searchText, setSearchText] = useState("");

  // Action Buttons Component
  const ActionButtons = ({ params }) => {
    const menuRef = useRef(null);
    const { debitAmount, creditAmount, id } = params.row;
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";
    const [localActiveMenu, setLocalActiveMenu] = useState(false);

    // Calculate disabled states
    const bothZero = debitAmount === 0 && creditAmount === 0;
    const hasDebit = debitAmount > 0;
    const hasCredit = creditAmount > 0;
    const bothHaveValues = hasDebit && hasCredit;

    const isCreditPaymentDisabled = bothZero || (!hasCredit && !bothHaveValues);
    const isDebitPaymentDisabled = bothZero || (!hasDebit && !bothHaveValues);

    // Handle outside clicks
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setLocalActiveMenu(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Toggle menu
    const toggleMenu = (e) => {
      e.stopPropagation();
      setLocalActiveMenu(!localActiveMenu);
    };

    return (
      <div className={`action-buttons ${isRTL ? "rtl" : ""}`}>
        {/* Edit Button */}
        <NavLink to={`/invoices/suppliers/${id}`} className="icon-button">
          <Pen className="icon" size={20} />
        </NavLink>

        {/* Dropdown Menu */}
        <div className="menu-container" ref={menuRef}>
          <button type="button" className="icon-button" onClick={toggleMenu}>
            <MoreHorizontal className="icon" size={20} />
          </button>

          {localActiveMenu && (
            <div className={`submenu ${isRTL ? "rtl" : ""}`}>
              {/* Credit Payment Link */}
              {isCreditPaymentDisabled ? (
                <div className="submenu-item disabled">
                  {!isRTL && <DollarSign size={14} />}
                  <span>{t("Pay Credit Amount")}</span>
                  {isRTL && <DollarSign size={14} />}
                </div>
              ) : (
                <NavLink
                  to={`/invoices/suppliers/${id}/payments/pay-credit`}
                  className="submenu-item"
                  onClick={() => setLocalActiveMenu(false)}
                >
                  {!isRTL && <DollarSign size={14} />}
                  <span>{t("Pay Credit Amount")}</span>
                  {isRTL && <DollarSign size={14} />}
                </NavLink>
              )}

              {/* Debit Payment Link */}
              {isDebitPaymentDisabled ? (
                <div className="submenu-item disabled">
                  {!isRTL && <HandCoins size={14} />}
                  <span>{t("Receive Debit Amount")}</span>
                  {isRTL && <HandCoins size={14} />}
                </div>
              ) : (
                <NavLink
                  to={`/invoices/suppliers/${id}/payments/receive-debit`}
                  className="submenu-item"
                  onClick={() => setLocalActiveMenu(false)}
                >
                  {!isRTL && <HandCoins size={14} />}
                  <span>{t("Receive Debit Amount")}</span>
                  {isRTL && <HandCoins size={14} />}
                </NavLink>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Columns
  const columns = [
    {
      field: "code",
      headerName: isRTL ? "رمز المورد" : "Code",
      width: 150,
      align: isRTL ? "right" : "left",
      pinned: isRTL ? "right" : "left",
    },
    {
      field: "name",
      headerName: isRTL ? "اسم المورد" : "Supplier Name",
      width: 200,
      align: isRTL ? "right" : "left",
    },
    {
      field: "totalPaidAmount",
      headerName: isRTL ? "اجمالي المبلغ المدفوع" : "Total Paid",
      width: 180,
      align: isRTL ? "right" : "left",
    },
    {
      field: "debitAmount",
      headerName: isRTL ? "مدين" : "Debit",
      width: 180,
      align: isRTL ? "right" : "left",
    },
    {
      field: "creditAmount",
      headerName: isRTL ? "دائن" : "Credit",
      width: 180,
      align: isRTL ? "right" : "left",
    },
    {
      field: "netDue",
      headerName: isRTL ? "صافي المبلغ" : "Net Due",
      width: 180,
      align: isRTL ? "right" : "left",
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
    const csvContent = suppliers
      .map((row) =>
        Object.values(row)
          .filter((value) => typeof value !== "object")
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "suppliers.csv";
    link.click();
  };

  // Handle Search
  const filteredRows = suppliers.filter((row) => {
    const searchStr = searchText.toLowerCase();
    return (
      row.name.toLowerCase().includes(searchStr) ||
      row.code.toLowerCase().includes(searchStr)
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
    <div className={`getSuppliers ${isRTL ? "rtl" : ""}`}>
      {/* Header */}
      <div className="header-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder={t("Search by Supplier Name or Code 😍")}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="action-section">
          <button className="export-btn" onClick={handleExport}>
            <Upload size={18} />
            {t("Export All")}
          </button>
          <NavLink to="/invoices/suppliers/new" className="removeLine">
            <button className="new-invoice-btn">
              <Plus size={20} />
              {t("New Supplier")}
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

export default GetSuppliers;

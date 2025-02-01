import "./getStockTransfer.scss";
import { useState, useEffect, useRef } from "react";
import {
  Eye,
  Printer,
  PenLine,
  Search,
  Upload,
  Plus,
  Store,
  MoreHorizontal,
  HandCoins,
  UndoDot,
} from "lucide-react";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import moment from "moment";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Mock Data
import { Transfers_Invoices } from "../../../dummyData";

function GetStockTransfer() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [searchText, setSearchText] = useState("");

  // Action Buttons Component
  const ActionButtons = ({ params }) => {
    const menuRef = useRef(null);
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";
    const status = params.row.status;
    const [localActiveMenu, setLocalActiveMenu] = useState(false);

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

    if (status === "draft") {
      return (
        <div className="action-buttons">
          <Eye className="icon" size={20} />
          <PenLine className="icon" size={20} />
        </div>
      );
    } else if (status === "pending") {
      return (
        <div className={`action-buttons ${isRTL ? "rtl" : ""}`}>
          <Eye className="icon" size={20} />

          {/* Dropdown Menu */}
          <div className="menu-container" ref={menuRef}>
            <button type="button" className="icon-button" onClick={toggleMenu}>
              <MoreHorizontal className="icon" size={20} />
            </button>

            {localActiveMenu && (
              <div className={`submenu ${isRTL ? "rtl" : ""}`}>
                <NavLink
                  to={`/invoices/transfer-stock/recieve-stock/${params.row.id}`}
                  className="removeLine"
                  state={{ type: "some" }}
                >
                  <div className="submenu-item disabled">
                    {!isRTL && <HandCoins size={14} />}
                    <span>{t("Recieve Some")}</span>
                    {isRTL && <HandCoins size={14} />}
                  </div>
                </NavLink>
                <NavLink
                  to={`/invoices/transfer-stock/recieve-stock/${params.row.id}`}
                  className="removeLine"
                  state={{ type: "all" }}
                >
                  <div className="submenu-item disabled">
                    {!isRTL && <HandCoins size={14} />}
                    <span>{t("Recieve All")}</span>
                    {isRTL && <HandCoins size={14} />}
                  </div>
                </NavLink>
                <NavLink
                  to={`/invoices/transfer-stock/recieve-stock/${params.row.id}`}
                  className="removeLine"
                  state={{ type: "reject" }}
                >
                  <div className="submenu-item disabled">
                    {!isRTL && <UndoDot size={14} />}
                    <span>{t("Reject All")}</span>
                    {isRTL && <UndoDot size={14} />}
                  </div>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      );
    } else if (status === "requested") {
      return (
        <div className={`action-buttons ${isRTL ? "rtl" : ""}`}>
          <Eye className="icon" size={20} />

          {/* Dropdown Menu */}
          <div className="menu-container" ref={menuRef}>
            <button type="button" className="icon-button" onClick={toggleMenu}>
              <MoreHorizontal className="icon" size={20} />
            </button>

            {localActiveMenu && (
              <div className={`submenu ${isRTL ? "rtl" : ""}`}>
                <NavLink
                  to={`/invoices/transfer-stock/send-stock/${params.row.id}`}
                  className="removeLine"
                  state={{ type: "some" }}
                >
                  <div className="submenu-item disabled">
                    {!isRTL && <HandCoins size={14} />}
                    <span>{t("Send Some")}</span>
                    {isRTL && <HandCoins size={14} />}
                  </div>
                </NavLink>
                <NavLink
                  to={`/invoices/transfer-stock/send-stock/${params.row.id}`}
                  className="removeLine"
                  state={{ type: "all" }}
                >
                  <div className="submenu-item disabled">
                    {!isRTL && <HandCoins size={14} />}
                    <span>{t("Send All")}</span>
                    {isRTL && <HandCoins size={14} />}
                  </div>
                </NavLink>
                <NavLink
                  to={`/invoices/transfer-stock/send-stock/${params.row.id}`}
                  className="removeLine"
                  state={{ type: "reject" }}
                >
                  <div className="submenu-item disabled">
                    {!isRTL && <UndoDot size={14} />}
                    <span>{t("Reject All")}</span>
                    {isRTL && <UndoDot size={14} />}
                  </div>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Default case: Show basic actions
    return (
      <div className="action-buttons">
        <Eye className="icon" size={20} />
        <Printer className="icon" size={20} />
      </div>
    );
  };

  const columns = [
    {
      field: "invoiceNumber",
      headerName: isRTL ? "رقم الفاتورة" : "Invoice Number",
      width: 150,
      renderCell: (params) => (
        <NavLink
          to={`/invoices/transfer-stock/${params.value}/view`}
          className="invoice-link"
        >
          {params.value}
        </NavLink>
      ),
      align: isRTL ? "right" : "left",
      pinned: isRTL ? "right" : "left",
    },
    {
      field: "status",
      headerName: isRTL ? "حالة النقل" : "Transfer Status",
      width: 180,
      align: isRTL ? "right" : "left",
      renderCell: (params) => (
        <div className={`status-chip ${params.value.toLowerCase()}`}>
          {t(params.value)}
        </div>
      ),
    },
    {
      field: "issueDate",
      headerName: isRTL ? "تاريخ الإصدار" : "Issue Date",
      width: 170,
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
      field: "updatedAt",
      headerName: isRTL ? "تاريخ الاكتمال" : "Last Update",
      width: 170,
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
      field: "sourceStockLocationName",
      headerName: isRTL ? "من" : "From",
      width: 130,
      align: isRTL ? "right" : "left",
    },
    {
      field: "destinationStockLocationName",
      headerName: isRTL ? "الي" : "To",
      width: 130,
      align: isRTL ? "right" : "left",
    },
    {
      field: "username",
      headerName: isRTL ? "المستخدم" : "User",
      width: 130,
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
    const csvContent = Transfers_Invoices.map((row) =>
      Object.values(row)
        .filter((value) => typeof value !== "object")
        .join(",")
    ).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transfer_invoices.csv";
    link.click();
  };

  // Handle Search
  const filteredRows = Transfers_Invoices.filter((row) => {
    const searchStr = searchText.toLowerCase();
    return (
      row.invoiceNumber.toLowerCase().includes(searchStr) ||
      row.destinationStockLocationName.toLowerCase().includes(searchStr) ||
      row.sourceStockLocationName.toLowerCase().includes(searchStr)
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
    <div className={`getStockTransfer ${isRTL ? "rtl" : ""}`}>
      {Transfers_Invoices ? (
        <>
          {/* Header */}
          <div className="header-section">
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder={t(
                  "Search by Invoice No., Destination Name or Source Name."
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
              <NavLink
                to="/invoices/transfer-stock/new-multiple/request"
                className="removeLine"
              >
                <button className="export-btn">{t("Request Stock")}</button>
              </NavLink>
              <NavLink
                to="/invoices/transfer-stock/new-multiple/new"
                className="removeLine"
              >
                <button className="new-invoice-btn">
                  <Plus size={20} />
                  {t("Transfer Stock")}
                </button>
              </NavLink>
            </div>
          </div>

          {/* Table */}
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
        </>
      ) : (
        <div className="emptyContainer">
          <Store className="emptyIcon" />
          <div className="emptyTitle">
            {t("You do not have any Purchase Invoices")}
          </div>
          <NavLink to="/invoices/purchase-orders/new" className="removeLine">
            <button className="new-invoice-btn">
              <Plus size={20} />
              {t("Purchase Invoice")}
            </button>
          </NavLink>
        </div>
      )}
    </div>
  );
}

export default GetStockTransfer;

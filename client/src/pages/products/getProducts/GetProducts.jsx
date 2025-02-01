import "./getProducts.scss";
import { useState, useEffect, useRef } from "react";
import {
  Upload,
  ChevronDown,
  Download,
  Plus,
  Search,
  PackageOpen,
} from "lucide-react";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

function GetProducts() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const menuRef = useRef();

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowExportMenu(false);
        setShowImportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const columns = [
    { field: "id", headerName: t("ID"), width: 70 },
    { field: "productName", headerName: t("Product Name"), width: 130 },
    { field: "mainProduct", headerName: t("Main Product"), width: 130 },
    { field: "category", headerName: t("Category"), width: 130 },
    { field: "supplier", headerName: t("Supplier"), width: 130 },
    { field: "productType", headerName: t("Product Type"), width: 130 },
    { field: "tracked", headerName: t("Tracked"), width: 130 },
    { field: "sku", headerName: t("SKU"), width: 130 },
    {
      field: "availableQuantity",
      headerName: t("Available Quantity"),
      type: "number",
      width: 100,
    },
  ];

  const rows = [
    {
      id: 1,
      productName: "Apple",
      mainProduct: "Apple",
      category: "fruites",
      supplier: "Muhammed",
      productType: "simple",
      tracked: "no",
      sku: "148965465131321654",
      availableQuantity: 60,
    },
    {
      id: 2,
      productName: "Apple",
      mainProduct: "Apple",
      category: "fruites",
      supplier: "Muhammed",
      productType: "simple",
      tracked: "no",
      sku: "148965465131321654",
      availableQuantity: 60,
    },
    {
      id: 3,
      productName: "Apple",
      mainProduct: "Apple",
      category: "fruites",
      supplier: "Muhammed",
      productType: "simple",
      tracked: "no",
      sku: "148965465131321654",
      availableQuantity: 60,
    },
    {
      id: 4,
      productName: "Apple",
      mainProduct: "Apple",
      category: "fruites",
      supplier: "Muhammed",
      productType: "simple",
      tracked: "no",
      sku: "148965465131321654",
      availableQuantity: 60,
    },
    {
      id: 5,
      productName: "Apple",
      mainProduct: "Apple",
      category: "fruites",
      supplier: "Muhammed",
      productType: "simple",
      tracked: "no",
      sku: "148965465131321654",
      availableQuantity: 60,
    },
    {
      id: 6,
      productName: "Apple",
      mainProduct: "Apple",
      category: "fruites",
      supplier: "Muhammed",
      productType: "simple",
      tracked: "no",
      sku: "148965465131321654",
      availableQuantity: 60,
    },
    {
      id: 7,
      productName: "Apple",
      mainProduct: "Apple",
      category: "fruites",
      supplier: "Muhammed",
      productType: "simple",
      tracked: "no",
      sku: "148965465131321654",
      availableQuantity: 60,
    },
    {
      id: 8,
      productName: "Apple",
      mainProduct: "Apple",
      category: "fruites",
      supplier: "Muhammed",
      productType: "simple",
      tracked: "no",
      sku: "148965465131321654",
      availableQuantity: 60,
    },
    {
      id: 9,
      productName: "Apple",
      mainProduct: "Apple",
      category: "fruites",
      supplier: "Muhammed",
      productType: "simple",
      tracked: "no",
      sku: "148965465131321654",
      availableQuantity: 60,
    },
    {
      id: 10,
      productName: "Apple",
      mainProduct: "Apple",
      category: "fruites",
      supplier: "Muhammed",
      productType: "simple",
      tracked: "no",
      sku: "148965465131321654",
      availableQuantity: 60,
    },
    {
      id: 11,
      productName: "Apple",
      mainProduct: "Apple",
      category: "fruites",
      supplier: "Muhammed",
      productType: "simple",
      tracked: "no",
      sku: "148965465131321654",
      availableQuantity: 60,
    },
  ];

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
    <div className={`getProducts ${isRTL ? "rtl" : "ltr"}`}>
      {rows ? (
        <>
          {/* Top */}
          <div className="top">
            <div className="left">
              <div className="searchContainer">
                <Search className="searchIcon" />
                <input placeholder={t("Search or Scan Products...")} />
              </div>
            </div>

            <div className="right" ref={menuRef}>
              <div className="buttonWrapper">
                <button
                  className="btnOutline"
                  onClick={() => {
                    setShowExportMenu(!showExportMenu);
                    setShowImportMenu(false);
                  }}
                >
                  <Upload className="icon" />
                  <span>{t("Export")}</span>
                  <ChevronDown className="icon" />
                </button>
                {showExportMenu && (
                  <div className="dropdownMenu">
                    <button>{t("Products")}</button>
                    <button>{t("Batch Lists")}</button>
                    <button>{t("Serial Lists")}</button>
                  </div>
                )}
              </div>

              <div className="buttonWrapper">
                <button
                  className="btnOutline"
                  onClick={() => {
                    setShowImportMenu(!showImportMenu);
                    setShowExportMenu(false);
                  }}
                >
                  <Download className="icon" />
                  <span>{t("Import")}</span>
                  <ChevronDown className="icon" />
                </button>
                {showImportMenu && (
                  <div className="dropdownMenu">
                    <button>{t("Import Products")}</button>
                    <button>{t("Import Batch Lists")}</button>
                    <button>{t("Import Serial Lists")}</button>
                    <button>{t("Update Products")}</button>
                  </div>
                )}
              </div>

              <NavLink to="/inventory/products/new" className="linkButton">
                <button className="btnProduct">
                  <Plus className="icon" />
                  <span>{t("New Product")}</span>
                </button>
              </NavLink>
            </div>
          </div>

          {/* Table */}
          <Paper sx={{ height: 400, width: "100%", margin: "20px auto" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 5 } },
              }}
              pageSizeOptions={[5, 10]}
              checkboxSelection
              sx={{
                border: 0,
                "& .MuiTablePagination-root": {
                  direction: isRTL ? "rtl" : "ltr",
                },
                "& .MuiDataGrid-columnHeaders": {
                  direction: isRTL ? "rtl" : "ltr",
                },
                "& .MuiDataGrid-cell": {
                  direction: isRTL ? "rtl" : "ltr",
                },
              }}
              localeText={
                isRTL
                  ? arSD.components.MuiDataGrid.defaultProps.localeText
                  : undefined
              }
            />
          </Paper>
        </>
      ) : (
        <div className="emptyContainer">
          <PackageOpen className="emptyIcon" />
          <div className="emptyTitle">
            {t("You have not added any Products Yet")}
          </div>

          <div className="btnEmptyContainer">
            <div className="buttonWrapper">
              <button
                className="btnOutline"
                onClick={() => {
                  setShowImportMenu(!showImportMenu);
                  setShowExportMenu(false);
                }}
              >
                <Download className="icon" />
                <span>{t("Import")}</span>
                <ChevronDown className="icon" />
              </button>
              {showImportMenu && (
                <div className="dropdownMenu">
                  <button>{t("Import Products")}</button>
                  <button>{t("Import Batch Lists")}</button>
                  <button>{t("Import Serial Lists")}</button>
                  <button>{t("Update Products")}</button>
                </div>
              )}
            </div>

            <NavLink to="/inventory/products/new" className="removeLine">
              <button className="btnProduct">
                <Plus className="icon" />
                <span>{t("New Product")}</span>
              </button>
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );
}

export default GetProducts;

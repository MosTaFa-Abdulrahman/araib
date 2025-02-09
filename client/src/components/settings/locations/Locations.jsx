import "./locations.scss";
import { useState, useEffect, useRef } from "react";
import {
  MoreHorizontal,
  Search,
  Upload,
  Plus,
  MapPinHouse,
  MapPinX,
  MapPinPlus,
} from "lucide-react";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// DummyData
import { locations } from "../../../dummyData";

function Locations() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { theme } = useTheme();

  const [searchText, setSearchText] = useState("");
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Action Buttons Component
  const ActionButtons = ({ params }) => {
    const menuRef = useRef(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const isSuperAdmin = params.row.code === "DEF";
    const isInactive = params.row.isActive === "false";

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
      setActiveMenu(activeMenu === id ? null : id);
    };

    const handleStatusChange = (location) => {
      setSelectedLocation(location);
      setShowDeactivateModal(true);
      setActiveMenu(null);
    };

    const handleEdit = () => {
      setActiveMenu(null);
      console.log("Edit clicked");
    };

    const menuId = `menu-${params.row.id}`;
    return (
      <div className={`action-buttons ${isRTL ? "rtl" : ""}`}>
        <div className="menu-container" ref={menuRef}>
          <MoreHorizontal
            className="icon"
            size={20}
            onClick={(e) => handleMenuClick(e, menuId)}
          />
          {activeMenu === menuId && (
            <div className={`submenu ${isRTL ? "rtl" : ""}`}>
              <button className="submenu-item" onClick={handleEdit}>
                {!isRTL && <MapPinHouse size={14} />}
                <span>{t("Edit Location")}</span>
                {isRTL && <MapPinHouse size={14} />}
              </button>
              <button
                className={`submenu-item ${isSuperAdmin ? "disabled" : ""}`}
                onClick={() => !isSuperAdmin && handleStatusChange(params.row)}
                disabled={isSuperAdmin}
              >
                {!isRTL &&
                  (isInactive ? (
                    <MapPinPlus size={14} />
                  ) : (
                    <MapPinX size={14} />
                  ))}
                <span>
                  {t(isInactive ? "Activate Location" : "Deactivate Location")}
                </span>
                {isRTL &&
                  (isInactive ? (
                    <MapPinPlus size={14} />
                  ) : (
                    <MapPinX size={14} />
                  ))}
              </button>
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
      headerName: isRTL ? "الكود" : "Code",
      width: 200,
      align: isRTL ? "right" : "left",
    },
    {
      field: "name",
      headerName: isRTL ? "اسم الموقع" : "Location Name",
      width: 200,
      align: isRTL ? "right" : "left",
    },
    {
      field: "country",
      headerName: isRTL ? "الدولة" : "Country",
      width: 200,
      align: isRTL ? "right" : "left",
    },
    {
      field: "city",
      headerName: isRTL ? "المدينة" : "City",
      width: 220,
      align: isRTL ? "right" : "left",
    },
    {
      field: "actions",
      headerName: isRTL ? "الإجراءات" : "Actions",
      width: 70,
      sortable: false,
      filterable: false,
      renderCell: (params) => <ActionButtons params={params} />,
      align: isRTL ? "right" : "left",
      pinned: isRTL ? "left" : "right",
    },
  ];

  // Handle Export
  const handleExport = () => {
    const csvContent = locations
      .map((row) =>
        Object.values(row)
          .filter((value) => typeof value !== "object")
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "locations.csv";
    link.click();
  };

  // Handle Search
  const filteredRows = locations.filter((row) => {
    const searchStr = searchText.toLowerCase();
    return (
      row.name.toLowerCase().includes(searchStr) ||
      row.code.toLowerCase().includes(searchStr) ||
      row.country.toLowerCase().includes(searchStr) ||
      row.city.toLowerCase().includes(searchStr)
    );
  });

  const handleDeactivateConfirm = () => {
    console.log("Deactivating user:", selectedLocation);
    setShowDeactivateModal(false);
    setSelectedLocation(null);
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
    <div className={`locations ${isRTL ? "rtl" : ""} ${theme}`}>
      {/* Header */}
      <div className="header-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder={t("Search by Location Name or Country or City 😍")}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="action-section">
          <button className="export-btn" onClick={handleExport}>
            <Upload size={18} />
            {t("Export All")}
          </button>
          <NavLink to="/users-settings/locations/new" className="removeLine">
            <button className="new-invoice-btn">
              <Plus size={20} />
              {t("New Location")}
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
        />
      </Paper>

      {/* Modal For ((Active + DeActive)) */}
      {showDeactivateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              {t(
                selectedLocation?.isActive === "false"
                  ? "Activate Location"
                  : "Deactivate Location"
              )}
            </h2>
            <p>
              {t(
                selectedLocation?.isActive === "false"
                  ? "Are you sure you want to Activate the Location?"
                  : "Are you sure you want to Deactivate the Location?"
              )}
            </p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowDeactivateModal(false)}
              >
                {t("Cancel")}
              </button>
              <button
                className={`confirm-btn ${
                  selectedLocation?.isActive === "false" ? "true" : ""
                }`}
                onClick={handleDeactivateConfirm}
              >
                {t("Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Locations;

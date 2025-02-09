import "./users.scss";
import { useState, useEffect, useRef } from "react";
import {
  MoreHorizontal,
  Search,
  Upload,
  Plus,
  UserCog,
  UserMinus,
  UserPlus,
} from "lucide-react";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// DummyData
import { mockUsers } from "../../../dummyData";

function Users() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { theme } = useTheme();

  const [searchText, setSearchText] = useState("");
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Status Cell Component
  const StatusCell = ({ value }) => (
    <div className={`status-chip ${value}`}>{value}</div>
  );

  // Action Buttons Component
  const ActionButtons = ({ params }) => {
    const menuRef = useRef(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const isSuperAdmin = params.row.SystemRole === "SuperAdmin";
    const isInactive = params.row.status === "Inactive";

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

    const handleStatusChange = (user) => {
      setSelectedUser(user);
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
                {!isRTL && <UserCog size={14} />}
                <span>{t("Edit User")}</span>
                {isRTL && <UserCog size={14} />}
              </button>
              <button
                className={`submenu-item ${isSuperAdmin ? "disabled" : ""}`}
                onClick={() => !isSuperAdmin && handleStatusChange(params.row)}
                disabled={isSuperAdmin}
              >
                {!isRTL &&
                  (isInactive ? (
                    <UserPlus size={14} />
                  ) : (
                    <UserMinus size={14} />
                  ))}
                <span>
                  {t(isInactive ? "Activate User" : "Deactivate User")}
                </span>
                {isRTL &&
                  (isInactive ? (
                    <UserPlus size={14} />
                  ) : (
                    <UserMinus size={14} />
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
      field: "id",
      headerName: isRTL ? "المورد" : "ID",
      width: 200,
      align: isRTL ? "right" : "left",
    },
    {
      field: "name",
      headerName: isRTL ? "الاسم" : "Name",
      width: 200,
      align: isRTL ? "right" : "left",
    },
    {
      field: "email",
      headerName: isRTL ? "الايميل" : "Email",
      width: 300,
      align: isRTL ? "right" : "left",
    },
    {
      field: "SystemRole",
      headerName: isRTL ? "الدور" : "Role",
      width: 220,
      align: isRTL ? "right" : "left",
    },
    {
      field: "status",
      headerName: isRTL ? "الحالة" : "Status",
      width: 140,
      align: isRTL ? "right" : "left",
      renderCell: (params) => <StatusCell value={params.value} />,
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
    const csvContent = mockUsers
      .map((row) =>
        Object.values(row)
          .filter((value) => typeof value !== "object")
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "users.csv";
    link.click();
  };

  // Handle Search
  const filteredRows = mockUsers.filter((row) => {
    const searchStr = searchText.toLowerCase();
    return (
      row.name.toLowerCase().includes(searchStr) ||
      row.email.toLowerCase().includes(searchStr)
    );
  });

  const handleDeactivateConfirm = () => {
    console.log("Deactivating user:", selectedUser);
    setShowDeactivateModal(false);
    setSelectedUser(null);
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
    <div className={`users ${isRTL ? "rtl" : ""} ${theme}`}>
      {/* Header */}
      <div className="header-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder={t("Search by Username or Email 😍")}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="action-section">
          <button className="export-btn" onClick={handleExport}>
            <Upload size={18} />
            {t("Export All")}
          </button>
          <NavLink to="/users-settings/users/new" className="removeLine">
            <button className="new-invoice-btn">
              <Plus size={20} />
              {t("New User")}
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
                selectedUser?.status === "Inactive"
                  ? "Activate User"
                  : "Deactivate User"
              )}
            </h2>
            <p>
              {t(
                selectedUser?.status === "Inactive"
                  ? "Are you sure you want to Activate the user?"
                  : "Are you sure you want to Deactivate the user?"
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
                  selectedUser?.status === "Inactive" ? "activate" : ""
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

export default Users;

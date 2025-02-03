import "./sidebar.scss";
import { useState } from "react";
import {
  Home,
  Store,
  BarChart,
  Settings,
  Box,
  BaggageClaim,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

const Sidebar = ({ isOpen }) => {
  const { t, i18n } = useTranslation();
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const isRTL = i18n.language === "ar"; // Check if the current language is Arabic

  const menuItems = [
    {
      icon: <Home />,
      label: t("Home"),
      path: "/",
    },
    {
      icon: <Store />,
      label: t("Sales & Customers"),
      submenu: [
        { label: t("Point of Sale"), path: "/sales/pos" },
        { label: t("Cash Management"), path: "/sales/cash-management" },
        { label: t("Sale Invoices"), path: "/sales/invoices" },
        { label: t("eCommerce Orders"), path: "/sales/ecommerce-orders" },
        { label: t("Customers"), path: "/sales/customers" },
        { label: t("Sale Settings"), path: "/sales/settings" },
      ],
    },
    {
      icon: <Box />,
      label: t("Products & Inventory"),
      submenu: [
        { label: t("Products"), path: "/inventory/products" },
        { label: t("Stock Count"), path: "/invoices/stock-count" },
        {
          label: t("Stock Transfer"),
          path: "/invoices/transfer-stock",
        },
        { label: t("Remove Stock"), path: "/invoices/remove-stock" },
      ],
    },
    {
      icon: <BaggageClaim />,
      label: t("Purchases & Suppliers"),
      submenu: [
        { label: t("Purchase Invoice"), path: "/invoices/purchase-orders" },
        { label: t("Return Invoice"), path: "/invoices/return-stocks" },
        { label: t("Suppliers"), path: "/invoices/suppliers" },
        { label: t("Supplier Payments"), path: "/invoices/payments" },
      ],
    },
    {
      icon: <LayoutGrid />,
      label: t("Applications"),
      submenu: [{ label: t("Available Apps"), path: "/applications" }],
    },
    {
      icon: <BarChart />,
      label: t("Reports"),
      path: "/reports",
    },
    {
      icon: <Settings />,
      label: t("Settings"),
      path: "/settings",
    },
  ];

  const toggleSubmenu = (index) => {
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };

  return (
    <div
      className={`sidebar ${isOpen ? "open" : "closed"}`}
      style={{ [isRTL ? "right" : "left"]: 0 }}
    >
      <div className="sidebar-content">
        <div className="sidebar-logo">
          <div className="logoContainer">
            <NavLink to="/" className="removeLine">
              <img
                src="https://t4.ftcdn.net/jpg/09/61/68/95/240_F_961689557_TOSq63HhI2KGbdJrvrT9f7eRFmYTQEUy.jpg"
                alt="Logo"
              />
            </NavLink>
            <h2>{isOpen ? t("ARAIB") : "YL"}</h2>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item, index) => (
            <div key={index} className="menu-item-wrapper">
              <NavLink
                to={item.path || "#"}
                className={`menu-item ${item.submenu ? "has-submenu" : ""}`}
                onClick={() => {
                  item.onClick && item.onClick();
                  item.submenu && toggleSubmenu(index);
                }}
              >
                {item.icon}
                {isOpen && (
                  <>
                    <span>{item.label}</span>
                    {item.submenu && (
                      <span className="submenu-toggle">
                        {activeSubmenu === index ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              {item.submenu && isOpen && (
                <AnimatePresence>
                  {activeSubmenu === index && (
                    <motion.div
                      className="submenu"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      {item.submenu.map((subitem, subindex) => (
                        <NavLink
                          key={subindex}
                          to={subitem.path}
                          className="submenu-item"
                          activeClassName="active"
                        >
                          {subitem.label}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;

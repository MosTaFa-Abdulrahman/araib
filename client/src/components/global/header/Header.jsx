import "./header.scss";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  CircleHelp,
  ChevronDown,
  Loader,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// RTKQ
import {
  useGetCurrentUserQuery,
  useLogoutMutation,
} from "../../../store/auth/authSlice";
import toast from "react-hot-toast";

export default function Header({ isOpen, toggleSidebar, title }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [language, setLanguage] = useState(i18n.language);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef();

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // RTKQ
  const { data: currentUser, isLoading: isUserLoading } =
    useGetCurrentUserQuery();
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout().unwrap();
      window.location.href = "/login";
      toast.success(t("Logged out successfully!"));
    } catch (error) {
      toast.error(
        error?.data?.message || t("An error occurred during logout.")
      );
    }
  };

  // Handle Language Toggle
  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLanguage);
    setLanguage(newLanguage);
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
    setUserMenuOpen(false); // Close the submenu
  };

  // Toggle User Menu
  const toggleUserMenu = () => setUserMenuOpen(!isUserMenuOpen);

  return (
    <header
      className="header"
      style={{
        left: isRTL ? 0 : isOpen ? "300px" : 0,
        right: isRTL ? (isOpen ? "300px" : 0) : 0,
      }}
    >
      {/* Left Section */}
      <div className="left-section">
        {toggleSidebar && (
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>
        )}
        <h2 className="page-title">{title}</h2>
      </div>

      {/* Right Section */}
      <div className="right-section">
        <button className="icon-button">
          <Bell />
        </button>
        <button className="icon-button">
          <CircleHelp />
        </button>
        <div className="user-menu">
          <button className="user-button" onClick={toggleUserMenu}>
            {isUserLoading ? (
              <Loader size={20} />
            ) : (
              <>
                <span className="username">
                  {currentUser?.user?.username || t("Username")}
                </span>
                <ChevronDown />
              </>
            )}
          </button>
          {isUserMenuOpen && (
            <div className="user-menu-dropdown" ref={menuRef}>
              <div className="menu-item" onClick={toggleLanguage}>
                <img
                  src={
                    language === "ar"
                      ? "https://cdn-icons-png.flaticon.com/512/197/197374.png"
                      : "https://cdn-icons-png.flaticon.com/128/5111/5111777.png"
                  }
                  alt="flag"
                  className="flag-icon"
                />
                <span>{language === "ar" ? "English" : "عربي"}</span>
              </div>
              <div
                className="menu-item"
                onClick={handleLogout}
                style={{ cursor: isLogoutLoading ? "not-allowed" : "pointer" }}
              >
                {isLogoutLoading ? t("Logging Out...") : t("Logout")}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

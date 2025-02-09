import "./settings.scss";
import { useState, useEffect } from "react";
import {
  NavLink,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  Building2,
  MapPin,
  Receipt,
  Settings2,
  CreditCard,
  FileSpreadsheet,
  Wallet,
  UsersRound,
  BellPlus,
} from "lucide-react";

// Components
import Company from "../../components/settings/company/Company";
import Users from "../../components/settings/users/Users";
import Locations from "../../components/settings/locations/Locations";
import Taxes from "../../components/settings/taxes/Taxes";
import Configuration from "../../components/settings/configuration/Configuration";
import PaymentMethods from "../../components/settings/paymentMethods/PaymentMethods";
import CustomFields from "../../components/settings/customFields/CustomFields";
import Finance from "../../components/settings/finance/Finance";
import MySubscribtions from "../../components/settings/mySubscribtions/MySubscribtions";

function Settings() {
  const [activeTab, setActiveTab] = useState("company");
  const location = useLocation();

  // Update activeTab based on current route
  useEffect(() => {
    const path = location.pathname.split("/").pop();
    setActiveTab(path || "company");
  }, [location]);

  const navItems = [
    { id: "company", label: "Company Overview", icon: <Building2 size={20} /> },
    { id: "users", label: "Users", icon: <UsersRound size={20} /> },
    { id: "locations", label: "Locations", icon: <MapPin size={20} /> },
    { id: "taxes", label: "Taxes", icon: <Receipt size={20} /> },
    {
      id: "configuration",
      label: "Configuration",
      icon: <Settings2 size={20} />,
    },
    {
      id: "payment-methods",
      label: "Payment Methods",
      icon: <CreditCard size={20} />,
    },
    {
      id: "custom-fields",
      label: "Custom Fields",
      icon: <FileSpreadsheet size={20} />,
    },
    { id: "finance", label: "Finance", icon: <Wallet size={20} /> },
    {
      id: "my-subscription",
      label: "My Subscription",
      icon: <BellPlus size={20} />,
    },
  ];

  return (
    <div className="settings">
      <nav className="settings__nav">
        <div className="settings__nav-container">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={`/users-settings/${item.id}`}
              className={({ isActive }) =>
                `settings__nav-item ${
                  isActive ? "settings__nav-item--active" : ""
                }`
              }
            >
              {item.icon}
              <span className="settings__nav-label">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="settings__content">
        <Routes>
          <Route path="company" element={<Company />} />
          <Route path="users" element={<Users />} />
          <Route path="locations" element={<Locations />} />
          <Route path="taxes" element={<Taxes />} />
          <Route path="configuration" element={<Configuration />} />
          <Route path="payment-methods" element={<PaymentMethods />} />
          <Route path="custom-fields" element={<CustomFields />} />
          <Route path="finance" element={<Finance />} />
          <Route path="my-subscription" element={<MySubscribtions />} />
          <Route path="/" element={<Navigate to="company" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default Settings;

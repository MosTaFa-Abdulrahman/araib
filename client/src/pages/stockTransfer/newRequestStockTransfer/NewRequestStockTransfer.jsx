import "./newRequestStockTransfer.scss";
import { useState } from "react";
import { Save } from "lucide-react";
import Locations from "../../../components/newRequestStockTransfer/locations/Locations";
import Products from "../../../components/newRequestStockTransfer/products/Products";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// RTKQ
import toast from "react-hot-toast";

function NewRequestStockTransfer() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [locationsData, setLocationsData] = useState([]);

  // **************** ((Actions Buttons)) ******************* //
  const handleRequest = () => {
    console.log("Requested...");
    toast.success("Requested Successfully 😍");
  };

  const handleBack = () => {
    console.log("Backed...");
    toast.success("Backed Successfully 😁");
  };

  return (
    <>
      <div className={`newRequestStockTransfer ${theme}`}>
        <Locations
          selectedDestinations={selectedDestinations}
          setSelectedDestinations={setSelectedDestinations}
          setLocationsData={setLocationsData}
        />
        <Products
          selectedDestinations={selectedDestinations}
          locationsData={locationsData}
        />
      </div>

      {/* Actions Buttons */}
      <div className="action-buttonss">
        <button className="cancel-btn" onClick={handleBack}>
          {t("Back")}
        </button>

        <button className="save-btn" onClick={handleRequest}>
          <Save size={16} />
          {t("Request")}
        </button>
      </div>
    </>
  );
}

export default NewRequestStockTransfer;

import "./newStockTransfer.scss";
import { useState } from "react";
import { Save } from "lucide-react";
import Locations from "../../../components/newStockTransfer/locations/Locations";
import Products from "../../../components/newStockTransfer/products/Products";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// RTKQ
import toast from "react-hot-toast";

function NewStockTransfer() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [selectedSource, setSelectedSource] = useState("");
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [locationsData, setLocationsData] = useState([]);

  // ****************************** ((Actions Buttons)) ******************************** //
  const handleSave = () => {
    console.log("Saving...");
    toast.success("Created Successfully 😍");
  };

  const handleSaveAsDraft = () => {
    console.log("Saving as Draft...");
  };

  const handleCancel = () => {
    console.log("Cancelling...");
  };

  return (
    <>
      <div className={`newStockTransfer ${theme}`}>
        <Locations
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
          selectedDestinations={selectedDestinations}
          setSelectedDestinations={setSelectedDestinations}
          setLocationsData={setLocationsData}
        />
        <Products
          selectedSource={selectedSource}
          selectedDestinations={selectedDestinations}
          locationsData={locationsData}
        />
      </div>

      <div className="action-buttonss">
        <button className="cancel-btn" onClick={handleCancel}>
          {t("Cancel")}
        </button>
        <button className="save-new-btn" onClick={handleSaveAsDraft}>
          {t("Save Draft")}
        </button>
        <button className="save-btn" onClick={handleSave}>
          <Save size={16} />
          {t("Save")}
        </button>
      </div>
    </>
  );
}

export default NewStockTransfer;

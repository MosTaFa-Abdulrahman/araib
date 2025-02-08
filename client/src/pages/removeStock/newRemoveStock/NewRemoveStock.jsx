import "./newRemoveStock.scss";
import { useState } from "react";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// Components
import Details from "../../../components/newRemoveStock/details/Details";
import Products from "../../../components/newRemoveStock/products/Products";

// RTKQ
import toast from "react-hot-toast";

function NewRemoveStock() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [selectedLocation, setSelectedLocation] = useState("");

  // / *********************************/
  // Handle Save
  const handleSave = () => {
    console.log("Saving...");
    toast.success("Created Successfully 😍");
  };

  // Handle Cancel
  const handleCancel = () => {
    console.log("Cancelling...");
  };

  return (
    <div className={`newRemoveStock ${theme}`}>
      <Details onLocationSelect={(location) => setSelectedLocation(location)} />
      <Products selectedLocation={selectedLocation} />

      {/*  Actions-Buttons */}
      <div className="action-buttons">
        <button className="cancel-btn" onClick={handleCancel}>
          {t("Cancel")}
        </button>

        <button className="save-btn" onClick={handleSave}>
          <Save size={16} />
          {t("Save")}
        </button>
      </div>
    </div>
  );
}

export default NewRemoveStock;

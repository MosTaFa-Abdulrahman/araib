import "./newStockCount.scss";
import { useState } from "react";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// Components
import Details from "../../../components/newStockCount/details/Details";
import Products from "../../../components/newStockCount/products/Products";

// RTKQ
import toast from "react-hot-toast";

function NewStockCount() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [productsData, setProductsData] = useState(null);

  // Handle location selection from Details component
  const handleLocationSelect = (location) => {
    // Set the entire location object, not just the name
    setSelectedLocation(location);
  };

  // ************************* ((Actions Buttons)) ******************************* //
  //  Handle Save
  const handleSave = () => {
    if (!selectedLocation || !productsData) {
      toast.error(t("Please complete all required fields"));
      return;
    }
    console.log("Saving...", {
      location: selectedLocation,
      details: detailsData,
      products: productsData,
    });
    toast.success("Created Successfully 😍");
  };
  // Handle Cancel
  const handleCancel = () => {
    setSelectedLocation(null);
    setDetailsData(null);
    setProductsData(null);
  };

  return (
    <div className={`newStockCount ${theme}`}>
      <Details
        onLocationSelect={handleLocationSelect}
        onDataChange={setDetailsData}
      />
      <Products
        selectedLocation={selectedLocation}
        onDataChange={setProductsData}
      />

      {/* Actions Buttons */}
      <div className="action-buttons">
        <button className="cancel-btn" onClick={handleCancel}>
          {t("Cancel")}
        </button>

        <button
          className="save-btn"
          onClick={handleSave}
          disabled={
            !selectedLocation || !productsData?.selectedProducts?.length
          }
        >
          <Save size={16} />
          {t("Save")}
        </button>
      </div>
    </div>
  );
}

export default NewStockCount;

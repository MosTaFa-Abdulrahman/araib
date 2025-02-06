import "./digital.scss";
import { useState } from "react";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../context/ThemeContext";

// New Product Components
import Details from "../../newProductComp/productGlobal/details/Details";
import DigitalType from "../../newProductComp/digital/digitalType/DigitalType";
import Price from "../../newProductComp/digital/price/Price";
import Classification from "../../newProductComp/productGlobal/classification/Classification";

// RTKQ
import toast from "react-hot-toast";

function Digital() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [productDetails, setProductDetails] = useState({
    productName: "",
    sku: "",
    barcode: "",
    description: "",
    sellable: true,
    purchasable: true,
  });

  const handleProductDetailsChange = (newDetails) => {
    setProductDetails(newDetails);
  };

  // Handle Save
  const handleSave = () => {
    console.log("Saving...", {
      productDetails,
    });
    toast.success("Created Successfully 😍");
  };

  // Handle Save+New
  const handleSaveAndNew = () => {
    console.log("Saving and creating new...");
  };

  // Handle Cancel
  const handleCancel = () => {
    console.log("Cancelling...");
  };

  return (
    <div className={`digital ${theme}`}>
      {/* Product Details */}
      <Details
        productDetails={productDetails}
        onDetailsChange={handleProductDetailsChange}
        title={t("Digital Product Name")}
      />
      {/* Digital Product Type */}
      <DigitalType />

      {/* Price */}
      <Price productDetails={productDetails} />

      {/* Classification */}
      <Classification />

      {/* Buttons */}
      <div className="action-buttons">
        <button className="cancel-btn" onClick={handleCancel}>
          {t("Cancel")}
        </button>
        <button className="save-new-btn" onClick={handleSaveAndNew}>
          {t("Save and New")}
        </button>
        <button className="save-btn" onClick={handleSave}>
          <Save size={16} />
          {t("Save")}
        </button>
      </div>
    </div>
  );
}

export default Digital;

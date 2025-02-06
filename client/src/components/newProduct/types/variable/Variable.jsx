import "./variable.scss";
import { useState } from "react";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../context/ThemeContext";

// New Product Components
import Details from "../../newProductComp/productGlobal/details/Details";
import Options from "../../newProductComp/variable/variableOptions/options/Options";
import ProductsOptions from "../../newProductComp/variable/variableOptions/productsOptions/ProductsOptions";
import Packages from "../../newProductComp/variable/packages/Packages";
import Track from "../../newProductComp/productGlobal/track/Track";
import Price from "../../newProductComp/variable/price/Price";
import Classification from "../../newProductComp/productGlobal/classification/Classification";

// RTKQ
import toast from "react-hot-toast";

function Variable() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Details
  const [productDetails, setProductDetails] = useState({
    productName: "",
    description: "",
  });
  // Packages
  const [packages, setPackages] = useState([]);
  // Track
  const [trackDetails, setTrackDetails] = useState({
    isTracked: false,
    trackingType: null,
    stockDisabled: false,
  });
  // Options
  const [options, setOptions] = useState([]);
  // Variants from ProductsOptions
  const [variants, setVariants] = useState([]);

  // Handle Details
  const handleProductDetailsChange = (newDetails) => {
    setProductDetails(newDetails);
  };

  // Handle packages
  const handlePackagesChange = (newPackages) => {
    setPackages(newPackages);
  };

  // Handle Track
  const handleTrackDetailsChange = (newTrackDetails) => {
    setTrackDetails({
      ...newTrackDetails,
      stockDisabled: trackDetails.stockDisabled,
    });
  };

  // Handle Stock Disabled Change
  const handleStockDisabledChange = (isDisabled) => {
    setTrackDetails((prev) => ({
      ...prev,
      stockDisabled: isDisabled,
    }));
  };

  // Handle Variants Change
  const handleVariantsChange = (newVariants) => {
    setVariants(newVariants);
  };

  // / *********************************/
  // Handle Save
  const handleSave = () => {
    console.log("Saving...", {
      productDetails,
      variants,
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
    <div className={`variable ${theme}`}>
      {/* Product Details */}
      <Details
        productDetails={productDetails}
        onDetailsChange={handleProductDetailsChange}
        title={t("Variable Product Name")}
        type="variable"
      />

      {/* Options  */}
      <Options onOptionsChange={setOptions} />
      <ProductsOptions
        productDetails={productDetails}
        options={options}
        onVariantsChange={handleVariantsChange}
      />

      {/* Packages */}
      <Packages products={variants} onPackagesChange={handlePackagesChange} />

      {/* Track Type */}
      <Track
        onTrackChange={handleTrackDetailsChange}
        stockDisabled={trackDetails.stockDisabled}
      />

      {/* Prices */}
      <Price
        variants={variants}
        packages={packages}
        isTracked={trackDetails.isTracked}
        stockDisabled={trackDetails.stockDisabled}
        onStockDisabledChange={handleStockDisabledChange}
      />

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

export default Variable;

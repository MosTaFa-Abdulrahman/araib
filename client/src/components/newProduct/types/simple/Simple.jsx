import "./simple.scss";
import { useState } from "react";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";

// New Product Components
import Details from "../../newProductComp/productGlobal/details/Details";
import Packages from "../../newProductComp/simple/packages/Packages";
import Track from "../../newProductComp/productGlobal/track/Track";
import Price from "../../newProductComp/simple/price/Price";
import Classification from "../../newProductComp/productGlobal/classification/Classification";
import ShippingDetails from "../../newProductComp/productGlobal/shippingDetails/ShippingDetails";

// RTKQ
import toast from "react-hot-toast";

function Simple() {
  const { t } = useTranslation();

  // Details
  const [productDetails, setProductDetails] = useState({
    productName: "",
    sku: "",
    barcode: "",
    description: "",
    sellable: true,
    purchasable: true,
  });
  // New state for package names
  const [packageDetails, setPackageDetails] = useState([]);
  // Track
  const [trackDetails, setTrackDetails] = useState({
    isTracked: false,
    trackingType: null,
    stockDisabled: false,
  });

  // Handle Details
  const handleProductDetailsChange = (newDetails) => {
    setProductDetails(newDetails);
  };

  // Handle Package
  const handlePackageUpdate = (packages) => {
    setPackageDetails(packages);
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

  // / *********************************/
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
    <div className="simple">
      {/* Product Details */}
      <Details
        productDetails={productDetails}
        onDetailsChange={handleProductDetailsChange}
        title={t("Simple Product Name")}
      />

      {/* Packages */}
      <Packages
        productName={productDetails?.productName}
        onPackagesChange={handlePackageUpdate}
      />

      {/* Track Type */}
      <Track
        onTrackChange={handleTrackDetailsChange}
        stockDisabled={trackDetails.stockDisabled}
      />

      {/* Pricing */}
      <Price
        productDetails={productDetails}
        packageDetails={packageDetails}
        isTracked={trackDetails.isTracked}
        stockDisabled={trackDetails.stockDisabled}
        onStockDisabledChange={handleStockDisabledChange}
      />

      {/* Classification */}
      <Classification />

      {/* Shipping Details */}
      <ShippingDetails />

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

export default Simple;

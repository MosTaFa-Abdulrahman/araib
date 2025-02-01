import "./composite.scss";
import { useState } from "react";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";

// New Product Components
import Details from "../../newProductComp/productGlobal/details/Details";
import CompositeProducts from "../../newProductComp/composite/compositeProducts/CompositeProducts";
import CompositePrice from "../../newProductComp/composite/compositePrice/CompositePrice";
import Classification from "../../newProductComp/productGlobal/classification/Classification";
import ShippingDetails from "../../newProductComp/productGlobal/shippingDetails/ShippingDetails";

// RTKQ
import toast from "react-hot-toast";

function Composite() {
  const { t } = useTranslation();

  const [productDetails, setProductDetails] = useState({
    productName: "",
    sku: "",
    barcode: "",
    description: "",
    sellable: true,
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
    <div className="composite">
      {/* Product Details */}
      <Details
        productDetails={productDetails}
        onDetailsChange={handleProductDetailsChange}
        title={t("Composite Product Name")}
        type="composite"
      />

      {/* Composite Products */}
      <CompositeProducts />

      {/* Composite Price */}
      <CompositePrice productDetails={productDetails} />

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

export default Composite;

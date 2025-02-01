import "./newReturnInvoices.scss";
import { useState } from "react";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";

// Components
import Details from "../../../components/newReturnInvoices/details/Details";
import Products from "../../../components/newReturnInvoices/products/Products";
import Attachments from "../../../components/newReturnInvoices/attachments/Attachments";

// RTKQ
import { Return_PO } from "../../../dummyData";
import toast from "react-hot-toast";

function NewReturnInvoice() {
  const { t } = useTranslation();

  const [selectedLocation, setSelectedLocation] = useState("");
  const [purchaseOrderDetails, setPurchaseOrderDetails] = useState(null);

  // Handle PO Invoice Number Change
  const handlePOInvoiceSearch = (invoiceNumber) => {
    const foundPO = Return_PO.find((po) => po.invoiceNumber === invoiceNumber);

    if (foundPO) {
      setPurchaseOrderDetails(foundPO);

      // Set location
      const locationString = `${foundPO.supplier.code} ${foundPO.stockLocationName}`;
      setSelectedLocation(locationString);

      // Show success message
      toast.success(t("Purchase Order found! 😊"));
    } else {
      setPurchaseOrderDetails(null);
      toast.error(t("Purchase Order not found 😢"));
    }
  };

  // / *********************************/
  // Handle Save
  const handleSave = () => {
    console.log("Saving...");
    toast.success("Created Successfully 😍");
  };

  // Handle Save Draft
  const handleSaveAndNew = () => {
    console.log("Saving as Draft...");
  };

  // Handle Cancel
  const handleCancel = () => {
    console.log("Cancelling...");
  };

  return (
    <div className="newReturnInvoices">
      <Details
        onLocationSelect={(location) => setSelectedLocation(location)}
        onPOInvoiceSearch={handlePOInvoiceSearch}
        initialData={purchaseOrderDetails}
      />
      <Products
        selectedLocation={selectedLocation}
        purchaseOrderItems={purchaseOrderDetails?.stockOrderItems}
      />
      <Attachments />

      {/* Buttons */}
      <div className="action-buttons">
        <button className="cancel-btn" onClick={handleCancel}>
          {t("Cancel")}
        </button>
        <button className="save-new-btn" onClick={handleSaveAndNew}>
          {t("Save Draft")}
        </button>
        <button className="save-btn" onClick={handleSave}>
          <Save size={16} />
          {t("Save")}
        </button>
      </div>
    </div>
  );
}

export default NewReturnInvoice;

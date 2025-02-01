import "./newPurchaseOrder.scss";
import { useState } from "react";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";

// Components
import Details from "../../../components/newPurchaseOrder/details/Details";
import Products from "../../../components/newPurchaseOrder/products/Products";
import Attachments from "../../../components/newPurchaseOrder/attachments/Attachments";

// RTKQ
import toast from "react-hot-toast";

function NewPurchaseOrder() {
  const { t } = useTranslation();

  // Core state
  const [selectedLocation, setSelectedLocation] = useState("");
  const [detailsData, setDetailsData] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [attachmentsData, setAttachmentsData] = useState(null);

  // Transform products data to match the expected structure
  const transformProductsToOrderItems = (products, specialItems) => {
    if (!products) return [];

    return products.map((product) => {
      const trackItems = [];

      // Handle special items (batch/serial)
      if (specialItems && specialItems[product.id]) {
        trackItems.push(
          ...specialItems[product.id].map((item) => ({
            trackNumber: item.serialNumber,
            issueDate: item.issueDate,
            quantity: product.trackType === "serial" ? 1 : item.quantity,
            expiryDate: item.expirationDate,
            trackType: product.trackType,
            // Add additional required fields from dummy data
            id: Math.floor(Math.random() * 1000000),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            isTypeORMEntity: true,
            tenantId: 70705,
          }))
        );
      }

      // Calculate tax amounts
      const subTotalExclusive =
        Number(product.qty || 0) * Number(product.cost || 0);
      const taxRate = product.taxCode === "VAT" ? 0.15 : 0;
      const taxAmount = subTotalExclusive * taxRate;

      return {
        variantId: product.id,
        name: product.name,
        sku: product.sku,
        availableLocationQuantity: product.availableQty,
        requestedQuantity: Number(product.qty || 0),
        receivedQuantity: Number(product.qty || 0),
        buyPrice: Number(product.cost || 0),
        subTotalTaxExclusive: subTotalExclusive,
        totalTaxExclusive: subTotalExclusive,
        totalTaxInclusive: subTotalExclusive + taxAmount,
        totalTax: taxAmount,
        taxId: 2, // Default VAT tax ID from dummy data
        trackType: product.trackType || null,
        variantType: product.type || "child",
        stockOrderTrackedItems: trackItems,
        // Add required fields from dummy data
        id: Math.floor(Math.random() * 1000000),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        isTypeORMEntity: true,
        tenantId: 70705,
        defaultTaxConfig: {
          id: 2,
          code: "S",
          name: "VAT",
          rate: 15,
          TaxLines: [
            {
              id: 1,
              name: "Value Added Tax",
              rate: 15,
              taxId: 2,
              createdAt: null,
              deletedAt: null,
              updatedAt: null,
              taxLineConfig: null,
            },
          ],
          subtotal: 15,
        },
      };
    });
  };

  // Transform all data to match purchase invoice structure
  const transformToPurchaseInvoice = () => {
    if (!detailsData || !productsData) return null;

    const orderItems = transformProductsToOrderItems(
      productsData.selectedProducts,
      productsData.specialItems
    );

    // Calculate totals
    const subTotalExclusive = orderItems.reduce(
      (sum, item) => sum + item.subTotalTaxExclusive,
      0
    );
    const totalTax = orderItems.reduce((sum, item) => sum + item.totalTax, 0);
    const totalTaxInclusive =
      subTotalExclusive + totalTax - (productsData.discountAmount || 0);

    return {
      id: Math.floor(Math.random() * 1000000),
      invoiceNumber: `PO-${Date.now()}`,
      totalTaxInclusive,
      totalTax,
      paidAmount:
        productsData.paymentType === "paid"
          ? Number(productsData.paidAmount || 0)
          : 0,
      stockLocationId: selectedLocation,
      supplierId: detailsData.supplierDetails?.id,
      completeDate: new Date().toISOString(),
      status: "completed",
      notes: detailsData.notes || "",
      orderType: "PurchaseOrder",
      subTotalTaxExclusive: subTotalExclusive,
      stockLocationName: selectedLocation,
      expectedDeliveryDate: productsData.deliveryDate?.toISOString(),
      paymentDueDate: productsData.paymentDueDate?.toISOString(),
      issueDate: detailsData.issueDate?.toISOString(),
      supplierInvoiceNumber: detailsData.supplierInvoiceNumber || "",
      discountAmount: productsData.discountAmount || 0,
      discountType: productsData.discountType || "amount",
      paymentStatus: productsData.paymentType,
      stockOrderItems: orderItems,
      attachments: attachmentsData || [],
      // Add required fields from dummy data
      createdAt: new Date().toISOString(),
      grn: [],
      additionalCosts: [],
      metadata: {
        payment: null,
        taxType: "Exclusive",
        costCenterIds: [],
      },
    };
  };

  // Handle Save
  const handleSave = () => {
    if (!selectedLocation) {
      toast.error(t("Please select a location first 🙄"));
      return;
    }

    if (!productsData?.selectedProducts?.length) {
      toast.error(t("Please add at least one product 🙄"));
      return;
    }

    const purchaseInvoice = transformToPurchaseInvoice();
    if (!purchaseInvoice) {
      toast.error(t("Failed to prepare purchase invoice data"));
      return;
    }

    console.log("Saving Purchase Invoice:", purchaseInvoice);
    toast.success(t("Created Successfully 😍"));
  };

  // Handle Save Draft
  const handleSaveAndNew = () => {
    const draftInvoice = transformToPurchaseInvoice();
    if (draftInvoice) {
      draftInvoice.status = "draft";
      console.log("Saving Draft:", draftInvoice);
      toast.success(t("Saved as draft"));
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    if (
      window.confirm(
        t("Are you sure you want to cancel? All changes will be lost 😥")
      )
    ) {
      window.location.href = "/invoices/purchase-orders";
    }
  };

  return (
    <div className="newPurchaseOrder">
      <Details
        onLocationSelect={setSelectedLocation}
        onDataChange={setDetailsData}
      />

      <Products
        selectedLocation={selectedLocation}
        onDataChange={setProductsData}
      />

      <Attachments onFilesChange={setAttachmentsData} />

      <div className="action-buttons">
        <button className="cancel-btn" onClick={handleCancel}>
          {t("Cancel")}
        </button>
        <button className="save-new-btn" onClick={handleSaveAndNew}>
          {t("Save Draft")}
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

export default NewPurchaseOrder;

import "./products.scss";
import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  ChevronUp,
  Trash,
  Edit2,
  PackageSearch,
} from "lucide-react";
import InfoTooltip from "../../global/infoTooltip/InfoTooltip";
import MinusTooltip from "../../global/minusTooltip/MinusTooltip";
import { useTranslation } from "react-i18next";

// Modal (Batch + Serial)
import SpecialProductModal from "./specialProductModal/SpecialProductModal";

// Date Time
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Mock Data
import { mockSearchProductss, locations } from "../../../dummyData";
import toast from "react-hot-toast";

function Products({ selectedLocation, purchaseOrderItems }) {
  const { t } = useTranslation();

  // Modal States
  const [specialModalOpen, setSpecialModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Product States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [specialItems, setSpecialItems] = useState({});

  // UI States
  const [showTotals, setShowTotals] = useState(true);

  // Payment States
  const [paymentType, setPaymentType] = useState("paid");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [paymentDueDate, setPaymentDueDate] = useState(new Date());
  const [deliveryDate, setDeliveryDate] = useState(new Date());

  // Calculate Totals
  const [subTotal, setSubTotal] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  // Update products when PO items change
  useEffect(() => {
    if (purchaseOrderItems?.length > 0) {
      const transformedProducts = purchaseOrderItems.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        type: item.variantType,
        trackType: item.trackType,
        returnedQty: item.receivedQuantity,
        availableQty: item.availableLocationQuantity,
        returnCost: item.grossCost,
        taxCode: item.defaultTaxConfig.name,
        // Store exact values from PO
        totalTaxExclusive: Number(item.totalTaxExclusive),
        totalTax: Number(item.totalTax),
        totalTaxInclusive: Number(item.totalTaxInclusive),
        details: [
          {
            label: t("Available Qty"),
            subLabel: t("(Available in stock)"),
            value: String(item.availableLocationQuantity),
            isCurrency: false,
            translationKey: "Available Qty",
          },
          {
            label: t("Expected Qty"),
            subLabel: t("(Total will be available)"),
            value: String(item.availableLocationQuantity),
            isCurrency: false,
            translationKey: "Expected Qty",
          },
          {
            label: t("Average Cost"),
            subLabel: t("(Tax Exclusive)"),
            value: String(item.averageCost),
            isCurrency: true,
            translationKey: "Average Cost",
          },
          {
            label: t("Buy Price"),
            value: String(item.buyPrice),
            isCurrency: true,
            translationKey: "Buy Price",
          },
          {
            label: t("Total Cost"),
            subLabel: t("(Tax Exclusive)"),
            value: String(item.totalTaxExclusive),
            isCurrency: true,
            translationKey: "Total Cost",
          },
          {
            label: t("Tax Amount"),
            value: String(item.totalTax),
            isCurrency: true,
            translationKey: "Tax Amount",
          },
          {
            label: t("Total Cost"),
            subLabel: t("(Tax Inclusive)"),
            value: String(item.totalTaxInclusive),
            isCurrency: true,
            translationKey: "Total Cost",
          },
        ],
      }));

      setSelectedProducts(transformedProducts);

      // Calculate initial totals
      let initialSubTotal = transformedProducts.reduce(
        (sum, item) => sum + Number(item.totalTaxExclusive || 0),
        0
      );
      let initialTotalTax = transformedProducts.reduce(
        (sum, item) => sum + Number(item.totalTax || 0),
        0
      );

      setSubTotal(Number(initialSubTotal.toFixed(2)));
      setTotalTax(Number(initialTotalTax.toFixed(2)));
      setFinalTotal(Number((initialSubTotal + initialTotalTax).toFixed(2)));
    }
  }, [purchaseOrderItems]);

  // Search Effect
  useEffect(() => {
    if (searchTerm.length > 0) {
      const results = mockSearchProductss.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.includes(searchTerm)
      );
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm]);

  // Update credit amount effect
  useEffect(() => {
    const remaining = finalTotal - (Number(paidAmount) || 0);
    setCreditAmount(remaining.toFixed(2));
  }, [finalTotal, paidAmount]);

  // Handle Delete Product
  const handleDeleteProduct = (productId) => {
    setSelectedProducts((prevProducts) => {
      // Filter out the deleted product
      const updatedProducts = prevProducts.filter((p) => p.id !== productId);

      // If all products are deleted, reset totals to 0
      if (updatedProducts.length === 0) {
        setSubTotal(0);
        setTotalTax(0);
        setFinalTotal(0);
        return [];
      }

      // Calculate new totals
      let newSubTotal = 0;
      let newTotalTax = 0;

      updatedProducts.forEach((product) => {
        // Check if the product is from PO
        const poItem = purchaseOrderItems?.find(
          (item) => item.id === product.id
        );

        if (poItem) {
          // For PO items, use the stored values directly
          newSubTotal += Number(product.totalTaxExclusive || 0);
          newTotalTax += Number(product.totalTax || 0);
        } else {
          // For regular products
          const qty = Number(product.returnedQty || 0);
          const cost = Number(product.returnCost || 0);
          const totalCost = qty * cost;

          newSubTotal += totalCost;
          if (product.taxCode === "VAT") {
            newTotalTax += totalCost * 0.15; // 15% VAT
          }
        }
      });

      // Update totals with 2 decimal precision
      setSubTotal(Number(newSubTotal.toFixed(2)));
      setTotalTax(Number(newTotalTax.toFixed(2)));
      setFinalTotal(Number((newSubTotal + newTotalTax).toFixed(2)));

      return updatedProducts;
    });

    // Clean up special items if needed
    setSpecialItems((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  // Remove this duplicate useEffect
  useEffect(() => {
    if (purchaseOrderItems?.length > 0) {
      // Calculate totals from PO items
      let subTotalExclusive = 0;
      let totalTaxAmount = 0;

      purchaseOrderItems.forEach((item) => {
        subTotalExclusive += item.totalTaxExclusive;
        totalTaxAmount += item.totalTax;
      });

      // Update the states
      setSubTotal(subTotalExclusive);
      setTotalTax(totalTaxAmount);
      setFinalTotal(subTotalExclusive + totalTaxAmount);
    }
  }, [purchaseOrderItems]); // Remove this

  // Handle Search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Find product location data based on selected location
  const findLocationData = (product) => {
    const locationCode = selectedLocation?.split(" ")[0];
    const selectedLocationId = locations.find(
      (loc) => loc.code === locationCode
    )?.id;

    return product.ProductVariantToStockLocations.find(
      (location) => location.stockLocationId === selectedLocationId
    );
  };

  // Format tracking data
  const formatTrackingData = (item, selectedLocationId) => {
    // If it's from PO data
    if (item.stockOrderTrackedItems?.length) {
      return {
        ProductVariantToStockLocations: [
          {
            stockLocationId: selectedLocationId,
            VariantToTracks: item.stockOrderTrackedItems.map((track) => ({
              trackNo: track.trackNumber,
              quantity: track.quantity,
              expiryDate: track.expiryDate,
              issueDate: track.issueDate,
            })),
          },
        ],
      };
    }

    // If it's from search data
    if (item.ProductVariantToStockLocations) {
      const locationData = item.ProductVariantToStockLocations.find(
        (loc) => loc.stockLocationId === selectedLocationId
      );

      if (locationData?.VariantToTracks?.length) {
        return {
          ProductVariantToStockLocations: [
            {
              stockLocationId: selectedLocationId,
              VariantToTracks: locationData.VariantToTracks.map((track) => ({
                trackNo: track.trackNo,
                quantity: track.quantity,
                expiryDate: track.expiryDate,
                issueDate: track.issueDate,
              })),
            },
          ],
        };
      }
    }

    return null;
  };

  // Update products when location changes
  useEffect(() => {
    if (selectedLocation && selectedProducts.length > 0) {
      const updatedProducts = selectedProducts.map((product) => {
        // Find the original product data
        const originalProduct = mockSearchProductss.find(
          (p) => p.id === product.id
        );
        if (!originalProduct) return product;

        // Get new location data
        const locationData = findLocationData(originalProduct);
        const availableQty = locationData?.quantity || 0;

        // Reset returned quantity and cost if they exceed new limits
        const newReturnedQty =
          product.returnedQty > availableQty ? 0 : product.returnedQty;

        // Update product details
        return {
          ...product,
          availableQty,
          returnedQty: newReturnedQty,
          taxCode: locationData?.Tax?.name || t("VAT"),
          details: [
            {
              label: t("Available Qty"),
              subLabel: t("(Available in stock)"),
              value: String(availableQty),
              isCurrency: false,
              translationKey: "Available Qty",
            },
            {
              label: t("Expected Qty"),
              subLabel: t("(Total will be available)"),
              value: String(availableQty),
              isCurrency: false,
              translationKey: "Expected Qty",
            },
            {
              label: t("Average Cost"),
              subLabel: t("(Tax Exclusive)"),
              value: String(locationData?.cost || 0),
              isCurrency: true,
              translationKey: "Average Cost",
            },
            {
              label: t("Buy Price"),
              value: String(locationData?.buyPrice || 0),
              isCurrency: true,
              translationKey: "Buy Price",
            },
            {
              label: t("Total Cost"),
              subLabel: t("(Tax Exclusive)"),
              value: String(
                calculateTotalCost(newReturnedQty, product.returnCost)
              ),
              isCurrency: true,
              translationKey: "Total Cost",
            },
            {
              label: t("Tax Amount"),
              value: String(
                calculateTaxAmount(
                  newReturnedQty,
                  product.returnCost,
                  locationData?.Tax
                )
              ),
              isCurrency: true,
              translationKey: "Tax Amount",
            },
            {
              label: t("Total Cost"),
              subLabel: t("(Tax Inclusive)"),
              value: String(
                calculateTotalCostInclusive(
                  newReturnedQty,
                  product.returnCost,
                  locationData?.Tax
                )
              ),
              isCurrency: true,
              translationKey: "Total Cost",
            },
          ],
        };
      });

      setSelectedProducts(updatedProducts);

      // Clear special items if quantities are no longer valid
      const newSpecialItems = { ...specialItems };
      let hasChanges = false;

      Object.entries(specialItems).forEach(([productId, items]) => {
        const product = updatedProducts.find(
          (p) => p.id.toString() === productId
        );
        if (product) {
          const totalSpecialQty = items.reduce((sum, item) => {
            if (product.trackType === "batch") {
              return sum + Number(item.quantity || 0);
            }
            return sum + 1;
          }, 0);

          if (totalSpecialQty > product.availableQty) {
            delete newSpecialItems[productId];
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        setSpecialItems(newSpecialItems);
        toast.warning(
          t(
            "Some batch/serial quantities have been reset due to location change 🤗"
          )
        );
      }
    }
  }, [selectedLocation]);

  // Update the handleProductSelect function
  const handleProductSelect = (product) => {
    if (!selectedLocation) {
      toast.error(t("Please select a location first 😎"));
      return;
    }

    if (!selectedProducts.find((p) => p.id === product.id)) {
      const locationData = findLocationData(product);
      const availableQty = locationData?.quantity || 0;

      const transformedProduct = {
        id: product.id,
        name: product.name,
        sku: product.sku,
        type: product.type,
        trackType: product.trackType,
        returnedQty: 0,
        availableQty: availableQty,
        returnCost: 0,
        taxCode: locationData?.Tax?.name || t("VAT"),
        // Add tracking information
        ProductVariantToStockLocations: [
          {
            stockLocationId: locationData?.stockLocationId,
            VariantToTracks: locationData?.VariantToTracks || [],
          },
        ],
        details: [
          {
            label: t("Available Qty"),
            subLabel: t("(Available in stock)"),
            value: String(availableQty),
            isCurrency: false,
            translationKey: "Available Qty",
          },
          {
            label: t("Expected Qty"),
            subLabel: t("(Total will be available)"),
            value: String(availableQty),
            isCurrency: false,
            translationKey: "Expected Qty",
          },
          {
            label: t("Average Cost"),
            subLabel: t("(Tax Exclusive)"),
            value: String(locationData?.cost || 0),
            isCurrency: true,
            translationKey: "Average Cost",
          },
          {
            label: t("Buy Price"),
            value: String(locationData?.buyPrice || 0),
            isCurrency: true,
            translationKey: "Buy Price",
          },
          {
            label: t("Total Cost"),
            subLabel: t("(Tax Exclusive)"),
            value: "0.00",
            isCurrency: true,
            translationKey: "Total Cost",
          },
          {
            label: t("Tax Amount"),
            value: "0.00",
            isCurrency: true,
            translationKey: "Tax Amount",
          },
          {
            label: t("Total Cost"),
            subLabel: t("(Tax Inclusive)"),
            value: "0.00",
            isCurrency: true,
            translationKey: "Total Cost",
          },
        ],
      };
      setSelectedProducts([...selectedProducts, transformedProduct]);
    }
    setSearchTerm("");
    setShowSearchResults(false);
  };

  // Helper Calculations
  const calculateTotalCost = (qty, cost) => {
    return (Number(qty) * Number(cost)).toFixed(2);
  };

  const calculateTaxAmount = (qty, cost, tax) => {
    const totalCost = Number(qty) * Number(cost);
    return (totalCost * ((tax?.rate || 0) / 100)).toFixed(2);
  };

  const calculateTotalCostInclusive = (qty, cost, tax) => {
    const totalCost = Number(qty) * Number(cost);
    const taxAmount = totalCost * ((tax?.rate || 0) / 100);
    return (totalCost + taxAmount).toFixed(2);
  };

  // Calculate totals effect
  useEffect(() => {
    calculateTotals();
  }, [selectedProducts]);

  // Handlers
  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Update the updateProductDetails function
  const updateProductDetails = (
    productId,
    returnedQty,
    returnCost,
    taxCode
  ) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === productId) {
          // Validate returned quantity against available quantity
          let qty = Number(returnedQty ?? product.returnedQty) || 0;
          if (qty > product.availableQty) {
            toast.error(
              t("Returned quantity cannot exceed available quantity 😏")
            );
            qty = product.availableQty;
          }

          const cost =
            returnCost !== undefined ? Number(returnCost) : product.returnCost;
          const newTaxCode = taxCode || product.taxCode;

          let updatedDetails = [...product.details];
          const totalCostExclusive = qty * cost;
          const taxAmount =
            newTaxCode === "VAT" ? totalCostExclusive * 0.15 : 0;
          const totalCostInclusive = totalCostExclusive + taxAmount;

          // Update Expected Qty to match Available Qty
          updatedDetails = updatedDetails.map((detail) => {
            if (detail.translationKey === "Expected Qty") {
              const expectedQty = product.availableQty - qty;
              return {
                ...detail,
                value: String(Math.max(0, expectedQty)),
              };
            }
            if (
              detail.label === "Total Cost" &&
              detail.subLabel === "(Tax Exclusive)"
            ) {
              return { ...detail, value: totalCostExclusive.toFixed(2) };
            }
            if (detail.label === "Tax Amount") {
              return { ...detail, value: taxAmount.toFixed(2) };
            }
            if (
              detail.label === "Total Cost" &&
              detail.subLabel === "(Tax Inclusive)"
            ) {
              return { ...detail, value: totalCostInclusive.toFixed(2) };
            }
            return detail;
          });

          return {
            ...product,
            returnedQty: qty,
            returnCost: cost,
            taxCode: newTaxCode,
            details: updatedDetails,
          };
        }
        return product;
      })
    );
  };

  // Handle Special Product
  const handleSpecialProduct = (product) => {
    if (!product.returnedQty) {
      toast.error(t("Please enter returned quantity first 😎"));
      return;
    }

    // Get selected location ID
    const locationCode = selectedLocation?.split(" ")[0];
    const selectedLocationId = locations.find(
      (loc) => loc.code === locationCode
    )?.id;

    let trackingData;
    let existingTrackingItems = [];

    // First try to find in PO items
    if (purchaseOrderItems) {
      const poItem = purchaseOrderItems.find((p) => p.id === product.id);
      if (poItem) {
        trackingData = formatTrackingData(poItem, selectedLocationId);

        // Create pre-filled items
        existingTrackingItems =
          poItem.stockOrderTrackedItems?.map((track) => ({
            serialNumber: track.trackNumber,
            quantity: track.quantity,
            expirationDate: new Date(track.expiryDate),
            issueDate: new Date(track.issueDate),
          })) || [];

        setSpecialItems((prev) => ({
          ...prev,
          [product.id]: existingTrackingItems,
        }));
      }
    }

    // If not found in PO, try search data
    if (!trackingData) {
      const searchItem = mockSearchProductss.find((p) => p.id === product.id);
      if (searchItem) {
        trackingData = formatTrackingData(searchItem, selectedLocationId);
      }
    }

    if (!trackingData) {
      toast.error(t("Product information not found 😢"));
      return;
    }

    setSelectedProduct({
      ...product,
      ...trackingData,
      existingTrackingItems,
    });
    setSpecialModalOpen(true);
  };

  // Update the special items handling
  const handleSpecialItemsSave = (items) => {
    if (!selectedProduct) return;

    setSpecialItems({
      ...specialItems,
      [selectedProduct.id]: items,
    });

    const totalQty = items.reduce((sum, item) => {
      if (selectedProduct.trackType === "batch") {
        return sum + Number(item.quantity || 0);
      }
      return sum + 1;
    }, 0);

    updateProductDetails(selectedProduct.id, totalQty);
  };

  // Handle Calculate Total
  const calculateTotals = () => {
    let newSubTotal = 0;
    let newTotalTax = 0;

    selectedProducts.forEach((product) => {
      // Find the original PO item
      const poItem = purchaseOrderItems?.find((item) => item.id === product.id);

      if (poItem) {
        // For PO items, use the original values
        const qty = Number(poItem.receivedQuantity || 0);
        const cost = Number(poItem.grossCost || 0);
        const totalTaxExclusive = qty * cost;
        const totalTax = totalTaxExclusive * 0.15; // 15% VAT

        newSubTotal += totalTaxExclusive;
        newTotalTax += totalTax;
      } else {
        // For regular products
        const qty = Number(product.returnedQty || 0);
        const cost = Number(product.returnCost || 0);
        const totalCost = qty * cost;

        newSubTotal += totalCost;
        if (product.taxCode === "VAT") {
          newTotalTax += totalCost * 0.15;
        }
      }
    });

    setSubTotal(Number(newSubTotal.toFixed(2)));
    setTotalTax(Number(newTotalTax.toFixed(2)));
    setFinalTotal(Number((newSubTotal + newTotalTax).toFixed(2)));
  };

  // Handle Fomat Currency
  const formatCurrency = (value) => {
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ************************* ((Rendered)) ************************** //
  // Handle RenderReturnQuantity
  const renderReturnQuantity = (product) => {
    // Check if this is a special product (either ecard type or has trackType)
    const isSpecialProduct =
      product?.Product?.type == "ecard" || product.trackType;

    if (isSpecialProduct) {
      const items = specialItems[product.id] || [];
      const hasItems = items.length > 0;
      const totalQty = hasItems
        ? items.reduce((sum, item) => {
            if (product.trackType === "batch") {
              return sum + Number(item.quantity || 0);
            }
            return sum + 1; // For both serial and ecard, count each item as 1
          }, 0)
        : 0;

      if (hasItems) {
        return (
          <div className="specialProductQty">
            <span>{totalQty}</span>
            <button
              className="editButton"
              onClick={() => handleSpecialProduct(product)}
              title={`Edit ${
                product.Product?.type === "ecard" ? "eCard" : product.trackType
              } Details`}
            >
              <Edit2 size={16} />
            </button>
          </div>
        );
      }

      return (
        <div className="returnQuantityContainer">
          <input
            type="number"
            value={product.returnedQty || ""}
            onChange={(e) => updateProductDetails(product.id, e.target.value)}
            className="qtyInput"
            placeholder={t("Enter Returned Quantity")}
            required
          />
          <MinusTooltip
            title={`Add ${
              product.Product?.type === "ecard" ? "eCard" : product.trackType
            } Details`}
            onClick={() => handleSpecialProduct(product)}
            disabled={!selectedLocation || !product.returnedQty}
          />
        </div>
      );
    }

    return (
      <input
        type="number"
        value={product.returnedQty || ""}
        onChange={(e) => updateProductDetails(product.id, e.target.value)}
        className="qtyInput"
        placeholder={t("Enter Returned Quantity")}
        required
      />
    );
  };

  return (
    <div className="productsContainer">
      {/* Top */}
      <div className="topContainer">
        <h3>{t("Products")}</h3>
        <InfoTooltip
          title={t(
            "Products Qty, the average product cost and the latest buying price are updated after completing the purchase Invoice"
          )}
        />
      </div>

      {/* Search */}
      <div className="searchContainer">
        <div className="plusCont">
          <div className="leftSearch">
            <Search size={18} color="gray" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={t("Type Product Name or SKU")}
            />
            {showSearchResults && searchResults.length > 0 && (
              <div className="searchResults">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="searchResultItem"
                    onClick={() => handleProductSelect(product)}
                  >
                    <span className="name">{product.name}</span>
                    <span className="sku">{product.sku}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      {selectedProducts.length > 0 ? (
        <div className="productsTable">
          <table>
            <thead>
              <tr>
                <th>{t("Product Name / SKU")}</th>
                <th>{t("Returned Quantity")}</th>
                <th>
                  <div className="costHeader">
                    <span>{t("Return Cost (Tax Exclusive)")}</span>
                  </div>
                </th>
                <th>{t("Tax Code")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {selectedProducts.map((product) => (
                <React.Fragment key={product.id}>
                  <tr className="productRow">
                    <td>
                      <div className="productInfo">
                        <button
                          className="expandButton"
                          onClick={() => toggleRow(product.id)}
                        >
                          {expandedRows.has(product.id) ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronRight size={20} />
                          )}
                        </button>
                        <div className="nameContainer">
                          <span className="name">{product.name}</span>
                          <span className="sku">{product.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td>{renderReturnQuantity(product)}</td>
                    <td>
                      <input
                        type="number"
                        value={product.returnCost || ""}
                        onChange={(e) =>
                          updateProductDetails(
                            product.id,
                            product.returnedQty,
                            e.target.value
                          )
                        }
                        className="costInput"
                        placeholder={t("Enter Returned Cost")}
                        required
                        min={1}
                      />
                    </td>
                    <td>
                      <select
                        className="taxCodeSelect"
                        value={product.taxCode}
                        onChange={(e) =>
                          updateProductDetails(
                            product.id,
                            product.returnedQty,
                            product.returnCost,
                            e.target.value
                          )
                        }
                      >
                        <option value="VAT">{t("VAT")}</option>
                        <option value="Not Subject to Tax">
                          {t("Not Subject to Tax")}
                        </option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="deleteButton"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>

                  {/* Expanded  */}
                  {expandedRows.has(product.id) && (
                    <tr className="detailsRow">
                      <td colSpan="5">
                        <div className="detailsContent">
                          <div className="tableGrid">
                            <div className="emptyColumn"></div>
                            <div className="detailsGrid">
                              <div className="detailsColumn">
                                {product.details
                                  .filter(
                                    (detail) =>
                                      detail.translationKey ===
                                        "Available Qty" ||
                                      detail.translationKey === "Expected Qty"
                                  )
                                  .map((detail, idx) => (
                                    <div key={idx} className="detailItem">
                                      <div className="labelWrapper">
                                        <span className="mainLabel">
                                          {detail.label}
                                        </span>
                                        {detail.subLabel && (
                                          <span className="subLabel">
                                            {detail.subLabel}
                                          </span>
                                        )}
                                      </div>
                                      <span className="value">
                                        {detail.value}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                              <div className="detailsColumn">
                                {product.details
                                  .filter(
                                    (detail) =>
                                      detail.translationKey ===
                                        "Average Cost" ||
                                      detail.translationKey === "Buy Price"
                                  )
                                  .map((detail, idx) => (
                                    <div key={idx} className="detailItem">
                                      <div className="labelWrapper">
                                        <span className="mainLabel">
                                          {detail.label}
                                        </span>
                                        {detail.subLabel && (
                                          <span className="subLabel">
                                            {detail.subLabel}
                                          </span>
                                        )}
                                      </div>
                                      <span className="value">
                                        {detail.value}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                              <div className="detailsColumn">
                                {product.details
                                  .filter(
                                    (detail) =>
                                      detail.translationKey === "Total Cost" ||
                                      detail.translationKey === "Tax Amount"
                                  )
                                  .map((detail, idx) => (
                                    <div key={idx} className="detailItem">
                                      <div className="labelWrapper">
                                        <span className="mainLabel">
                                          {detail.label}
                                        </span>
                                        {detail.subLabel && (
                                          <span className="subLabel">
                                            {detail.subLabel}
                                          </span>
                                        )}
                                      </div>
                                      <span className="value">
                                        {detail.value}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Total Section */}
          <div className="totalSectionWrapper">
            <button
              className="toggleTotals"
              onClick={() => setShowTotals(!showTotals)}
            >
              {showTotals ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {showTotals && (
              <div className="totalSection">
                <div className="totalRow">
                  <span>{t("Sub Total (Tax Exclusive)")}</span>
                  <span>{formatCurrency(subTotal)}</span>
                </div>
                <div className="totalRow tax">
                  <span>{t("Total Tax")}</span>
                  <span>+ {formatCurrency(totalTax)}</span>
                </div>
                <div className="totalRow final">
                  <span>{t("Total (Tax Inclusive)")}</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="paymentSection">
            <div className="paymentOptions">
              <label className="radioLabel">
                <input
                  type="radio"
                  checked={paymentType === "paid"}
                  onChange={() => setPaymentType("paid")}
                  name={t("paymentType")}
                />
                <span>{t("Paid")}</span>
              </label>
              <label className="radioLabel">
                <input
                  type="radio"
                  checked={paymentType === "later"}
                  onChange={() => setPaymentType("later")}
                  name={t("paymentType")}
                />
                <span>{t("Will be paid later")}</span>
              </label>
            </div>

            {paymentType === "paid" && (
              <div className="paidDetails">
                <div className="inputGroup">
                  <label>{t("Payment Method")}</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="methodSelect"
                  >
                    <option value="">{t("Select a method")}</option>
                    <option value="cash">{t("Cash")}</option>
                    <option value="credit">{t("Credit Card")}</option>
                  </select>
                </div>
                <div className="inputGroup">
                  <label>{t("Paid Amount")}</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="amountInput"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            <div className="creditAmount">
              <label>{t("Credit Amount")}</label>
              <span className="amount">{formatCurrency(creditAmount)}</span>
            </div>

            <div className="dateGroup">
              <div className="inputGroup">
                <label>{t("Payment Due Date")}</label>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={paymentDueDate}
                    onChange={(date) => setPaymentDueDate(date)}
                    className="datePicker"
                    format="dd/MM/yyyy"
                  />
                </LocalizationProvider>
              </div>
              <div className="inputGroup">
                <label>{t("Products Delivery Date")}</label>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={deliveryDate}
                    onChange={(date) => setDeliveryDate(date)}
                    className="datePicker"
                    format="dd/MM/yyyy"
                  />
                </LocalizationProvider>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="emptyContent">
          <PackageSearch size={200} strokeWidth={0.6} />
          <p>
            {t(
              "Search for products that you would like to include in your purchase Invoice"
            )}
          </p>
        </div>
      )}

      {/* Modal For (Batch + Serial) */}
      <SpecialProductModal
        isOpen={specialModalOpen}
        onClose={() => {
          setSpecialModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={handleSpecialItemsSave}
        existingItems={
          selectedProduct ? specialItems[selectedProduct.id] || [] : []
        }
        returnedQuantity={selectedProduct?.returnedQty || 0}
      />
    </div>
  );
}

export default Products;

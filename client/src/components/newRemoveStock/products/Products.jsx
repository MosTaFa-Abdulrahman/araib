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
import { useTheme } from "../../../context/ThemeContext";

// Modal (Batch + Serial + E-Card)
import SpecialProductModal from "./specialProductModal/SpecialProductModal";

// Mock Data
import { mockSearchProductss, locations } from "../../../dummyData";
import toast from "react-hot-toast";

function Products({ selectedLocation }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

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

  // Calculate Totals
  const [subTotal, setSubTotal] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

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

  // Handle Delete Product
  const handleDeleteProduct = (productId) => {
    setSelectedProducts((prevProducts) => {
      const updatedProducts = prevProducts.filter((p) => p.id !== productId);

      if (updatedProducts.length === 0) {
        setSubTotal(0);
        setTotalTax(0);
        setFinalTotal(0);
        return [];
      }

      calculateTotals(updatedProducts);
      return updatedProducts;
    });

    setSpecialItems((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

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
    if (item.Product?.type === "ecard") {
      return {
        ...item,
        Ecards: item.Ecards?.filter((card) => !card.isSold) || [],
      };
    }

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
        const originalProduct = mockSearchProductss.find(
          (p) => p.id === product.id
        );
        if (!originalProduct) return product;

        const locationData = findLocationData(originalProduct);
        const availableQty = locationData?.quantity || 0;
        const newReturnedQty =
          product.returnedQty > availableQty ? 0 : product.returnedQty;

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
      calculateTotals(updatedProducts);

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

  // Handle Product Select
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
    calculateTotals(selectedProducts);
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

  // Update Product Details
  const updateProductDetails = (
    productId,
    returnedQty,
    returnCost,
    taxCode
  ) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === productId) {
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

    const locationCode = selectedLocation?.split(" ")[0];
    const selectedLocationId = locations.find(
      (loc) => loc.code === locationCode
    )?.id;

    const searchItem = mockSearchProductss.find((p) => p.id === product.id);

    // Handle both tracking types and e-cards
    const trackingData = formatTrackingData(searchItem, selectedLocationId);

    if (!trackingData) {
      toast.error(t("Product information not found 😢"));
      return;
    }

    setSelectedProduct({
      ...product,
      ...trackingData,
    });
    setSpecialModalOpen(true);
  };

  // Update Special Items
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

  // Calculate Totals
  const calculateTotals = (products = selectedProducts) => {
    let newSubTotal = 0;
    let newTotalTax = 0;

    products.forEach((product) => {
      const qty = Number(product.returnedQty || 0);
      const cost = Number(product.returnCost || 0);
      const totalCost = qty * cost;

      newSubTotal += totalCost;
      if (product.taxCode === "VAT") {
        newTotalTax += totalCost * 0.15; // 15% VAT
      }
    });

    setSubTotal(Number(newSubTotal.toFixed(2)));
    setTotalTax(Number(newTotalTax.toFixed(2)));
    setFinalTotal(Number((newSubTotal + newTotalTax).toFixed(2)));
  };

  // Format Currency
  const formatCurrency = (value) => {
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // *************** ((Render)) ****************** //
  // Render Return Quantity
  const renderReturnQuantity = (product) => {
    // Handle both serial/batch tracking and e-cards
    if (product.trackType || product.Product?.type === "ecard") {
      const items = specialItems[product.id] || [];
      const hasItems = items.length > 0;
      const totalQty = hasItems
        ? items.reduce((sum, item) => {
            if (product.trackType === "batch") {
              return sum + Number(item.quantity || 0);
            }
            return sum + 1;
          }, 0)
        : 0;

      if (hasItems) {
        return (
          <div className="specialProductQty">
            <span>{totalQty}</span>
            <button
              className="editButton"
              onClick={() => handleSpecialProduct(product)}
              title={
                product?.Product?.type == "ecard"
                  ? "Edit E-Card Numbers"
                  : `Edit ${product.trackType} Details`
              }
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
            value={product?.returnedQty || ""}
            onChange={(e) => updateProductDetails(product.id, e.target.value)}
            className="qtyInput"
            placeholder={t("Enter Returned Quantity")}
            required
          />
          <MinusTooltip
            title={
              product?.Product?.type == "ecard"
                ? "Add E-Card Numbers"
                : `Add ${product.trackType} Details`
            }
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
    <div className={`productsContainer ${theme}`}>
      {/* Top */}
      <div className="topContainer">
        <h3>{t("Products")}</h3>
        <InfoTooltip
          title={t(
            "Products Qty, the average product cost and the latest buying price are updated after completing the remove Invoice"
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

                  {/* Expanded Row */}
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

      {/* Modal For (Batch + Serial + E-Card) */}
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

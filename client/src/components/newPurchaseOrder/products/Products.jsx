import "./products.scss";
import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Search,
  X,
  ChevronUp,
  Plus,
  Trash,
  Edit2,
  PackageSearch,
  RotateCw,
} from "lucide-react";
import InfoTooltip from "../../global/infoTooltip/InfoTooltip";
import PlusTooltip from "../../global/plusTooltip/PlusTooltip";
import Modal from "../../global/modal/Modal";
import { useTranslation } from "react-i18next";

// Modal (Batch + Serial + Ecard)
import SpecialProductModal from "./specialProductModal/SpecialProductModal";

// Date Time
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Mock Data
import { mockSearchProductss, locations } from "../../../dummyData";
import toast from "react-hot-toast";

function Products({ selectedLocation, onDataChange }) {
  const { t } = useTranslation();

  // Modal States
  const [modalProduct, setModalProduct] = useState(false);
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
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");

  // Tax State
  const [taxTypeValue, setTaxTypeValue] = useState("taxExclusive");

  // Payment States
  const [paymentType, setPaymentType] = useState("paid");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [paymentDueDate, setPaymentDueDate] = useState(new Date());
  const [deliveryDate, setDeliveryDate] = useState(new Date());

  // Product Form States
  const [productDetails, setProductDetails] = useState({
    productName: "",
    sku: "",
    retailPrice: 0,
  });

  // Calculate Totals
  const [subTotal, setSubTotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
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

  // Calculate totals effect
  useEffect(() => {
    calculateTotals();
  }, [selectedProducts, discountValue, discountType]);

  // Update credit amount effect
  useEffect(() => {
    const remaining = finalTotal - (Number(paidAmount) || 0);
    setCreditAmount(remaining.toFixed(2));
  }, [finalTotal, paidAmount]);

  // Generate SKU
  const generateSKU = () => {
    const randomNum = Math.floor(Math.random() * 100000000000);
    setProductDetails({
      ...productDetails,
      sku: randomNum.toString().padStart(11, "0"),
    });
  };

  // Clear SKU
  const clearSKU = () => {
    setProductDetails({
      ...productDetails,
      sku: "",
    });
  };

  // Handle Search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Finding location data
  const findLocationData = (product, selectedLocation) => {
    const locationId = locations.find(
      (loc) => loc.name === selectedLocation
    )?.id;

    if (!locationId) return null;

    return product.ProductVariantToStockLocations.find(
      (loc) => loc.stockLocationId === locationId
    );
  };

  // Handle Update ProductDetailsWithLocation
  const updateProductDetailsWithLocation = (product, selectedLocation) => {
    const locationData = findLocationData(product, selectedLocation);

    if (!locationData) return product;

    const availableQty = locationData.quantity;

    return {
      ...product,
      qty: 0,
      availableQty,
      cost: 0,
      taxCode: locationData.Tax?.name || "VAT",
      details: [
        {
          label: "Available Qty",
          subLabel: "(Available in stock)",
          value: String(availableQty),
          isCurrency: false,
          translationKey: "Available Qty",
        },
        {
          label: "Expected Qty",
          subLabel: "(Total will be available)",
          value: String(availableQty),
          isCurrency: false,
          translationKey: "Expected Qty",
        },
        {
          label: "Average Cost",
          subLabel: "(Tax Exclusive)",
          value: String(locationData.cost),
          isCurrency: true,
          translationKey: "Average Cost",
        },
        {
          label: "Buy Price",
          value: String(locationData.buyPrice),
          isCurrency: true,
          translationKey: "Buy Price",
        },
        {
          label: "Total Cost",
          subLabel: "(Tax Exclusive)",
          value: "0.00",
          isCurrency: true,
          translationKey: "Total Cost",
        },
        {
          label: "Tax Amount",
          value: "0.00",
          isCurrency: true,
          translationKey: "Tax Amount",
        },
        {
          label: "Total Cost",
          subLabel: "(Tax Inclusive)",
          value: "0.00",
          isCurrency: true,
          translationKey: "Total Cost",
        },
      ],
    };
  };

  const calculateProductTotals = (product) => {
    const qty = Number(product.qty) || 0;
    const cost = Number(product.cost) || 0;
    const totalCost = qty * cost;
    const taxAmount = product.taxCode === "VAT" ? totalCost * 0.15 : 0;

    return {
      exclusive: totalCost,
      tax: taxAmount,
      inclusive: totalCost + taxAmount,
    };
  };

  // Update products when location changes
  useEffect(() => {
    if (selectedLocation && selectedProducts.length > 0) {
      const updatedProducts = selectedProducts.map((product) => {
        const originalProduct = mockSearchProductss.find(
          (p) => p.id === product.id
        );
        if (!originalProduct) return product;

        const locationData = findLocationData(
          originalProduct,
          selectedLocation
        );
        const availableQty = locationData?.quantity || 0;

        // Update product details with new location data
        return {
          ...product,
          availableQty,
          details: product.details.map((detail) => {
            switch (detail.translationKey) {
              case "Available Qty":
                return { ...detail, value: String(availableQty) };
              case "Expected Qty":
                return { ...detail, value: String(availableQty + product.qty) };
              case "Average Cost":
                return { ...detail, value: String(locationData?.cost || 0) };
              case "Buy Price":
                return {
                  ...detail,
                  value: String(locationData?.buyPrice || 0),
                };
              default:
                return detail;
            }
          }),
        };
      });

      setSelectedProducts(updatedProducts);
    }
  }, [selectedLocation]);

  // Update the handleProductSelect function
  const handleProductSelect = (product) => {
    if (!selectedLocation) {
      toast.error(t("Please select location first 😎"));
      return;
    }

    if (!selectedProducts.find((p) => p.id === product.id)) {
      const locationData = findLocationData(product, selectedLocation);
      if (!locationData) return;

      const transformedProduct = updateProductDetailsWithLocation(
        product,
        selectedLocation
      );
      setSelectedProducts([...selectedProducts, transformedProduct]);
    }
    setSearchTerm("");
    setShowSearchResults(false);
  };

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
  const updateProductDetails = (productId, newQty, newCost, newTaxCode) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === productId) {
          // Convert to number and handle empty input
          const qty = newQty === "" ? "" : Number(newQty);
          const cost = newCost !== undefined ? Number(newCost) : product.cost;
          const taxCode = newTaxCode || product.taxCode;

          // Only update quantities and calculations if there's a valid number
          if (qty !== "") {
            const expectedQty = qty + product.availableQty;
            const totals = calculateProductTotals({
              ...product,
              qty,
              cost,
              taxCode,
            });

            return {
              ...product,
              qty,
              cost: newCost !== undefined ? cost : product.cost,
              taxCode,
              details: product.details.map((detail) => {
                switch (detail.translationKey) {
                  case "Expected Qty":
                    return { ...detail, value: String(expectedQty) };
                  case "Total Cost":
                    if (detail.subLabel === "(Tax Exclusive)") {
                      return { ...detail, value: totals.exclusive.toFixed(2) };
                    } else if (detail.subLabel === "(Tax Inclusive)") {
                      return { ...detail, value: totals.inclusive.toFixed(2) };
                    }
                    return detail;
                  case "Tax Amount":
                    return { ...detail, value: totals.tax.toFixed(2) };
                  default:
                    return detail;
                }
              }),
            };
          }

          // Return product with empty qty but don't update calculations
          return {
            ...product,
            qty: qty,
          };
        }
        return product;
      })
    );
  };

  // Handle Special Product
  const handleSpecialProduct = (product) => {
    setSelectedProduct(product);
    setSpecialModalOpen(true);
  };

  // Update the special items handling
  const handleSpecialItemsSave = (items) => {
    if (!selectedProduct) return;

    // Update special items
    const updatedSpecialItems = {
      ...specialItems,
      [selectedProduct.id]: items,
    };
    setSpecialItems(updatedSpecialItems);

    // Calculate total quantity based on product type
    let totalQty = 0;

    if (selectedProduct.Product?.type === "ecard") {
      // For ecards, each item counts as 1
      totalQty = items.length;
    } else if (selectedProduct.trackType === "batch") {
      // For batch products, sum up the quantities
      totalQty = items.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );
    } else {
      // For serial products, each item counts as 1
      totalQty = items.length;
    }

    // Update product details with new quantity
    updateProductDetails(
      selectedProduct.id,
      totalQty,
      undefined, // keep existing cost
      undefined // keep existing tax code
    );

    // Close modal after successful save
    setSpecialModalOpen(false);
    setSelectedProduct(null);
  };

  // Calculate Final Totals
  const calculateTotals = () => {
    let subTotalExclusive = 0;
    let totalTaxAmount = 0;

    selectedProducts.forEach((product) => {
      const exclusive = product.details.find(
        (d) => d.label === "Total Cost" && d.subLabel === "(Tax Exclusive)"
      );
      const tax = product.details.find((d) => d.label === "Tax Amount");

      if (exclusive) {
        subTotalExclusive += Number(exclusive.value);
      }
      if (tax) {
        totalTaxAmount += Number(tax.value);
      }
    });

    let calculatedDiscountAmount = 0;
    if (showDiscount && discountValue) {
      calculatedDiscountAmount =
        discountType === "percentage"
          ? (subTotalExclusive * Number(discountValue)) / 100
          : Number(discountValue);
    }

    setSubTotal(subTotalExclusive);
    setTotalTax(totalTaxAmount);
    setDiscountAmount(calculatedDiscountAmount);
    setFinalTotal(
      subTotalExclusive + totalTaxAmount - calculatedDiscountAmount
    );
  };

  // Fomat Currency
  const formatCurrency = (value) => {
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  //  *********************** (Rendered) ******************************* //
  //  Handle Render SpecialProductQuantity
  const renderSpecialProductQuantity = (product) => {
    // Check if product is an ecard type
    if (product.Product?.type === "ecard") {
      // Check if this ecard has been added to specialItems
      const hasSpecialItems = specialItems[product.id]?.length > 0;

      if (hasSpecialItems) {
        const totalQty = specialItems[product.id].length;
        return (
          <div className="specialProductQty">
            <span>{totalQty}</span>
            <button
              className="editButton"
              onClick={(e) => {
                e.preventDefault();
                handleSpecialProduct(product);
              }}
              title="Edit eCard Details"
              type="button"
            >
              <Edit2 size={16} />
            </button>
          </div>
        );
      }

      // Show PlusTooltip if no items have been added yet
      return (
        <div className={!selectedLocation ? "disabled-tooltip" : ""}>
          <PlusTooltip
            title={
              selectedLocation
                ? "Add eCard Details"
                : t("Please select location first")
            }
            onClick={(e) => {
              e.preventDefault();
              if (selectedLocation) {
                handleSpecialProduct(product);
              }
            }}
            disabled={!selectedLocation}
          />
        </div>
      );
    }

    // Handle existing batch/serial logic
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
            onClick={(e) => {
              e.preventDefault();
              handleSpecialProduct(product);
            }}
            title={`Edit ${product.trackType} Details`}
            type="button"
          >
            <Edit2 size={16} />
          </button>
        </div>
      );
    }

    return (
      <div className={!selectedLocation ? "disabled-tooltip" : ""}>
        <PlusTooltip
          title={
            selectedLocation
              ? `Add ${product.trackType} Details`
              : t("Please select location first")
          }
          onClick={(e) => {
            e.preventDefault();
            if (selectedLocation) {
              handleSpecialProduct(product);
            }
          }}
          disabled={!selectedLocation}
        />
      </div>
    );
  };

  //  *** Pass All Data to Father (NewPurchaseOrder)  ***
  useEffect(() => {
    onDataChange({
      selectedProducts,
      subTotal,
      discountAmount,
      totalTax,
      finalTotal,
      paymentType,
      paymentMethod,
      paidAmount,
      creditAmount,
      paymentDueDate,
      deliveryDate,
      specialItems,
    });
  }, [
    selectedProducts,
    subTotal,
    discountAmount,
    totalTax,
    finalTotal,
    paymentType,
    paymentMethod,
    paidAmount,
    creditAmount,
    paymentDueDate,
    deliveryDate,
    specialItems,
    onDataChange,
  ]);

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
          <PlusTooltip
            title="Add Product"
            onClick={() => setModalProduct(true)}
          />
        </div>
        <div className="rightSearch">
          <button className="importContainer">
            <Download size={18} />
            <p>{t("Import Products")} </p>
          </button>
        </div>
      </div>

      {/* Products Table */}
      {selectedProducts.length > 0 ? (
        <div className="productsTable">
          <table>
            <thead>
              <tr>
                <th>{t("Product Name / SKU")}</th>
                <th>{t("New QTY")}</th>
                <th>
                  <div className="costHeader">
                    <span>{t("New Cost")}</span>
                    <select
                      className="taxSelect"
                      value={taxTypeValue}
                      onChange={(e) => setTaxTypeValue(e.target.value)}
                    >
                      <option value="taxExclusive">{t("Tax Exclusive")}</option>
                      <option value="taxInclusive">{t("Tax Inclusive")}</option>
                    </select>
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
                    <td>
                      {product.trackType ||
                      product.Product?.type === "ecard" ? (
                        renderSpecialProductQuantity(product)
                      ) : (
                        <input
                          type="number"
                          value={product.qty || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || !isNaN(value)) {
                              updateProductDetails(product.id, value);
                            }
                          }}
                          className="qtyInput"
                          placeholder={t("Enter Quantity")}
                          min="1"
                        />
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        // value={product?.cost || ""}
                        onChange={(e) =>
                          updateProductDetails(
                            product.id,
                            product.qty,
                            e.target.value,
                            product.taxCode
                          )
                        }
                        className="costInput"
                        placeholder={t("Enter Cost")}
                        min={1}
                      />
                    </td>
                    <td>
                      <select
                        className="taxCodeSelect"
                        value={product.taxCode}
                        onChange={(e) => {
                          const newTaxCode = e.target.value;
                          updateProductDetails(
                            product.id,
                            product.qty,
                            product.cost,
                            newTaxCode
                          );
                        }}
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
                        onClick={() => {
                          setSelectedProducts(
                            selectedProducts.filter((p) => p.id !== product.id)
                          );
                          const updatedSpecialItems = { ...specialItems };
                          delete updatedSpecialItems[product.id];
                          setSpecialItems(updatedSpecialItems);
                        }}
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

          {/* Discount Section */}
          {showDiscount ? (
            <div className="discountSection">
              <div className="discountHeader">
                <h4>{t("Discount Amount")}</h4>
                <button
                  className="deleteDiscount"
                  onClick={() => {
                    setShowDiscount(false);
                    setDiscountValue("");
                    calculateTotals();
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="discountOptions">
                <label className="radioLabel">
                  <input
                    type="radio"
                    checked={discountType === "percentage"}
                    onChange={() => setDiscountType("percentage")}
                    name="discountType"
                  />
                  <span>{t("Percentage")}</span>
                </label>
                <label className="radioLabel">
                  <input
                    type="radio"
                    checked={discountType === "specific"}
                    onChange={() => setDiscountType("specific")}
                    name="discountType"
                  />
                  <span>{t("Specific Amount")}</span>
                </label>
              </div>
              <div className="discountInputWrapper">
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="discountInput"
                  placeholder={
                    discountType === "percentage" ? "0.00 %" : "0.00 amount"
                  }
                />
                {discountType === "percentage" && (
                  <span className="percentageSymbol">%</span>
                )}
              </div>
            </div>
          ) : (
            <button
              className="addDiscountButton"
              onClick={() => setShowDiscount(true)}
            >
              <Plus size={16} />
              <span>{t("Add Discount")}</span>
            </button>
          )}

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
                <div className="totalRow discount">
                  <span>{t("Discount Amount")}</span>
                  <span>
                    {discountAmount > 0
                      ? `- ${formatCurrency(discountAmount)}`
                      : formatCurrency(0)}
                  </span>
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

      {/* Create Product Modal */}
      <Modal isOpen={modalProduct} onClose={() => setModalProduct(false)}>
        <div className="productCreate">
          <h2>{t("Add Product")}</h2>
          <p>
            {t(
              "Initial Qty and initial cost will be counted from the purchase invoice info"
            )}
          </p>

          <form
            className="product-form"
            onSubmit={(e) => {
              e.preventDefault();
              setModalProduct(false);
            }}
          >
            <div className="form-group">
              <label htmlFor="productName">
                <span className="required">*</span> {t("Product Name")}
              </label>
              <input
                type="text"
                id="productName"
                value={productDetails.productName}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    productName: e.target.value,
                  })
                }
                placeholder={t("Enter product name")}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sku">
                <span className="required">*</span> {t("SKU")}
              </label>
              <div className="sku-input">
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="sku"
                    value={productDetails.sku}
                    onChange={(e) =>
                      setProductDetails({
                        ...productDetails,
                        sku: e.target.value,
                      })
                    }
                    placeholder={t("Enter SKU")}
                    required
                  />
                  {productDetails.sku && (
                    <button
                      type="button"
                      className="clear-sku"
                      onClick={clearSKU}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className="generate-sku"
                  onClick={generateSKU}
                >
                  <RotateCw size={16} />
                  {t("Auto-Generate SKU")}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="retailPrice">{t("Retail price")}</label>
              <input
                type="number"
                id="retailPrice"
                value={productDetails.retailPrice}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    retailPrice: e.target.value,
                  })
                }
                placeholder="0.00"
                min={1}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setModalProduct(false)}
              >
                {t("Cancel")}
              </button>
              <button type="submit" className="btn-add">
                {t("Add")}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal For (Batch + Serial + Ecard) */}
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
      />
    </div>
  );
}

export default Products;

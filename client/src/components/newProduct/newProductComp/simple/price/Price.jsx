import "./price.scss";
import { useState, useEffect } from "react";
import { ChevronDown, Copy } from "lucide-react";
import InfoTooltip from "../../../../global/infoTooltip/InfoTooltip";
import { useTranslation } from "react-i18next";

// RTKQ
import toast from "react-hot-toast";

function Price({
  productDetails,
  packageDetails = [],
  isTracked,
  stockDisabled,
  onStockDisabledChange,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const [locations] = useState(["default", "Elbasha"]);
  const [expandedLocations, setExpandedLocations] = useState({
    default: true,
    Elbasha: false,
  });
  const [weightedProduct, setWeightedProduct] = useState(false);
  const [priceData, setPriceData] = useState({});

  // Initialize price data for all items and locations
  useEffect(() => {
    const initialData = {};
    locations.forEach((location) => {
      initialData[location] = {};
      const allItems = [
        {
          id: "main",
          name: productDetails?.productName || "",
          type: "Product",
        },
        ...(packageDetails || []).map((pack) => ({
          id: pack.id,
          name: pack.packName,
          type: "Pack",
          packSize: pack.packSize,
        })),
      ];

      allItems.forEach((item) => {
        initialData[location][item.id] = {
          initialQuantity: "0.00",
          retailPrice: "0.00",
          wholesalePrice: "0.00",
          buyPrice: "0.00",
          initialCost: "0.00",
          taxType: "VAT",
        };
      });
    });
    setPriceData(initialData);
  }, [productDetails, packageDetails, locations]);

  // Reset values when stock is disabled
  useEffect(() => {
    if (stockDisabled) {
      const updatedData = { ...priceData };
      locations.forEach((location) => {
        Object.keys(updatedData[location]).forEach((itemId) => {
          updatedData[location][itemId] = {
            ...updatedData[location][itemId],
            initialQuantity: "0.00",
            initialCost: "0.00",
          };
        });
      });
      setPriceData(updatedData);
    }
  }, [stockDisabled, locations, priceData]);

  // Handle field change for items
  const handleFieldChange = (location, itemId, field, value) => {
    const updatedData = { ...priceData };
    updatedData[location][itemId] = {
      ...updatedData[location][itemId],
      [field]: value,
    };

    // If this is the main product's initial quantity, update related package quantities
    if (field === "initialQuantity" && itemId === "main") {
      packageDetails?.forEach((pack) => {
        const productQuantity = parseFloat(value) || 0;
        const packSize = parseInt(pack.packSize) || 1;
        const packQuantity = Math.floor(productQuantity / packSize);

        updatedData[location][pack.id] = {
          ...updatedData[location][pack.id],
          initialQuantity: packQuantity.toString(),
        };
      });
    }

    setPriceData(updatedData);
  };

  // Handle copy functionality
  const handleCopy = (fromLocation) => {
    const newPriceData = { ...priceData };
    const sourceData = priceData[fromLocation];

    locations.forEach((location) => {
      if (location !== fromLocation) {
        newPriceData[location] = JSON.parse(JSON.stringify(sourceData));
      }
    });

    setPriceData(newPriceData);
    toast.success(t("Copied successfully!"));
  };

  // Toggle location expansion
  const toggleLocation = (location) => {
    setExpandedLocations((prev) => ({
      ...prev,
      [location]: !prev[location],
    }));
  };

  return (
    <div className={`price-container ${isRTL ? "rtl" : "ltr"}`}>
      <div className="price-header">
        <h2>{t("Stock and Pricing Details")}</h2>
        <InfoTooltip
          title={t("Manage product stock and pricing information")}
        />
      </div>

      <div className="cost-field">
        <label>{t("Cost")}</label>
        <input type="number" className="cost-input" placeholder={t("Cost")} />
      </div>

      <div className="management-options">
        <label
          className={`checkbox-label ${
            isTracked || weightedProduct ? "disabled" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={stockDisabled}
            onChange={(e) => onStockDisabledChange(e.target.checked)}
            disabled={isTracked || weightedProduct}
          />
          <span>{t("Disable stock management")}</span>
          <InfoTooltip title={t("Disable stock tracking for this product")} />
        </label>

        <label className={`checkbox-label ${stockDisabled ? "disabled" : ""}`}>
          <input
            type="checkbox"
            checked={weightedProduct}
            onChange={(e) => setWeightedProduct(e.target.checked)}
            disabled={stockDisabled}
          />
          <span>{t("Weighted scale product")}</span>
          <InfoTooltip title={t("Enable for products sold by weight")} />
        </label>
      </div>

      {locations.map((location) => (
        <div key={location} className="location-section">
          <div
            className="location-header"
            onClick={() => toggleLocation(location)}
          >
            <span>{location}</span>
            <div className="header-actions">
              <button
                className="copy-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(location);
                }}
              >
                <Copy size={14} />
                <span>{t("Copy")}</span>
              </button>
              <ChevronDown
                size={20}
                className={expandedLocations[location] ? "rotated" : ""}
              />
            </div>
          </div>

          {expandedLocations[location] && (
            <div className="price-grid">
              <div className="grid-header">
                <div>{t("Product / Packs")}</div>
                <div>
                  {t("Initial Quantity")} {weightedProduct ? t("(kg)") : ""}
                </div>
                <div>
                  {t("Retail Price")} {weightedProduct ? t("(kg)") : ""}
                  <InfoTooltip
                    title={t(
                      "This field accepts up to 2 digits after the decimal point. The entered price will be reflected in the POS and reports."
                    )}
                  />
                </div>
                <div>
                  {t("Wholesale Price")} {weightedProduct ? t("(kg)") : ""}
                  <InfoTooltip
                    title={t(
                      "This field accepts up to 2 digits after the decimal point. The entered price will be reflected in the POS and reports."
                    )}
                  />
                </div>
                <div>
                  {t("Buy Price")} {weightedProduct ? t("(kg)") : ""}
                </div>
                <div>
                  {t("Initial Cost")} {weightedProduct ? t("(kg)") : ""}
                </div>
                <div>{t("Tax Type")}</div>
              </div>

              {[
                {
                  id: "main",
                  name: productDetails?.productName,
                  type: "Product",
                },
                ...(packageDetails || []).map((pack) => ({
                  id: pack.id,
                  name: pack.packName,
                  type: "Pack",
                })),
              ].map((item) => (
                <div key={item.id} className="grid-row">
                  <div className="item-name">{item.name}</div>
                  <div>
                    <input
                      type="number"
                      value={
                        priceData[location]?.[item.id]?.initialQuantity ||
                        "0.00"
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          location,
                          item.id,
                          "initialQuantity",
                          e.target.value
                        )
                      }
                      disabled={
                        item.type === "Pack" || stockDisabled || isTracked
                      }
                      min="0"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={
                        priceData[location]?.[item.id]?.retailPrice || "0.00"
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          location,
                          item.id,
                          "retailPrice",
                          e.target.value
                        )
                      }
                      min="0"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={
                        priceData[location]?.[item.id]?.wholesalePrice || "0.00"
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          location,
                          item.id,
                          "wholesalePrice",
                          e.target.value
                        )
                      }
                      min="0"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={priceData[location]?.[item.id]?.buyPrice || "0.00"}
                      onChange={(e) =>
                        handleFieldChange(
                          location,
                          item.id,
                          "buyPrice",
                          e.target.value
                        )
                      }
                      min="0"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={
                        priceData[location]?.[item.id]?.initialCost || "0.00"
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          location,
                          item.id,
                          "initialCost",
                          e.target.value
                        )
                      }
                      disabled={item.type === "Pack" || stockDisabled}
                      min="0"
                    />
                  </div>
                  <div>
                    <select
                      value={priceData[location]?.[item.id]?.taxType || "VAT"}
                      onChange={(e) =>
                        handleFieldChange(
                          location,
                          item.id,
                          "taxType",
                          e.target.value
                        )
                      }
                      disabled={item.type === "Pack"}
                    >
                      <option value="VAT">{t("VAT")}</option>
                      <option value="NONE">{t("Not Subject to Tax")}</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Price;

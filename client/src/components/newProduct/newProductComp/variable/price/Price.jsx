import "./price.scss";
import { useState, useEffect } from "react";
import { ChevronDown, Copy } from "lucide-react";
import InfoTooltip from "../../../../global/infoTooltip/InfoTooltip";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

function Price({
  variants,
  packages,
  isTracked,
  stockDisabled,
  onStockDisabledChange,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const [activeTab, setActiveTab] = useState("all");
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
      [...(variants || []), ...(packages || [])].forEach((item) => {
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
  }, [variants, packages]);

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
  }, [stockDisabled]);

  // Handle field change for items
  const handleFieldChange = (location, itemId, field, value) => {
    const updatedData = { ...priceData };
    updatedData[location][itemId] = {
      ...updatedData[location][itemId],
      [field]: value,
    };

    // If this is a variant's initial quantity, update related package quantities
    if (field === "initialQuantity" && variants?.find((v) => v.id === itemId)) {
      const relatedPackages = packages?.filter(
        (p) => p.baseProduct.id === itemId
      );

      relatedPackages?.forEach((pack) => {
        const variantQuantity = parseFloat(value) || 0;
        const packSize = parseInt(pack.packSize) || 1;
        const result = variantQuantity / packSize;
        // Round down to nearest whole number
        const packQuantity = Math.floor(result);

        updatedData[location][pack.id] = {
          ...updatedData[location][pack.id],
          initialQuantity: packQuantity, // Just the whole number
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
    toast.success("Copied Success 🤩!");
  };

  // Toggle location expansion
  const toggleLocation = (location) => {
    setExpandedLocations((prev) => ({
      ...prev,
      [location]: !prev[location],
    }));
  };

  // Get filtered items based on active tab
  const getFilteredItems = () => {
    const allItems = [
      ...(variants || []).map((v) => ({ ...v, type: "Variant" })),
      ...(packages || []).map((p) => ({ ...p, type: "Pack" })),
    ];

    switch (activeTab) {
      case "variants":
        return allItems.filter((item) => item.type === "Variant");
      case "packs":
        return allItems.filter((item) => item.type === "Pack");
      default:
        return allItems;
    }
  };

  return (
    <div className="price-container">
      <div className="price-header">
        <h2>{t("Stock and Pricing Details")}</h2>
        <InfoTooltip
          title={t("Manage product stock and pricing information")}
        />
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

      <div className="tabs">
        <button
          className={`tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          {t("All")}
        </button>
        <button
          className={`tab ${activeTab === "variants" ? "active" : ""}`}
          onClick={() => setActiveTab("variants")}
        >
          {t("Variants")}
        </button>
        <button
          className={`tab ${activeTab === "packs" ? "active" : ""}`}
          onClick={() => setActiveTab("packs")}
        >
          {t("Packs")}
        </button>
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
                <div>{t("Variants or Packs")}</div>
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

              {getFilteredItems().map((item) => (
                <div key={item.id} className="grid-row">
                  <div className="item-name">
                    {item.type === "Variant" ? item.name : item.packName}
                  </div>
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

import "./productsOptions.scss";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  Image as ImageIcon,
  X,
  Plus,
} from "lucide-react";
import InfoTooltip from "../../../../../global/infoTooltip/InfoTooltip";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../../../context/ThemeContext";

function ProductsOptions({ productDetails, options, onVariantsChange }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [expandedSections, setExpandedSections] = useState({});
  const [variants, setVariants] = useState([]);

  // Generate Combinations
  const generateCombinations = (arrays) => {
    if (arrays.length === 0) return [[]];
    const result = [];
    const restCombinations = generateCombinations(arrays.slice(1));
    for (const item of arrays[0].values) {
      for (const combination of restCombinations) {
        result.push([{ name: arrays[0].name, value: item }, ...combination]);
      }
    }
    return result;
  };

  // Create Variants
  const createVariants = (currentOptions) => {
    if (!currentOptions || currentOptions.length === 0) return [];

    const variants = generateCombinations(currentOptions);
    return variants.map((variant, index) => ({
      id: `variant-${index}`,
      name: `${productDetails?.productName || t("Product")} - ${variant
        .map((v) => v.value)
        .join(" - ")}`,
      sku: generateSKU(),
      barcode: "",
      variant: variant,
      sellable: true,
      purchasable: true,
      image: null,
    }));
  };

  // Generate SKU
  const generateSKU = () => {
    return Math.floor(Math.random() * 100000000000)
      .toString()
      .padStart(11, "0");
  };

  useEffect(() => {
    const newVariants = createVariants(options);
    setVariants(newVariants);
    onVariantsChange(newVariants);

    const colorSections = {};
    newVariants.forEach((variant) => {
      const color = variant.variant.find(
        (v) => v.name.toLowerCase() === "color"
      )?.value;
      if (color) {
        colorSections[color] = true;
      }
    });
    setExpandedSections(colorSections);
  }, [options, productDetails]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle Variant Change
  const handleVariantChange = (variantId, field, value) => {
    const updatedVariants = variants.map((variant) =>
      variant.id === variantId ? { ...variant, [field]: value } : variant
    );
    setVariants(updatedVariants);
    onVariantsChange(updatedVariants);
  };

  // Re Generate SKU
  const regenerateSKU = (variantId) => {
    handleVariantChange(variantId, "sku", generateSKU());
  };

  // Handle Image Upload
  const handleImageUpload = (variantId, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleVariantChange(variantId, "image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove Image Upload
  const removeImage = (variantId) => {
    handleVariantChange(variantId, "image", null);
  };

  // Group variants by color
  const variantsByColor = variants.reduce((acc, variant) => {
    const color =
      variant.variant.find((v) => v.name.toLowerCase() === "color")?.value ||
      t("Other");
    if (!acc[color]) acc[color] = [];
    acc[color].push(variant);
    return acc;
  }, {});

  // Colors
  const colorTagStyles = {
    red: "bg-red-50 text-red-800",
    blue: "bg-blue-50 text-blue-800",
    black: "bg-gray-800 text-white",
    green: "bg-green-50 text-green-800",
    yellow: "bg-yellow-50 text-yellow-800",
  };

  return (
    <div className={`products-options ${theme}`}>
      {Object.entries(variantsByColor).map(([color, colorVariants]) => (
        <div key={color} className="color-section">
          <div className="color-header" onClick={() => toggleSection(color)}>
            <div className="color-label">
              <span
                className={`color-tag ${
                  colorTagStyles[color.toLowerCase()] ||
                  "bg-gray-50 text-gray-800"
                }`}
              >
                {color}
              </span>
            </div>
            <button className="expand-button">
              {expandedSections[color] ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
          </div>

          {expandedSections[color] &&
            colorVariants.map((variant) => (
              <div key={variant.id} className="variant-item">
                <div className="variant-grid">
                  {/* Image Upload */}
                  <div className="image-upload-container">
                    <input
                      type="file"
                      id={`image-${variant.id}`}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(variant.id, e)}
                      className="hidden-input"
                    />
                    {variant.image ? (
                      <div className="image-preview">
                        <img src={variant.image} alt={t("Product variant")} />
                        <button
                          onClick={() => removeImage(variant.id)}
                          className="remove-image"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor={`image-${variant.id}`}
                        className="image-placeholder"
                      >
                        <ImageIcon size={24} />
                      </label>
                    )}
                  </div>

                  {/* Variant Details */}
                  <div className="fields-container">
                    <div className="field-row">
                      {/* Variant Name */}
                      <div className="field-group">
                        <div className="field-label">
                          <span className="required">{t("Variant Name")}</span>
                          <InfoTooltip title={t("Enter the variant name")} />
                        </div>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "name",
                              e.target.value
                            )
                          }
                          className="input"
                        />
                      </div>

                      {/* SKU */}
                      <div className="field-group">
                        <div className="field-label">
                          <span className="required">{t("SKU")}</span>
                          <InfoTooltip title={t("Product SKU identifier")} />
                        </div>
                        <div className="sku-input">
                          <input
                            type="text"
                            value={variant.sku}
                            onChange={(e) =>
                              handleVariantChange(
                                variant.id,
                                "sku",
                                e.target.value
                              )
                            }
                            className="input"
                          />
                          <button
                            onClick={() => regenerateSKU(variant.id)}
                            className="refresh-button"
                          >
                            <RefreshCcw size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Barcode */}
                      <div className="field-group">
                        <div className="field-label">
                          <span>{t("Barcode")}</span>
                          <InfoTooltip title={t("Enter product barcode")} />
                        </div>
                        <input
                          type="text"
                          value={variant.barcode}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "barcode",
                              e.target.value
                            )
                          }
                          className="input"
                        />
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={variant.sellable}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "sellable",
                              e.target.checked
                            )
                          }
                        />
                        <span>{t("Sellable")}</span>
                        <InfoTooltip
                          title={t(
                            "Uncheck this option if you only want to sell the product in a composite product."
                          )}
                        />
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={variant.purchasable}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "purchasable",
                              e.target.checked
                            )
                          }
                        />
                        <span>{t("Purchasable")}</span>
                        <InfoTooltip
                          title={t(
                            "Uncheck this option if this is a service, for example."
                          )}
                        />
                      </label>
                    </div>

                    {/* Add More Details Link */}
                    <div className="more-details">
                      <button className="more-details-button">
                        <Plus size={15} /> {t("Details")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

export default ProductsOptions;

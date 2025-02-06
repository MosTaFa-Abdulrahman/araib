import "./packages.scss";
import { useState } from "react";
import { RefreshCcw, X, Image as ImageIcon } from "lucide-react";
import InfoTooltip from "../../../../global/infoTooltip/InfoTooltip";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../../context/ThemeContext";

function Packages({ products, onPackagesChange }) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isRTL = i18n.dir() === "rtl";

  const [packSizes, setPackSizes] = useState([]);
  const [newPackSize, setNewPackSize] = useState("");
  const [packages, setPackages] = useState([]);
  const [canCreatePacks, setCanCreatePacks] = useState(false);

  // Update Packages
  const updatePackages = (newPackages) => {
    setPackages(newPackages);
    onPackagesChange(newPackages);
  };

  // Handle Add Package Size
  const handleAddPackSize = (e) => {
    if (e.key === "Enter" && newPackSize && parseInt(newPackSize) > 1) {
      const size = newPackSize.toString();
      if (!packSizes.includes(size)) {
        setPackSizes([...packSizes, size]);

        const newPackages = products.map((product) => {
          const variantInfo = product.variant.map((v) => v.value).join("-");
          return {
            id: Date.now() + Math.random(),
            packName: `${size}-${variantInfo}`,
            sku: Math.floor(Math.random() * 100000000000)
              .toString()
              .padStart(11, "0"),
            barcode: "",
            packSize: size,
            sellable: true,
            purchasable: true,
            image: null,
            baseProduct: product,
          };
        });

        updatePackages([...packages, ...newPackages]);
      }
      setNewPackSize("");
    }
  };

  // Handle Field Change
  const handleFieldChange = (packageId, field, value) => {
    const updatedPackages = packages.map((p) =>
      p.id === packageId ? { ...p, [field]: value } : p
    );
    updatePackages(updatedPackages);
  };

  // Remove Package Size
  const removePackSize = (size) => {
    setPackSizes(packSizes.filter((s) => s !== size));
    const updatedPackages = packages.filter((p) => p.packSize !== size);
    updatePackages(updatedPackages);
  };

  // Generate New SKU
  const generateSKU = () => {
    return Math.floor(Math.random() * 100000000000)
      .toString()
      .padStart(11, "0");
  };

  // Re Generate SKU
  const regenerateSKU = (packageId) => {
    handleFieldChange(packageId, "sku", generateSKU());
  };

  // Handle Image Upload
  const handleImageChange = (packageId, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleFieldChange(packageId, "image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove Image
  const removeImage = (packageId) => {
    handleFieldChange(packageId, "image", null);
  };

  return (
    <div className={`packages-container ${theme}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="packages-header">
        <h2>{t("Package Options")}</h2>
        <InfoTooltip
          title={t("Create product packages with different sizes")}
        />
      </div>

      <div className="enable-packs">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={canCreatePacks}
            onChange={(e) => setCanCreatePacks(e.target.checked)}
          />
          <span>{t("Enable Package Creation")}</span>
          <InfoTooltip
            title={t("Check to enable creating packages for these variants")}
          />
        </label>
      </div>

      {canCreatePacks && (
        <>
          <div className="pack-size-input">
            <input
              type="number"
              min="2"
              value={newPackSize}
              onChange={(e) => setNewPackSize(e.target.value)}
              onKeyPress={handleAddPackSize}
              placeholder={t("Enter pack size")}
            />
            <span>{t("Press Enter to add pack size")}</span>
          </div>

          <div className="pack-sizes">
            <span>{t("Current Pack Sizes")}:</span>
            {packSizes.map((size) => (
              <div key={size} className="size-tag">
                <span>{size}</span>
                <button onClick={() => removePackSize(size)}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="packs-list">
            {packages.map((pack) => (
              <div key={pack.id} className="pack-item">
                <div className="pack-content">
                  <div className="image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(pack.id, e)}
                      className="hidden-input"
                      id={`pack-image-${pack.id}`}
                    />
                    {pack.image ? (
                      <div className="image-preview">
                        <img
                          src={pack.image}
                          alt={t("Pack Image")}
                          className="pack-image"
                        />
                        <button
                          onClick={() => removeImage(pack.id)}
                          className="remove-image"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor={`pack-image-${pack.id}`}
                        className="image-placeholder"
                      >
                        <ImageIcon size={24} />
                      </label>
                    )}
                  </div>

                  <div className="fields-section">
                    <div className="fields-row">
                      <div className="field-group">
                        <div className="field-label">
                          <span className="required">{t("Pack Name")}</span>
                          <InfoTooltip title={t("Package name")} />
                        </div>
                        <input
                          type="text"
                          value={pack.packName}
                          onChange={(e) =>
                            handleFieldChange(
                              pack.id,
                              "packName",
                              e.target.value
                            )
                          }
                          className="field-input"
                        />
                      </div>

                      <div className="field-group">
                        <div className="field-label">
                          <span className="required">{t("SKU")}</span>
                          <InfoTooltip title={t("Package SKU identifier")} />
                        </div>
                        <div className="sku-input">
                          <input
                            type="text"
                            value={pack.sku}
                            onChange={(e) =>
                              handleFieldChange(pack.id, "sku", e.target.value)
                            }
                            className="field-input"
                          />
                          <button
                            onClick={() => regenerateSKU(pack.id)}
                            className="refresh-button"
                            aria-label={t("Regenerate SKU")}
                          >
                            <RefreshCcw size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="field-group">
                        <div className="field-label">
                          <span>{t("Barcode")}</span>
                          <InfoTooltip title={t("Package barcode")} />
                        </div>
                        <input
                          type="text"
                          value={pack.barcode}
                          onChange={(e) =>
                            handleFieldChange(
                              pack.id,
                              "barcode",
                              e.target.value
                            )
                          }
                          className="field-input"
                        />
                      </div>

                      <div className="field-group">
                        <div className="field-label">
                          <span>{t("Pack Size")}</span>
                          <InfoTooltip
                            title={t("Number of items in package")}
                          />
                        </div>
                        <input
                          type="text"
                          value={pack.packSize}
                          className="field-input disabled"
                          readOnly
                          disabled
                        />
                      </div>
                    </div>

                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={pack.sellable}
                          onChange={(e) =>
                            handleFieldChange(
                              pack.id,
                              "sellable",
                              e.target.checked
                            )
                          }
                        />
                        <span>{t("Sellable")}</span>
                        <InfoTooltip
                          title={t("Mark if the package is available for sale")}
                        />
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={pack.purchasable}
                          onChange={(e) =>
                            handleFieldChange(
                              pack.id,
                              "purchasable",
                              e.target.checked
                            )
                          }
                        />
                        <span>{t("Purchasable")}</span>
                        <InfoTooltip
                          title={t("Mark if the package can be purchased")}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Packages;

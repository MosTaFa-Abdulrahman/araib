import "./packages.scss";
import { useEffect, useState } from "react";
import { X, RotateCw, Info, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../../context/ThemeContext";

function Packages({ productName, onPackagesChange }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [isSoldInPack, setIsSoldInPack] = useState(false);
  const [packSizes, setPackSizes] = useState([]);
  const [newPackSize, setNewPackSize] = useState("");
  const [packages, setPackages] = useState([]);
  const [tooltips, setTooltips] = useState({
    soldInPack: false,
    autoGenerate: false,
  });

  // Effect to notify parent of package changes
  useEffect(() => {
    onPackagesChange(packages);
  }, [packages, onPackagesChange]);

  // Handle Add Package
  const handleAddPackSize = (e) => {
    if (e.key === "Enter" && newPackSize && parseInt(newPackSize) > 1) {
      if (!packSizes.includes(newPackSize)) {
        setPackSizes([...packSizes, newPackSize]);

        const newPackage = {
          id: Date.now(),
          packName: productName
            ? `${newPackSize}-${productName}`
            : `null-${newPackSize}`,
          sku: Math.floor(Math.random() * 100000000000)
            .toString()
            .padStart(11, "0"),
          barcode: "",
          packSize: newPackSize,
          sellable: true,
          purchasable: true,
          image: null,
        };

        setPackages([...packages, newPackage]);
      }
      setNewPackSize("");
    }
  };

  // Upload Image
  const handleImageUpload = (event, packageId) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPackages(
          packages.map((p) =>
            p.id === packageId ? { ...p, image: reader.result } : p
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove Image
  const removeImage = (packageId) => {
    setPackages(
      packages.map((p) => (p.id === packageId ? { ...p, image: null } : p))
    );
  };

  // Toggle CheckBox
  const toggleCheckbox = (packageId, field) => {
    setPackages(
      packages.map((p) =>
        p.id === packageId ? { ...p, [field]: !p[field] } : p
      )
    );
  };

  // Remove Package Size
  const removePackSize = (size) => {
    setPackSizes(packSizes.filter((s) => s !== size));
    setPackages(packages.filter((p) => p.packSize !== size));
  };

  // Re Generate SKU
  const regenerateSKU = (id) => {
    setPackages(
      packages.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            sku: Math.floor(Math.random() * 100000000000)
              .toString()
              .padStart(11, "0"),
          };
        }
        return p;
      })
    );
  };

  return (
    <div className={`packages-section ${theme}`}>
      <div className="package-header">
        <div className="sold-in-pack">
          <input
            type="checkbox"
            id="soldInPack"
            checked={isSoldInPack}
            onChange={(e) => setIsSoldInPack(e.target.checked)}
          />
          <label htmlFor="soldInPack">
            {t("This product is sold in pack")}
            <div className="tooltip-container">
              <Info
                size={16}
                onMouseEnter={() =>
                  setTooltips({ ...tooltips, soldInPack: true })
                }
                onMouseLeave={() =>
                  setTooltips({ ...tooltips, soldInPack: false })
                }
              />
              {tooltips.soldInPack && (
                <div className="tooltip">
                  {t(
                    "Enable this option if you want to sell this product in packages"
                  )}
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {isSoldInPack && (
        <div className="package-content">
          <div className="pack-sizes">
            <label>
              <span className="required">*</span> {t("Packs Sizes")}
            </label>
            <p className="pack-hint">
              {t(
                "Packs will be generated with all the added sizes, then you can edit them"
              )}
            </p>
            <div className="sizes-input">
              <div className="sizes-tags">
                {packSizes.map((size) => (
                  <span key={size} className="size-tag">
                    {size}
                    <button onClick={() => removePackSize(size)}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="number"
                min="2"
                value={newPackSize}
                onChange={(e) => setNewPackSize(e.target.value)}
                onKeyDown={handleAddPackSize}
                placeholder={t("Press Enter to add Pack New Sizes")}
              />
            </div>
          </div>

          <div className="packages-list">
            {packages.map((pack) => (
              <div key={pack.id} className="package-item">
                <div className="package-image">
                  {pack.image ? (
                    <>
                      <img src={pack.image} alt={`Pack ${pack.packName}`} />
                      <button
                        className="remove-package"
                        onClick={() => removeImage(pack.id)}
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <label
                        htmlFor={`image-upload-${pack.id}`}
                        className="placeholder-image"
                      >
                        <Upload size={24} className="upload-icon" />
                      </label>
                    </>
                  )}
                  <input
                    type="file"
                    id={`image-upload-${pack.id}`}
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, pack.id)}
                    className="file-input"
                  />
                </div>

                <div className="package-details">
                  <div className="input-group">
                    <label>
                      <span className="required">*</span> {t("Pack Name")}
                    </label>
                    <input type="text" value={pack.packName} readOnly />
                  </div>

                  <div className="input-group">
                    <label>
                      <span className="required">*</span> {t("SKU")}
                    </label>
                    <div className="sku-input">
                      <input type="text" value={pack.sku} readOnly />
                      <button onClick={() => regenerateSKU(pack.id)}>
                        <RotateCw size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>{t("Barcode")}</label>
                    <input
                      type="text"
                      value={pack.barcode}
                      onChange={(e) => {
                        setPackages(
                          packages.map((p) =>
                            p.id === pack.id
                              ? { ...p, barcode: e.target.value }
                              : p
                          )
                        );
                      }}
                      placeholder={t("Barcode")}
                    />
                  </div>

                  <div className="input-group">
                    <label>
                      <span className="required">*</span> {t("Pack Size")}
                    </label>
                    <input type="text" value={pack.packSize} readOnly />
                  </div>

                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={pack.sellable}
                        onChange={() => toggleCheckbox(pack.id, "sellable")}
                      />
                      {t("Sellable")}
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={pack.purchasable}
                        onChange={() => toggleCheckbox(pack.id, "purchasable")}
                      />
                      {t("Purchasable")}
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Packages;

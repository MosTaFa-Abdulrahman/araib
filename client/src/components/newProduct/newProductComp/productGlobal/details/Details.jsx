import "./details.scss";
import { useState } from "react";
import { X, RotateCw, Info, Image as ImageIcon } from "lucide-react";
import InfoTooltip from "../../../../global/infoTooltip/InfoTooltip";
import { useTranslation } from "react-i18next";

function Details({ productDetails, onDetailsChange, title, type }) {
  const { t } = useTranslation();

  // Image
  const [image, setImage] = useState(null);
  const [tooltips, setTooltips] = useState({
    header: false,
    sku: false,
    sellable: false,
    purchasable: false,
  });

  const generateSKU = () => {
    const randomNum = Math.floor(Math.random() * 100000000000);
    onDetailsChange({
      ...productDetails,
      sku: randomNum.toString().padStart(11, "0"),
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    onDetailsChange({
      ...productDetails,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setImage(null);
  };

  const clearSKU = () => {
    onDetailsChange({
      ...productDetails,
      sku: "",
    });
  };

  const toggleTooltip = (key, value) => {
    setTooltips((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="product-details">
      <div className="headerDetails">
        <h2>{t("Product Details")}</h2>
        <InfoTooltip
          title={t(
            "Adding the main information makes it easier for you to search for the product on the platform"
          )}
        />
      </div>

      <form className="product-form">
        <div className="form-group product-name-group">
          <div className="input-container">
            <label>
              <span className="required">*</span> {title}
            </label>
            <input
              type="text"
              name="productName"
              value={productDetails.productName}
              onChange={handleInputChange}
              required
              placeholder={title}
            />
          </div>

          <div className="image-upload-container">
            {image ? (
              <div className="image-preview">
                <img src={image} alt="Product" />
                <button
                  type="button"
                  className="delete-image"
                  onClick={handleDeleteImage}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="upload-label">
                <input
                  type="file"
                  className="hidden-input"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <div className="upload-placeholder">
                  <ImageIcon size={24} />
                  <span>Upload</span>
                </div>
              </label>
            )}
          </div>
        </div>

        {type !== "variable" && (
          <>
            <div className="form-group">
              <label>
                <span className="required">*</span> {t("SKU")}
              </label>
              <div className="sku-input-group">
                <div className="sku-input-wrapper">
                  <input
                    type="text"
                    name="sku"
                    value={productDetails.sku}
                    onChange={handleInputChange}
                    required
                    placeholder={t("SKU")}
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
                <div className="auto-generate-container">
                  <button
                    type="button"
                    className="auto-generate"
                    onClick={generateSKU}
                  >
                    <RotateCw size={16} />
                    <span>{t("Auto-Generate SKU")}</span>
                    <div className="tooltip-container">
                      <Info
                        size={16}
                        onMouseEnter={() => toggleTooltip("sku", true)}
                        onMouseLeave={() => toggleTooltip("sku", false)}
                      />
                      {tooltips.sku && (
                        <div className="tooltip sku-tooltip">
                          {t(
                            "The serial number (SKU) makes it easier for you to find the product and link your inventory to your online store"
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>
              <p className="sku-warning">
                {t(
                  "SKU number cannot be as the same Barcode for another product"
                )}
              </p>
            </div>

            <div className="form-group">
              <label>{t("Barcode")}</label>
              <input
                type="text"
                name="barcode"
                value={productDetails.barcode}
                onChange={handleInputChange}
                placeholder={t("Barcode")}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>{t("Description")}</label>
          <textarea
            name="description"
            value={productDetails.description}
            onChange={handleInputChange}
            placeholder={t("Description")}
          />
        </div>

        {type !== "variable" && (
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="sellable"
                name="sellable"
                checked={productDetails.sellable}
                onChange={handleInputChange}
              />
              <label htmlFor="sellable">
                {t("Sellable")}
                <div className="tooltip-container">
                  <Info
                    size={16}
                    onMouseEnter={() => toggleTooltip("sellable", true)}
                    onMouseLeave={() => toggleTooltip("sellable", false)}
                  />
                  {tooltips.sellable && (
                    <div className="tooltip">
                      {t("Uncheck if don't want to sell this product")}
                    </div>
                  )}
                </div>
              </label>
            </div>

            {type !== "composite" && (
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="purchasable"
                  name="purchasable"
                  checked={productDetails.purchasable}
                  onChange={handleInputChange}
                />
                <label htmlFor="purchasable">
                  {t("Purchasable")}
                  <div className="tooltip-container">
                    <Info
                      size={16}
                      onMouseEnter={() => toggleTooltip("purchasable", true)}
                      onMouseLeave={() => toggleTooltip("purchasable", false)}
                    />
                    {tooltips.purchasable && (
                      <div className="tooltip">
                        {t("Uncheck if don't want to purchase this product")}
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

export default Details;

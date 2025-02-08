import "./specialProductModal.scss";
import { useState, useEffect } from "react";
import Modal from "../../../../components/global/modal/Modal";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../context/ThemeContext";

function SpecialProductModal({ isOpen, onClose, product, onSave }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});

  // Initialize items when modal opens
  useEffect(() => {
    if (product && isOpen) {
      const initialItems = product.transferStockVariantToTracks.map(
        (track) => ({
          id: track.id,
          trackNo: track.trackNo,
          sentStock: track.transferredQuantity,
          // Use the saved receivedQuantity from the product
          receivedQuantity: track.receivedQuantity || "",
          isEditing: true,
        })
      );
      setItems(initialItems);
      setErrors({});
    }
  }, [product, isOpen]);

  // Handle Quantity Change
  const handleQuantityChange = (id, value) => {
    const item = items.find((i) => i.id === id);

    // Allow empty input
    if (value === "") {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, receivedQuantity: "" } : item
        )
      );
      return;
    }

    // Convert to number and ensure non-negative
    const numValue = Math.max(0, parseFloat(value) || 0);

    // If value exceeds maxQuantity, set it to maxQuantity
    const adjustedValue = numValue > item.sentStock ? item.sentStock : numValue;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, receivedQuantity: adjustedValue } : item
      )
    );

    // Show error message if the entered value was too high
    if (numValue > item.sentStock) {
      setErrors((prev) => ({
        ...prev,
        [id]: `Maximum quantity is ${item.sentStock}`,
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  // **************************** ((Actions-Buttons)) ***************************** //
  // Handle Save
  const handleSave = () => {
    const hasErrors = Object.keys(errors).length > 0;
    if (!hasErrors) {
      onSave(items);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={`specialProductModal ${theme}`}>
        <div className="modalHeader">
          <h2>
            {product?.trackType === "serial"
              ? t("Serial Numbers")
              : t("Batch Numbers")}
          </h2>
        </div>

        <div className="modalBody">
          <div className="productInfo">
            <span className="name">{product?.productVariantName}</span>
            <span className="sku">{product?.sku}</span>
          </div>

          <div className="table-container">
            <div className="table-header">
              <div>
                {product?.trackType === "serial"
                  ? t("Serial Number")
                  : t("Batch ID")}
              </div>
              <div>{t("Sent Stock")}</div>
              <div>{t("Received QTY")}</div>
            </div>

            <div className="table-body">
              {items.map((item) => (
                <div key={item.id} className="table-row">
                  <div>{item.trackNo}</div>
                  <div>{item.sentStock}</div>
                  <div className="received-qty">
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      step="any"
                      value={item.receivedQuantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                      className={errors[item.id] ? "error" : ""}
                    />
                    {errors[item.id] && (
                      <div className="error-message">{errors[item.id]}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modalFooter">
          <button className="cancelBtn" onClick={onClose} type="button">
            {t("Cancel")}
          </button>
          <button
            className="saveButton"
            onClick={handleSave}
            type="button"
            disabled={Object.keys(errors).length > 0}
          >
            {t("Save")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default SpecialProductModal;

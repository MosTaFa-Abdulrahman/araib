import "./specialProductModal.scss";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import Modal from "../../../global/modal/Modal";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../context/ThemeContext";

// DateTime
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

function SpecialProductModal({
  isOpen,
  onClose,
  product,
  onSave,
  existingItems = [],
  transferQty = 0,
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [internalTransferQty, setInternalTransferQty] = useState(transferQty);
  const [currentItem, setCurrentItem] = useState({
    serialNumber: "",
    quantity: "",
    expirationDate: null,
    issueDate: null,
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentItem({
        serialNumber: "",
        quantity: "",
        expirationDate: null,
        issueDate: null,
      });
      setErrors({});
      setItems([]);
      setSelectedCards(new Set());
    } else if (existingItems.length > 0) {
      setItems(existingItems);
      setSelectedCards(new Set(existingItems.map((item) => item.serialNumber)));
    } else if (
      product?.Product?.type === "ecard" ||
      product?.trackType === "serial"
    ) {
      setItems(Array(transferQty).fill({ serialNumber: "", quantity: 1 }));
    }
  }, [isOpen, product, existingItems, transferQty]);

  useEffect(() => {
    if (internalTransferQty !== transferQty) {
      setItems([]);
      setInternalTransferQty(transferQty);
    }
  }, [transferQty]);

  // Get available numbers for each type
  const getAvailableNumbers = () => {
    if (product?.Product?.type === "ecard") {
      if (!product?.Ecards) return [];
      return product.Ecards.filter(
        (card) => !card.isSold && !selectedCards.has(card.code)
      ).map((card) => ({
        value: card.code,
        label: card.code,
      }));
    } else {
      if (!product?.ProductVariantToStockLocations?.[0]?.VariantToTracks)
        return [];

      return product.ProductVariantToStockLocations[0].VariantToTracks.map(
        (track) => ({
          value: track.trackNo,
          label: `${track.trackNo} (${track.quantity} available)`,
          quantity: track.quantity,
          expiryDate: track.expiryDate,
          issueDate: track.issueDate,
        })
      );
    }
  };

  // Get available quantity for batch
  const getAvailableQuantityForBatch = (batchNumber) => {
    const batch = getAvailableNumbers().find(
      (item) => item.value === batchNumber
    );
    if (!batch) return 0;

    const usedQuantity = items.reduce((sum, item) => {
      return item.serialNumber === batchNumber
        ? sum + Number(item.quantity || 0)
        : sum;
    }, 0);

    return batch.quantity - usedQuantity;
  };

  // Handle input changes for all types
  const handleInputChange = (field, value, index = null) => {
    if (
      field === "quantity" &&
      (product?.trackType === "serial" || product?.Product?.type === "ecard")
    )
      return;

    if (field === "quantity" && product?.trackType === "batch") {
      const numValue = Number(value);
      const availableQty = getAvailableQuantityForBatch(
        currentItem.serialNumber
      );

      if (value === "" || numValue <= 0 || numValue > availableQty) {
        setErrors({
          quantity:
            numValue <= 0
              ? "Quantity must be greater than 0"
              : `Maximum available quantity is ${availableQty}`,
        });
        return;
      }
      setErrors({});
    }

    if (index !== null) {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      if (field === "serialNumber") {
        const selected = getAvailableNumbers().find(
          (item) => item.value === value
        );
        if (selected) {
          newItems[index] = {
            ...newItems[index],
            expirationDate: selected.expiryDate
              ? new Date(selected.expiryDate)
              : null,
            issueDate: selected.issueDate ? new Date(selected.issueDate) : null,
            quantity:
              product?.trackType === "serial" ||
              product?.Product?.type === "ecard"
                ? 1
                : "",
          };
        }
      }
      setItems(newItems);
    } else {
      setCurrentItem((prev) => {
        const newItem = { ...prev, [field]: value };
        if (field === "serialNumber") {
          const selected = getAvailableNumbers().find(
            (item) => item.value === value
          );
          if (selected) {
            newItem.expirationDate = selected.expiryDate
              ? new Date(selected.expiryDate)
              : null;
            newItem.issueDate = selected.issueDate
              ? new Date(selected.issueDate)
              : null;
            newItem.quantity = "";
          }
        }
        return newItem;
      });
    }
  };

  // Handle selections for e-card and serial
  const handleSelection = (value, index) => {
    if (!value) return;

    const newItems = [...items];
    if (product?.Product?.type === "ecard") {
      setSelectedCards(new Set([...selectedCards, value]));
      newItems[index] = {
        serialNumber: value,
        quantity: 1,
      };
    } else {
      const selected = getAvailableNumbers().find(
        (item) => item.value === value
      );
      newItems[index] = {
        serialNumber: value,
        quantity: 1,
        expirationDate: selected?.expiryDate
          ? new Date(selected.expiryDate)
          : null,
        issueDate: selected?.issueDate ? new Date(selected.issueDate) : null,
      };
    }
    setItems(newItems);
    setErrors({});
  };

  // Handle removal of items
  const handleRemove = (index) => {
    if (product?.Product?.type === "ecard") {
      const removedCard = items[index]?.serialNumber;
      if (removedCard) {
        const newSelectedCards = new Set(selectedCards);
        newSelectedCards.delete(removedCard);
        setSelectedCards(newSelectedCards);
      }
    }
    const newItems = [...items];
    newItems[index] = {
      serialNumber: "",
      quantity:
        product?.trackType === "serial" || product?.Product?.type === "ecard"
          ? 1
          : "",
      expirationDate: null,
      issueDate: null,
    };
    setItems(newItems);
  };

  // Handle add batch item
  const handleAddBatch = () => {
    if (!currentItem.serialNumber) {
      setErrors({ serialNumber: t("This field is required") });
      return;
    }

    if (!currentItem.quantity) {
      setErrors({ quantity: t("This field is required") });
      return;
    }

    const availableQty = getAvailableQuantityForBatch(currentItem.serialNumber);
    const requestedQty = Number(currentItem.quantity);

    if (requestedQty > availableQty) {
      setErrors({
        quantity: t(`Maximum available quantity is ${availableQty}`),
      });
      return;
    }

    const currentTotal = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
    const remainingNeeded = internalTransferQty - currentTotal;

    if (requestedQty > remainingNeeded) {
      setErrors({
        quantity: t(`Maximum remaining quantity is ${remainingNeeded}`),
      });
      return;
    }

    setItems([...items, currentItem]);
    setCurrentItem({
      serialNumber: "",
      quantity: "",
      expirationDate: null,
      issueDate: null,
    });
  };

  // ******************** ((Rendered)) ************************* //
  // Render forms based on type
  const renderForm = () => {
    if (product?.Product?.type === "ecard") {
      return (
        <div className="formGrid">
          {Array(internalTransferQty)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="inputRow">
                <div className="inputGroup">
                  <label>
                    <span className="required">*</span>
                    {t("E-Card Number")} #{index + 1}
                  </label>
                  <select
                    value={items[index]?.serialNumber || ""}
                    onChange={(e) => handleSelection(e.target.value, index)}
                  >
                    <option value="">{t("Select E-Card")}</option>
                    {getAvailableNumbers().map((card) => (
                      <option key={card.value} value={card.value}>
                        {card.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="inputGroup">
                  <label>{t("Quantity")}</label>
                  <input
                    type="number"
                    value="1"
                    disabled
                    className="disabledInput"
                  />
                  {items[index]?.serialNumber && (
                    <span className="selectedCard">
                      Selected: {items[index].serialNumber}
                    </span>
                  )}
                </div>

                <button
                  className="deleteButton"
                  onClick={() => handleRemove(index)}
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
        </div>
      );
    } else if (product?.trackType === "serial") {
      return (
        <div className="serialForm">
          {Array(internalTransferQty)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="serialRow">
                <div className="inputGroup">
                  <label>
                    <span className="required">*</span>
                    {t("Serial Number")} #{index + 1}
                  </label>
                  <select
                    value={items[index]?.serialNumber || ""}
                    onChange={(e) => handleSelection(e.target.value, index)}
                  >
                    <option value="">{t("Select Serial")}</option>
                    {getAvailableNumbers().map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="inputGroup">
                  <label>{t("Serial Quantity")}</label>
                  <input
                    type="number"
                    value="1"
                    disabled
                    className="disabledInput"
                  />
                </div>

                <div className="inputGroup">
                  <label>{t("Expiration Date")}</label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={items[index]?.expirationDate || null}
                      onChange={() => {}}
                      disabled
                      format="dd/MM/yyyy"
                    />
                  </LocalizationProvider>
                </div>

                <div className="inputGroup">
                  <label>{t("Issue Date")}</label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={items[index]?.issueDate || null}
                      onChange={() => {}}
                      disabled
                      format="dd/MM/yyyy"
                    />
                  </LocalizationProvider>
                </div>

                <button
                  className="deleteButton"
                  onClick={() => handleRemove(index)}
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
        </div>
      );
    } else {
      return (
        <div className="batchForm">
          <div className="inputRow">
            <div className="inputGroup">
              <label>
                <span className="required">*</span>
                {t("Batch Id")}
              </label>
              <select
                value={currentItem.serialNumber}
                onChange={(e) =>
                  handleInputChange("serialNumber", e.target.value)
                }
                className={errors.serialNumber ? "error" : ""}
              >
                <option value="">{t("Select Batch")}</option>
                {getAvailableNumbers().map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {errors.serialNumber && (
                <span className="errorText">{errors.serialNumber}</span>
              )}
            </div>

            <div className="inputGroup">
              <label>
                <span className="required">*</span>
                {t("Quantity")}
              </label>
              <input
                type="number"
                value={currentItem.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                className={errors.quantity ? "error" : ""}
                placeholder={t("Enter quantity")}
              />
              {errors.quantity && (
                <span className="errorText">{errors.quantity}</span>
              )}
            </div>

            <div className="inputGroup">
              <label>{t("Expiration Date")}</label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={currentItem.expirationDate}
                  onChange={() => {}}
                  disabled
                  format="dd/MM/yyyy"
                />
              </LocalizationProvider>
            </div>

            <div className="inputGroup">
              <label>{t("Issue Date")}</label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={currentItem.issueDate}
                  onChange={() => {}}
                  disabled
                  format="dd/MM/yyyy"
                />
              </LocalizationProvider>
            </div>

            <button
              className="addButton"
              onClick={handleAddBatch}
              type="button"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="itemsList">
            {items.map((item, index) => (
              <div key={index} className="itemRow">
                <span>{item.serialNumber}</span>
                <span>{item.quantity}</span>
                <span>{item.expirationDate?.toLocaleDateString()}</span>
                <span>{item.issueDate?.toLocaleDateString()}</span>
                <button
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={`specialProductModal ${theme}`}>
        <div className="modalHeader">
          <h2>
            {product?.Product?.type === "ecard"
              ? t("E-Card Numbers")
              : product?.trackType === "serial"
              ? t("Serial Numbers")
              : t("Batch Numbers")}
          </h2>
        </div>

        <div className="modalBody">
          <div className="productInfo">
            <div className="info">
              <span className="name">{product?.name}</span>
              <span className="sku">{product?.sku}</span>
            </div>
            <div className="quantity">
              <span>Required Quantity: {internalTransferQty}</span>
            </div>
          </div>

          {renderForm()}
        </div>

        <div className="modalFooter">
          <button className="cancelBtn" onClick={onClose} type="button">
            {t("Cancel")}
          </button>
          <button
            className="saveButton"
            onClick={() => {
              onSave(items.filter((item) => item.serialNumber));
              onClose();
            }}
            type="button"
            disabled={
              product?.Product?.type === "ecard"
                ? items.filter((item) => item.serialNumber).length !==
                  internalTransferQty
                : product?.trackType === "serial"
                ? items.filter((item) => item.serialNumber).length !==
                  internalTransferQty
                : product?.trackType === "batch"
                ? items.reduce(
                    (sum, item) => sum + Number(item.quantity || 0),
                    0
                  ) !== internalTransferQty
                : items.length === 0
            }
          >
            {t("Save")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default SpecialProductModal;

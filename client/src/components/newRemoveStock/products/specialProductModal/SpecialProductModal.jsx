import "./specialProductModal.scss";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import Modal from "../../../global/modal/Modal";
import { useTranslation } from "react-i18next";

// DateTimes
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

function SpecialProductModal({
  isOpen,
  onClose,
  product,
  onSave,
  existingItems = [],
  returnedQuantity = 0,
}) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [selectedSerialNumbers, setSelectedSerialNumbers] = useState(new Set());
  const [currentItem, setCurrentItem] = useState({
    serialNumber: "",
    quantity: product?.trackType === "serial" ? 1 : "",
    expirationDate: null,
    issueDate: null,
  });

  useEffect(() => {
    if (!isOpen) {
      setCurrentItem({
        serialNumber: "",
        quantity: product?.trackType === "serial" ? 1 : "",
        expirationDate: null,
        issueDate: null,
      });
      setErrors({});
      setItems([]);
      setSelectedCards(new Set());
      setSelectedSerialNumbers(new Set()); // Reset serial numbers
    } else if (existingItems.length > 0) {
      setItems(existingItems);
      if (product?.trackType === "serial") {
        setSelectedSerialNumbers(
          new Set(existingItems.map((item) => item.serialNumber))
        );
      } else if (product?.Product?.type === "ecard") {
        setSelectedCards(
          new Set(existingItems.map((item) => item.serialNumber))
        );
      }
    } else if (
      product?.Product?.type === "ecard" ||
      product?.trackType === "serial"
    ) {
      setItems(Array(returnedQuantity).fill({ serialNumber: "", quantity: 1 }));
    }
  }, [isOpen, product, existingItems, returnedQuantity]);

  // Handle Get Available Numbers
  const getAvailableNumbers = () => {
    if (product?.Product?.type === "ecard") {
      if (!product?.Ecards) return [];
      return product.Ecards.filter(
        (card) => !card.isSold && !selectedCards.has(card.code)
      ).map((card) => ({
        value: card.code,
        label: card.code,
      }));
    }

    if (!product?.ProductVariantToStockLocations?.[0]?.VariantToTracks)
      return [];

    return product.ProductVariantToStockLocations[0].VariantToTracks.map(
      (track) => ({
        value: track.trackNo,
        label: `${track.trackNo} (${track.quantity} available)`,
        quantity: track.quantity,
        // Make sure to pass the dates
        expiryDate: track.expiryDate,
        issueDate: track.issueDate,
      })
    );
  };

  // Handle Get ((BatchOrSerialNumbers))
  const getBatchOrSerialNumbers = () => {
    if (!product || !product.ProductVariantToStockLocations?.length) return [];

    const location = product.ProductVariantToStockLocations[0];
    if (!location?.VariantToTracks?.length) return [];

    const tracks = location.VariantToTracks.map((track) => ({
      value: track.trackNo,
      label: `${track.trackNo} (${track.quantity} available)`,
      quantity: track.quantity,
      expiryDate: track.expiryDate,
      issueDate: track.issueDate,
    }));

    // Filter out selected serial numbers if it's a serial product
    if (product?.trackType === "serial") {
      return tracks.filter((track) => !selectedSerialNumbers.has(track.value));
    }

    return tracks;
  };

  // Handle Inputs Change
  const handleInputChange = (field, value) => {
    if (field === "quantity" && product?.trackType === "serial") return;

    setCurrentItem((prev) => {
      const newItem = { ...prev, [field]: value };

      if (field === "serialNumber") {
        const selected = getBatchOrSerialNumbers().find(
          (item) => item.value === value
        );
        if (selected) {
          newItem.expirationDate = new Date(selected.expiryDate);
          newItem.issueDate = new Date(selected.issueDate);
          if (product?.trackType === "serial") {
            newItem.quantity = 1;
          }
        }
      }
      return newItem;
    });

    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  // Handle E-Card Select
  const handleECardSelect = (value, index) => {
    if (!value) return;

    const newItems = [...items];
    setSelectedCards(new Set([...selectedCards, value]));
    newItems[index] = {
      serialNumber: value,
      quantity: 1,
    };
    setItems(newItems);
  };

  // Handle Removed (E-Card)
  const handleRemoveCard = (index) => {
    const removedCard = items[index]?.serialNumber;
    if (removedCard) {
      const newSelectedCards = new Set(selectedCards);
      newSelectedCards.delete(removedCard);
      setSelectedCards(newSelectedCards);
    }
    const newItems = [...items];
    newItems[index] = {
      serialNumber: "",
      quantity: 1,
    };
    setItems(newItems);
  };

  // Handle Get ((AvailableQuantityForBatch))
  const getAvailableQuantityForBatch = (batchNumber) => {
    const batch = getBatchOrSerialNumbers().find(
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

  // Handle Add
  const handleAdd = () => {
    if (!currentItem.serialNumber) {
      setErrors({ serialNumber: t("This field is required") });
      return;
    }

    if (product?.trackType === "batch") {
      if (!currentItem.quantity) {
        setErrors({ quantity: t("This field is required") });
        return;
      }

      const availableQty = getAvailableQuantityForBatch(
        currentItem.serialNumber
      );
      if (Number(currentItem.quantity) > availableQty) {
        setErrors({
          quantity: `Maximum available quantity is ${availableQty}`,
        });
        return;
      }

      const totalQuantity = items.reduce((sum, item) => {
        return sum + Number(item.quantity || 0);
      }, Number(currentItem.quantity || 0));

      if (totalQuantity > returnedQuantity) {
        setErrors({ quantity: t("Total quantity exceeds required quantity") });
        return;
      }
    }

    setItems([...items, currentItem]);
    setCurrentItem({
      serialNumber: "",
      quantity: "",
      expirationDate: null,
      issueDate: null,
    });
    setErrors({});
  };

  // ***************************** ((Rendered)) ***************************** //
  const renderForm = () => {
    // E-Card
    if (product?.Product?.type === "ecard") {
      return (
        <div className="formGrid">
          {Array(returnedQuantity)
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
                    onChange={(e) => handleECardSelect(e.target.value, index)}
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
                  onClick={() => handleRemoveCard(index)}
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
        </div>
      );
    }

    // Batch
    if (product?.trackType === "batch") {
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
                {getBatchOrSerialNumbers().map((item) => (
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
                  value={currentItem.expirationDate || null}
                  onChange={() => {}}
                  disabled
                  format="dd/MM/yyyy"
                  renderInput={(params) => <input {...params} />}
                />
              </LocalizationProvider>
            </div>

            <div className="inputGroup">
              <label>{t("Issue Date")}</label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={currentItem.issueDate || null}
                  onChange={() => {}}
                  disabled
                  format="dd/MM/yyyy"
                  renderInput={(params) => <input {...params} />}
                />
              </LocalizationProvider>
            </div>

            <button
              className="addButton"
              onClick={handleAdd}
              disabled={!!errors.quantity || !!errors.serialNumber}
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
                  className="deleteButton"
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

    // Serial
    return (
      <div className="serialForm">
        {Array(returnedQuantity)
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
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) return;

                    const newItems = [...items];
                    const selected = getBatchOrSerialNumbers().find(
                      (item) => item.value === value
                    );

                    if (selected) {
                      // Add to selected serial numbers
                      setSelectedSerialNumbers(
                        (prev) => new Set([...prev, value])
                      );

                      // Remove previous selection if exists
                      const previousValue = newItems[index]?.serialNumber;
                      if (previousValue) {
                        setSelectedSerialNumbers((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete(previousValue);
                          return newSet;
                        });
                      }

                      newItems[index] = {
                        serialNumber: value,
                        quantity: 1,
                        expirationDate: selected
                          ? new Date(selected.expiryDate)
                          : null,
                        issueDate: selected
                          ? new Date(selected.issueDate)
                          : null,
                      };
                      setItems(newItems);
                    }
                  }}
                >
                  <option value="">{t("Select Serial")}</option>
                  {getBatchOrSerialNumbers().map((item) => (
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
                onClick={() => {
                  const newItems = [...items];
                  const removedValue = newItems[index]?.serialNumber;

                  if (removedValue) {
                    setSelectedSerialNumbers((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(removedValue);
                      return newSet;
                    });
                  }

                  newItems[index] = {
                    serialNumber: "",
                    quantity: 1,
                    expirationDate: null,
                    issueDate: null,
                  };
                  setItems(newItems);
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="specialProductModal">
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
              <span>Required Quantity: {returnedQuantity}</span>
            </div>
          </div>

          {renderForm()}
        </div>

        <div className="modalFooter">
          <button className="cancelBtn" onClick={onClose}>
            {t("Cancel")}
          </button>
          <button
            className="saveButton"
            onClick={() => {
              onSave(items.filter((item) => item.serialNumber));
              onClose();
            }}
            disabled={
              product?.Product?.type === "ecard"
                ? items.filter((item) => item.serialNumber).length !==
                  returnedQuantity
                : product?.trackType === "batch"
                ? items.reduce(
                    (sum, item) => sum + Number(item.quantity || 0),
                    0
                  ) !== returnedQuantity
                : product?.trackType === "serial"
                ? items.some((item) => !item.serialNumber)
                : false
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

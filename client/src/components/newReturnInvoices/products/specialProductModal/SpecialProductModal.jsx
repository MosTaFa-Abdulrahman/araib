import "./specialProductModal.scss";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import Modal from "../../../global/modal/Modal";
import { useTranslation } from "react-i18next";

// Date Time
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
  const [items, setItems] = useState(existingItems);
  const [errors, setErrors] = useState({});
  const [currentItem, setCurrentItem] = useState({
    serialNumber: "",
    quantity: 1,
    expirationDate: null,
    issueDate: null,
  });
  const [editIndex, setEditIndex] = useState(-1);

  useEffect(() => {
    setItems(existingItems);
  }, [existingItems]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentItem({
        serialNumber: "",
        quantity: 1,
        expirationDate: null,
        issueDate: null,
      });
      setErrors({});
      setEditIndex(-1);
    }
    setItems(existingItems);
  }, [isOpen, product, existingItems]);

  // Get modal title based on product type
  const getModalTitle = () => {
    if (!product) return "";
    if (product.isEcard) return t("E-Card Numbers");
    if (product.trackType === "serial") return t("Serial Numbers");
    if (product.trackType === "batch") return t("Batch Numbers");
    return t("Product Details");
  };

  // Get Available eCards
  const getAvailableEcards = () => {
    if (!product?.isEcard || !product?.Ecards) return [];

    const selectedCodes = items
      .map((item) => item.serialNumber)
      .filter(Boolean);

    return product.Ecards.filter(
      (card) => !card.isSold && !selectedCodes.includes(card.code)
    ).map((card) => ({
      value: card.code,
      label: card.code,
    }));
  };

  // Get BatchOrSerialNumbers
  const getBatchOrSerialNumbers = () => {
    if (!product?.ProductVariantToStockLocations?.length) return [];

    const location = product.ProductVariantToStockLocations[0];
    if (!location?.VariantToTracks?.length) return [];

    return location.VariantToTracks.filter((track) => track.quantity > 0) // Only show available tracks
      .map((track) => ({
        value: track.trackNo,
        label: `${track.trackNo} (${track.quantity} available)`,
        quantity: track.quantity,
        expiryDate: track.expiryDate,
        issueDate: track.issueDate,
      }));
  };

  // Handle Input Changes
  const handleInputChange = (field, value) => {
    setCurrentItem((prev) => {
      const newItem = { ...prev, [field]: value };

      if (field === "serialNumber") {
        const selected = getBatchOrSerialNumbers().find(
          (item) => item.value === value
        );
        if (selected) {
          newItem.expirationDate = new Date(selected.expiryDate);
          newItem.issueDate = new Date(selected.issueDate);
          newItem.quantity = product?.trackType === "serial" ? 1 : "";
        }
      }
      return newItem;
    });

    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  // Handle Add
  const handleAdd = () => {
    if (!currentItem.serialNumber) {
      setErrors({ serialNumber: t("This field is required") });
      return;
    }

    if (product?.trackType === "batch" && !currentItem.quantity) {
      setErrors({ quantity: t("This field is required") });
      return;
    }

    const totalQuantity = items.reduce((sum, item) => {
      return sum + Number(item.quantity || 0);
    }, Number(currentItem.quantity || 0));

    if (product?.trackType === "batch" && totalQuantity > returnedQuantity) {
      setErrors({ quantity: t("Total quantity exceeds required quantity") });
      return;
    }

    setItems([...items, currentItem]);
    setCurrentItem({
      serialNumber: "",
      quantity: 1,
      expirationDate: null,
      issueDate: null,
    });
  };

  // Handle Save
  const handleSave = () => {
    const totalQty = items.reduce((sum, item) => {
      if (product?.isEcard) {
        return sum + 1;
      }
      return product?.trackType === "batch"
        ? sum + Number(item.quantity || 0)
        : sum + 1;
    }, 0);

    if (totalQty !== returnedQuantity) {
      setErrors({
        quantity: t("Total quantity must match required quantity"),
      });
      return;
    }

    onSave(items);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="specialProductModal">
        <div className="modalHeader">
          <h2>{getModalTitle()}</h2>
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

          <div className="formGrid">
            {product?.isEcard ? (
              <div className="serialForm">
                {Array(returnedQuantity)
                  .fill(null)
                  .map((_, index) => (
                    <div key={index} className="serialRow">
                      <div className="inputGroup">
                        <label>
                          <span className="required">*</span>
                          {t("eCard Number")} #{index + 1}
                        </label>
                        <select
                          value={items[index]?.serialNumber || ""}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index] = {
                              serialNumber: e.target.value,
                              quantity: 1,
                            };
                            setItems(newItems);
                          }}
                          className={
                            errors.serialNumber && index === editIndex
                              ? "error"
                              : ""
                          }
                        >
                          <option value="">{t("Select eCard")}</option>
                          {getAvailableEcards().map((card) => (
                            <option key={card.value} value={card.value}>
                              {card.label}
                            </option>
                          ))}
                        </select>
                        {errors.serialNumber && index === editIndex && (
                          <span className="errorText">
                            {errors.serialNumber}
                          </span>
                        )}
                      </div>

                      <div className="inputGroup">
                        <label>{t("Quantity")}</label>
                        <input
                          type="number"
                          value="1"
                          disabled
                          className="disabledInput"
                        />
                      </div>

                      <div className="selectedCode">
                        {items[index]?.serialNumber && (
                          <span className="codeLabel">
                            {t("Selected")}: {items[index].serialNumber}
                          </span>
                        )}
                      </div>

                      <button
                        className="deleteButton"
                        onClick={() => {
                          const newItems = [...items];
                          newItems[index] = {
                            serialNumber: "",
                            quantity: 1,
                          };
                          setItems(newItems);
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            ) : product?.trackType === "batch" ? (
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
                      onChange={(e) =>
                        handleInputChange("quantity", e.target.value)
                      }
                      className={errors.quantity ? "error" : ""}
                      placeholder="Enter quantity"
                      min="1"
                      max={
                        getBatchOrSerialNumbers().find(
                          (item) => item.value === currentItem.serialNumber
                        )?.quantity || 999999
                      }
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
                    onClick={handleAdd}
                    disabled={
                      !currentItem.serialNumber || !currentItem.quantity
                    }
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
                        onClick={() =>
                          setItems(items.filter((_, i) => i !== index))
                        }
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
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
                            const newItems = [...items];
                            const selected = getBatchOrSerialNumbers().find(
                              (item) => item.value === e.target.value
                            );
                            newItems[index] = {
                              serialNumber: e.target.value,
                              quantity: 1,
                              expirationDate: selected
                                ? new Date(selected.expiryDate)
                                : null,
                              issueDate: selected
                                ? new Date(selected.issueDate)
                                : null,
                            };
                            setItems(newItems);
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
                        <label>{t("Quantity")}</label>
                        <input
                          type="number"
                          value="1"
                          disabled
                          className="disabledInput"
                        />
                      </div>

                      {/* <div className="selectedCode">
                        {items[index]?.serialNumber && (
                          <span className="codeLabel">
                            {t("Selected")}: {items[index].serialNumber}
                          </span>
                        )}
                      </div> */}

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
            )}
          </div>
        </div>

        <div className="modalFooter">
          <button className="cancelBtn" onClick={onClose}>
            {t("Cancel")}
          </button>
          <button
            className="saveButton"
            onClick={handleSave}
            disabled={
              items.length === 0 ||
              (product?.trackType === "batch" &&
                items.reduce(
                  (sum, item) => sum + Number(item.quantity || 0),
                  0
                ) !== returnedQuantity) ||
              ((product?.trackType === "serial" ||
                product?.Product?.type === "ecard") &&
                items.some((item) => !item.serialNumber))
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

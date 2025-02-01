import "./specialProductModal.scss";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import Modal from "../../../global/modal/Modal";
import { useTranslation } from "react-i18next";

// Date Time
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const SpecialProductModal = ({
  isOpen,
  onClose,
  product,
  onSave,
  existingItems = [],
  returnedQuantity = 0,
}) => {
  const { t } = useTranslation();
  // const [items, setItems] = useState(existingItems);
  const [items, setItems] = useState(
    product?.existingTrackingItems || existingItems
  );
  const [errors, setErrors] = useState({});
  const [currentItem, setCurrentItem] = useState({
    serialNumber: "",
    quantity: product?.trackType === "serial" ? 1 : "",
    expirationDate: null,
    issueDate: null,
  });
  const [editIndex, setEditIndex] = useState(-1);

  useEffect(() => {
    if (!isOpen) {
      setCurrentItem({
        serialNumber: "",
        quantity: product?.trackType === "serial" ? 1 : "",
        expirationDate: null,
        issueDate: null,
      });
      setErrors({});
      setEditIndex(-1);
    } else if (product?.existingTrackingItems?.length > 0) {
      // If we have pre-filled items from PO, use them
      setItems(product.existingTrackingItems);
    } else {
      setItems(existingItems);
    }
  }, [isOpen, product, existingItems]);

  useEffect(() => {
    setItems(existingItems);
  }, [existingItems]);

  const getBatchOrSerialNumbers = () => {
    if (!product || !product.ProductVariantToStockLocations?.length) return [];

    // Get the first location since we've already filtered for the correct one
    const location = product.ProductVariantToStockLocations[0];

    if (!location?.VariantToTracks?.length) return [];

    return location.VariantToTracks.map((track) => ({
      value: track.trackNo,
      label: `${track.trackNo} (${track.quantity} available)`,
      quantity: track.quantity,
      expiryDate: track.expiryDate,
      issueDate: track.issueDate,
    }));
  };

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
      quantity: product?.trackType === "serial" ? 1 : "",
      expirationDate: null,
      issueDate: null,
    });
  };

  const handleSave = () => {
    const totalQuantity = items.reduce((sum, item) => {
      return product?.trackType === "batch"
        ? sum + Number(item.quantity || 0)
        : sum + 1;
    }, 0);

    if (totalQuantity !== returnedQuantity) {
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
          <h2>
            {product?.trackType === "serial"
              ? "Serial Numbers"
              : "Batch Numbers"}
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

          <div className="formGrid">
            {product?.trackType === "batch" ? (
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

                  <button className="addButton" onClick={handleAdd}>
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
                        <label>
                          <span className="required">*</span>
                          {t("Serial Quantity")}
                        </label>
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
              (product?.trackType === "serial" &&
                items.some((item) => !item.serialNumber))
            }
          >
            {t("Save")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SpecialProductModal;

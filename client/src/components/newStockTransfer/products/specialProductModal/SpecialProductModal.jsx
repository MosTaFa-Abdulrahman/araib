import "./specialProductModal.scss";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import Modal from "../../../global/modal/Modal";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const SpecialProductModal = ({
  isOpen,
  onClose,
  product,
  onSave,
  existingItems = [],
  transferQty = 0,
}) => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [internalTransferQty, setInternalTransferQty] = useState(transferQty);
  const [currentItem, setCurrentItem] = useState({
    serialNumber: "",
    quantity: product?.trackType === "serial" ? 1 : "",
    expirationDate: null,
    issueDate: null,
  });

  // Clear items when transfer quantity changes
  useEffect(() => {
    if (internalTransferQty !== transferQty) {
      setItems([]);
      setInternalTransferQty(transferQty);
    }
  }, [transferQty]);

  // Reset form when modal closes
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
    }
  }, [isOpen, product]);

  const getBatchOrSerialNumbers = () => {
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
  };

  const getAvailableQuantityForBatch = (batchNumber) => {
    const batch = getBatchOrSerialNumbers().find(
      (item) => item.value === batchNumber
    );
    if (!batch) return 0;

    // Subtract any quantity already used in other items
    const usedQuantity = items.reduce((sum, item) => {
      return item.serialNumber === batchNumber
        ? sum + Number(item.quantity || 0)
        : sum;
    }, 0);

    return batch.quantity - usedQuantity;
  };

  const handleInputChange = (field, value) => {
    if (field === "quantity" && product?.trackType === "serial") return;

    if (field === "quantity") {
      const numValue = Number(value);
      const availableQty = getAvailableQuantityForBatch(
        currentItem.serialNumber
      );

      if (value === "" || numValue <= 0 || numValue > availableQty) {
        setErrors((prev) => ({
          ...prev,
          quantity:
            numValue <= 0
              ? "Quantity must be greater than 0"
              : `Maximum available quantity is ${availableQty}`,
        }));
        return;
      }
      setErrors((prev) => ({ ...prev, quantity: null }));
    }

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

    if (field === "serialNumber") {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

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

    if (totalQuantity !== internalTransferQty) {
      setErrors({
        quantity: t(
          `Total quantity must match transfer quantity (${internalTransferQty})`
        ),
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
              <span>Transfer Quantity: {internalTransferQty}</span>
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
                    onClick={handleAdd}
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
                        onClick={() =>
                          setItems(items.filter((_, i) => i !== index))
                        }
                        type="button"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
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
                          newItems[index] = {
                            serialNumber: "",
                            quantity: 1,
                            expirationDate: null,
                            issueDate: null,
                          };
                          setItems(newItems);
                        }}
                        type="button"
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
          <button className="cancelBtn" onClick={onClose} type="button">
            {t("Cancel")}
          </button>
          <button
            className="saveButton"
            onClick={handleSave}
            type="button"
            disabled={
              items.length === 0 ||
              (product?.trackType === "batch" &&
                items.reduce(
                  (sum, item) => sum + Number(item.quantity || 0),
                  0
                ) !== internalTransferQty) ||
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

import "./specialProductModal.scss";
import { useState, useEffect } from "react";
import { Edit2, Plus, X } from "lucide-react";
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
}) {
  const { t } = useTranslation();

  const [items, setItems] = useState(existingItems);
  const [errors, setErrors] = useState({});
  const [currentItem, setCurrentItem] = useState({
    serialNumber: "",
    quantity: product?.trackType === "serial" ? 1 : "",
    expirationDate: null,
    issueDate: null,
  });
  const [editIndex, setEditIndex] = useState(-1);

  useEffect(() => {
    setItems(existingItems);
  }, [existingItems]);

  useEffect(() => {
    if (isOpen) {
      setCurrentItem({
        serialNumber: "",
        quantity: product?.trackType === "serial" ? 1 : "",
        expirationDate: null,
        issueDate: null,
      });
      setErrors({});
      setEditIndex(-1);
    }
  }, [isOpen, product]);

  // Handle Valdiate Forms
  const validateForm = () => {
    const newErrors = {};
    const trimmedSerialNumber = currentItem.serialNumber?.trim();

    // Check if serial/batch/ecard number is provided
    if (!trimmedSerialNumber) {
      newErrors.serialNumber = t(
        `${
          product?.Product?.type === "ecard"
            ? "eCard"
            : product?.trackType === "serial"
            ? "Serial"
            : "Batch"
        } number is required`
      );
    }

    // Check for uniqueness (excluding the current item being edited)
    const isDuplicate = items.some(
      (item, index) =>
        index !== editIndex &&
        item.serialNumber.toLowerCase() === trimmedSerialNumber.toLowerCase()
    );

    if (isDuplicate) {
      newErrors.serialNumber = t(
        `This ${
          product?.Product?.type === "ecard"
            ? "eCard"
            : product?.trackType === "serial"
            ? "serial"
            : "batch"
        } number already exists`
      );
    }

    // Validate batch quantity if applicable
    if (product?.trackType === "batch" && !currentItem.quantity) {
      newErrors.quantity = t("Batch quantity is required");
    }

    return newErrors;
  };

  const handleInputChange = (field, value) => {
    if (field === "quantity" && product?.trackType === "serial") return;

    setCurrentItem((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  //  Handle Add Current Item
  const addCurrentItem = () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const newItem = {
      ...currentItem,
      serialNumber: currentItem.serialNumber.trim(),
      quantity:
        product?.trackType === "serial" ? 1 : Number(currentItem.quantity),
      expirationDate: currentItem.expirationDate,
      issueDate: currentItem.issueDate,
    };

    if (editIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[editIndex] = newItem;
      setItems(updatedItems);
      setEditIndex(-1);
    } else {
      setItems((prev) => [...prev, newItem]);
    }

    setCurrentItem({
      serialNumber: "",
      quantity: product?.trackType === "serial" ? 1 : "",
      expirationDate: null,
      issueDate: null,
    });
    setErrors({});
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCurrentItem();
    }
  };

  const handleEdit = (index) => {
    setCurrentItem(items[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (items.length > 0) {
      onSave(items);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="specialProductModal">
        <div className="modalHeader">
          <h2>
            {product?.Product?.type === "ecard"
              ? t("Enter eCard codes")
              : t(
                  product?.trackType === "serial"
                    ? t("Enter the serial numbers")
                    : t("Enter the batch numbers")
                )}
          </h2>
        </div>

        <div className="modalBody">
          <div className="productInfo">
            <span className="name">{product?.name}</span>
            <span className="sku">{product?.sku}</span>
          </div>

          <div className="inputSection">
            <form onSubmit={(e) => e.preventDefault()} className="inputGroup">
              <div className="inputWrapper">
                <label>
                  <span className="required">*</span>
                  {product?.Product?.type === "ecard"
                    ? t("eCard Code")
                    : product?.trackType === "serial"
                    ? t("Serial number")
                    : t("Batch Id")}
                </label>
                <input
                  type="text"
                  placeholder={
                    product?.Product?.type === "ecard"
                      ? t("eCard Code")
                      : product?.trackType === "serial"
                      ? t("Serial number")
                      : t("Batch Id")
                  }
                  value={currentItem.serialNumber}
                  onChange={(e) =>
                    handleInputChange("serialNumber", e.target.value)
                  }
                  onKeyDown={handleKeyPress}
                  className={errors.serialNumber ? "error" : ""}
                  autoFocus
                />
                {errors.serialNumber && (
                  <span className="errorText">{errors.serialNumber}</span>
                )}
              </div>

              {product?.trackType === "batch" && (
                <div className="inputWrapper">
                  <label>
                    <span className="required">*</span>
                    {t("Batch qty")}
                  </label>
                  <input
                    type="number"
                    placeholder={t("Batch qty")}
                    value={currentItem.quantity}
                    onChange={(e) =>
                      handleInputChange("quantity", e.target.value)
                    }
                    onKeyDown={handleKeyPress}
                    className={errors.quantity ? "error" : ""}
                    min="1"
                  />
                  {errors.quantity && (
                    <span className="errorText">{errors.quantity}</span>
                  )}
                </div>
              )}

              {/* Date Time for ((Batch + Serial)) */}
              {product?.Product?.type === "ecard" ? (
                ""
              ) : (
                <>
                  <div className="inputWrapper">
                    <label>{t("Expiration Date")}</label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={currentItem.expirationDate}
                        onChange={(date) =>
                          handleInputChange("expirationDate", date)
                        }
                        format="dd/MM/yyyy"
                        className="datePicker"
                        slotProps={{
                          textField: {
                            placeholder: t("Expiration Date"),
                            size: "small",
                            onKeyDown: handleKeyPress,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>

                  <div className="inputWrapper">
                    <label>{t("Issue Date")}</label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={currentItem.issueDate}
                        onChange={(date) =>
                          handleInputChange("issueDate", date)
                        }
                        format="dd/MM/yyyy"
                        className="datePicker"
                        slotProps={{
                          textField: {
                            placeholder: t("Issue Date"),
                            size: "small",
                            onKeyDown: handleKeyPress,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </>
              )}

              <button
                type="button"
                className="addButton"
                onClick={addCurrentItem}
                disabled={!currentItem.serialNumber?.trim()}
              >
                <Plus size={10} />
              </button>
            </form>

            <span className="helpText">
              {t("Press Enter To save and add new number")}
            </span>
          </div>

          <div className="itemsList">
            {items.map((item, index) => (
              <div key={index} className="itemRow">
                <div className="itemNumber">
                  <span>{item.serialNumber}</span>
                </div>
                {product?.trackType === "batch" && (
                  <div className="quantity">
                    <span>{item.quantity}</span>
                  </div>
                )}
                <div className="date">
                  {item.expirationDate?.toLocaleDateString()}
                </div>
                <div className="date">
                  {item.issueDate?.toLocaleDateString()}
                </div>
                <div className="actions">
                  <button
                    type="button"
                    className="editButton"
                    onClick={() => handleEdit(index)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    className="deleteButton"
                    onClick={() => handleDelete(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modalFooter">
          <button type="button" className="backButton" onClick={onClose}>
            {t("Back")}
          </button>
          <button
            type="button"
            className="saveButton"
            onClick={handleSave}
            disabled={items.length === 0}
          >
            {t("Add")} {items.length} {t("Products")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default SpecialProductModal;

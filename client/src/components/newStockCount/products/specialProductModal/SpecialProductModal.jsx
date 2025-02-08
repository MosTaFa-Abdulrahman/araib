import "./specialProductModal.scss";
import { useState, useEffect } from "react";
import Modal from "../../../global/modal/Modal";
import InfoTooltip from "../../../global/infoTooltip/InfoTooltip";
import { useTheme } from "../../../../context/ThemeContext";

function SpecialProductModal({ isOpen, onClose, product, onSave }) {
  const { theme } = useTheme();

  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});

  // Initialize based on product type
  useEffect(() => {
    if (isOpen && product) {
      if (product.trackType === "batch") {
        // Initialize batch items - preserve existing quantities and differences
        const initialBatchItems = product.batches.map((batch) => {
          return {
            number: batch.number,
            quantity: batch.quantity || 0,
            expected: batch.expected,
            difference: batch.difference || 0,
            expiryDate: batch.expiryDate,
          };
        });
        setSelectedItems(initialBatchItems);
      } else if (product.trackType === "serial") {
        // Initialize serial items with previous selections
        const selectedSerials = product.serials
          .filter((serial) => serial.isSelected)
          .map((serial) => ({
            number: serial.number,
            quantity: 1,
            addedDate: serial.addedDate,
            expiryDate: serial.expiryDate,
          }));
        setSelectedItems(selectedSerials);
      } else if (product.Product?.type === "ecard") {
        // Initialize ecard items with previous selections
        const selectedCards = product.ecards
          .filter((card) => card.isSelected)
          .map((card) => ({
            number: card.number,
            quantity: 1,
            addedDate: card.addedDate,
          }));
        setSelectedItems(selectedCards);
      }

      setSearchTerm("");
      setErrors({});
    }
  }, [isOpen, product]);

  // Get ModalTitle
  const getModalTitle = () => {
    if (!product) return "";
    if (product.Product?.type === "ecard") return "Count E-Card Number";
    if (product.trackType === "serial") return "Count Serial Number";
    if (product.trackType === "batch") return "Count Batch Number";
    return "Count Product";
  };

  // Handle Filtered Batches
  const filteredBatches = () => {
    if (!product?.batches) return [];
    return product.batches.filter((batch) =>
      batch.number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Handle Filtered Serials
  const filteredSerials = () => {
    if (!product?.serials) return [];
    return product.serials.filter((serial) =>
      serial.number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Handle Filtered Ecards
  const filteredEcards = () => {
    if (!product?.ecards) return [];
    return product.ecards.filter((card) =>
      card.number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Handle BatchQuantityChange
  const handleBatchQuantityChange = (batchNumber, value) => {
    const quantity = Math.max(0, Number(value));
    setSelectedItems((prev) => {
      return prev.map((item) => {
        if (item.number === batchNumber) {
          const expected =
            product?.batches?.find((b) => b.number === batchNumber)?.expected ||
            0;
          const difference = quantity - expected;
          return { ...item, quantity, difference };
        }
        return item;
      });
    });
  };

  // Handle Toggle Serial Numbers
  const handleToggleSerialNumber = (serialNumber) => {
    setSelectedItems((prev) => {
      const exists = prev.find((item) => item.number === serialNumber);
      if (exists) {
        return prev.filter((item) => item.number !== serialNumber);
      } else {
        const expiryDate =
          product?.trackType === "serial"
            ? product?.serials?.find((s) => s.number === serialNumber)
                ?.expiryDate
            : null;

        return [
          ...prev,
          {
            number: serialNumber,
            quantity: 1,
            addedDate: new Date().toLocaleDateString(),
            expiryDate,
          },
        ];
      }
    });
  };

  //  ***************************** ((Rendered)) ****************************** //
  // Render BatchContent
  const renderBatchContent = () => (
    <div className="modal-content">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Batch Number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="product-info">
        <span className="product-name">
          {product?.name || "Unknown Product"}
        </span>
        <span className="product-sku">{product?.sku || "No SKU"}</span>
      </div>

      <div className="batch-grid">
        <div className="grid-header">
          <span>Batch Number</span>
          <span>Quantity</span>
          <span>Expected</span>
          <span>Difference</span>
          <span>Expiry Date</span>
        </div>

        {filteredBatches().map((batch) => (
          <div key={batch.number} className="grid-row">
            <span>{batch.number}</span>
            <input
              type="number"
              value={
                selectedItems.find((i) => i.number === batch.number)
                  ?.quantity || ""
              }
              onChange={(e) =>
                handleBatchQuantityChange(batch.number, e.target.value)
              }
              min="0"
              className="quantity-input"
            />
            <span>{batch.expected}</span>
            <span
              className={`difference ${
                selectedItems.find((i) => i.number === batch.number)
                  ?.difference > 0
                  ? "positive"
                  : selectedItems.find((i) => i.number === batch.number)
                      ?.difference < 0
                  ? "negative"
                  : ""
              }`}
            >
              {selectedItems.find((i) => i.number === batch.number)
                ?.difference || "-"}
            </span>
            <span>{batch.expiryDate}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Render SerialContent
  const renderSerialContent = () => (
    <div className="modal-content">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Serial Number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="product-info">
        <span className="product-name">
          {product?.name || "Unknown Product"}
        </span>
        <span className="product-sku">{product?.sku || "No SKU"}</span>
        <div className="count-info">
          <span>Count: {selectedItems.length}</span>
          <span>Expected: {product?.expected || 0}</span>
        </div>
      </div>

      <div className="serial-grid">
        <div className="grid-header">
          <span></span>
          <span>Serial Number</span>
          <span>Status</span>
          <span>Added Date</span>
          <span>Expiry Date</span>
        </div>

        {filteredSerials().map((serial) => (
          <div key={serial.number} className="grid-row">
            <input
              type="checkbox"
              checked={selectedItems.some(
                (item) => item.number === serial.number
              )}
              onChange={() => handleToggleSerialNumber(serial.number)}
              disabled={serial.status === "Unavailable"}
            />
            <span>{serial.number}</span>
            <span className={`status ${serial.status?.toLowerCase() || ""}`}>
              {serial.status}
            </span>
            <span>{serial.addedDate}</span>
            <span>{serial.expiryDate}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Render EcardContent
  const renderEcardContent = () => (
    <div className="modal-content">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by E-Card Number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="product-info">
        <span className="product-name">
          {product?.name || "Unknown Product"}
        </span>
        <span className="product-sku">{product?.sku || "No SKU"}</span>
        <div className="count-info">
          <span>Count: {selectedItems.length}</span>
          <span>Expected: {product?.expected || 0}</span>
        </div>
      </div>

      <div className="serial-grid">
        <div className="grid-header">
          <span></span>
          <span>E-Card Number</span>
          <span>Status</span>
          <span>Added Date</span>
        </div>

        {filteredEcards().map((card) => (
          <div key={card.number} className="grid-row">
            <input
              type="checkbox"
              checked={selectedItems.some(
                (item) => item.number === card.number
              )}
              onChange={() => handleToggleSerialNumber(card.number)}
              disabled={card.status === "Unavailable"}
            />
            <span>{card.number}</span>
            <span className={`status ${card.status?.toLowerCase() || ""}`}>
              {card.status}
            </span>
            <span>{card.addedDate}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ********************** (Actions Buttons) ************************ //
  // Handle Save
  const handleSave = () => {
    const savedData = {
      counted: 0,
      items: selectedItems,
    };

    if (product.trackType === "batch") {
      savedData.counted = selectedItems.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );
    } else {
      savedData.counted = selectedItems.length;
    }

    onSave(savedData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={`special-product-modal ${theme}`}>
        <div className="modal-header">
          <h2>{getModalTitle()}</h2>
        </div>

        {product.Product?.type === "ecard" && renderEcardContent()}
        {product?.trackType === "serial" && renderSerialContent()}
        {product?.trackType === "batch" && renderBatchContent()}

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={
              (product.trackType === "batch" &&
                selectedItems.every((item) => !item.quantity)) ||
              (product.trackType !== "batch" && selectedItems.length === 0)
            }
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default SpecialProductModal;

import "./scanModal.scss";
import { useState } from "react";
import { Pen, ScanQrCode } from "lucide-react";
import Modal from "../../../global/modal/Modal";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../context/ThemeContext";

function ScanModal({ isOpen, onClose, onAddToCount, mockSearchProductss }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [barcode, setBarcode] = useState("");
  const [scannedProducts, setScannedProducts] = useState([]);
  const [error, setError] = useState("");

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const product = mockSearchProductss.find((p) => p.sku === barcode);

    if (!product) {
      setError(t("Product not found"));
      return;
    }

    const existingProduct = scannedProducts.find((p) => p.sku === barcode);
    if (existingProduct) {
      setScannedProducts((prev) =>
        prev.map((p) => {
          if (p.sku === barcode) {
            return { ...p, count: p.count + 1 };
          }
          return p;
        })
      );
    } else {
      setScannedProducts((prev) => [
        ...prev,
        {
          name: product.name,
          sku: product.sku,
          barcode: barcode,
          count: 1,
        },
      ]);
    }

    setBarcode("");
    setError("");
  };

  const handleCountChange = (sku, newCount) => {
    setScannedProducts((prev) =>
      prev.map((p) => {
        if (p.sku === sku) {
          return { ...p, count: parseInt(newCount) || 0 };
        }
        return p;
      })
    );
  };

  const handleAddToCount = () => {
    onAddToCount(scannedProducts);
    setScannedProducts([]);
    onClose();
  };

  const handleClose = () => {
    setBarcode("");
    setScannedProducts([]);
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className={`scan-container ${theme}`}>
        <h2 className="scan-title">{t("Barcode Scanning")}</h2>

        <form onSubmit={handleBarcodeSubmit} className="scan-form">
          <div className="form-group">
            <label>{t("Barcode")}</label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder={t("Scan or enter barcode")}
              autoFocus
            />
            <span className="helper-text">
              {t(
                "Click in the Barcode field to count the products by scanning"
              )}
            </span>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        <div className="scan-content">
          {scannedProducts.length > 0 ? (
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>{t("Product Name")}</th>
                    <th>{t("Barcode")}</th>
                    <th>{t("Count")}</th>
                    <th>{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {scannedProducts.map((product) => (
                    <tr key={product.sku}>
                      <td>{product.name}</td>
                      <td>{product.barcode}</td>
                      <td>
                        <input
                          type="number"
                          value={product.count}
                          onChange={(e) =>
                            handleCountChange(product.sku, e.target.value)
                          }
                          min="1"
                        />
                      </td>
                      <td>
                        <button
                          className="edit-button"
                          onClick={() =>
                            handleCountChange(product.sku, product.count)
                          }
                        >
                          <Pen size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="icon-container">
                <ScanQrCode className="scanQrCodeIcon" />
              </div>
              <h3>{t("Start scanning")}</h3>
              <p>
                {t(
                  "By scanning the products will be added and counted instantly"
                )}
              </p>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button className="cancel-button" onClick={handleClose}>
            {t("Cancel")}
          </button>
          <button
            className="add-button"
            onClick={handleAddToCount}
            disabled={scannedProducts.length === 0}
          >
            {t("Add to Count")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ScanModal;

import "./digitalType.scss";
import { useState } from "react";
import { Monitor, CreditCard, Trash2, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

function DigitalType() {
  const { t } = useTranslation();

  const [selectedType, setSelectedType] = useState("e-card");
  const [codes, setCodes] = useState([]);
  const [newCode, setNewCode] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [currentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Handle Delete Code
  const handleDelete = (codeToDelete) => {
    setCodes(codes.filter((code) => code !== codeToDelete));
  };

  // Handle Add Code
  const handleAddCode = (e) => {
    if (e.key === "Enter" && newCode.trim()) {
      if (!/^\d+$/.test(newCode)) {
        return;
      }

      if (codes.includes(newCode)) {
        return;
      }

      setCodes([...codes, newCode]);
      setNewCode("");
    }
  };

  return (
    <div className="digital-product-selector">
      <div className="product-card">
        <div className="product-header">
          <span className="required">*</span>
          <h2>{t("Digital Product Type")}</h2>
          <div className="info-icon">
            <HelpCircle size={16} />
            <div className="tooltip">
              {t("Select the type of digital product.")}
            </div>
          </div>
        </div>

        <p className="warning-text">
          {t("You can't edit this choice after saving the product")}
        </p>

        <div className="product-types">
          <label
            className={`product-type ${
              selectedType === "e-product" ? "selected" : ""
            }`}
          >
            <input
              type="radio"
              name="productType"
              value="e-product"
              checked={selectedType === "e-product"}
              onChange={() => setSelectedType("e-product")}
            />
            <div className="product-content">
              <Monitor className="icon" />
              <span className="title">{t("E-Product")}</span>
              <span className="example">{t("e.g. Courses, E-Books")}</span>
            </div>
          </label>

          <label
            className={`product-type ${
              selectedType === "e-card" ? "selected" : ""
            }`}
          >
            <input
              type="radio"
              name="productType"
              value="e-card"
              checked={selectedType === "e-card"}
              onChange={() => setSelectedType("e-card")}
            />
            <div className="product-content">
              <CreditCard className="icon" />
              <span className="title">{t("E-Card")}</span>
              <span className="example">{t("e.g. iTunes, Google Play")}</span>
            </div>
          </label>
        </div>

        {selectedType === "e-product" && (
          <div className="url-section">
            <div className="url-label">{t("Product URL")}</div>
            <input
              type="text"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              className="url-input"
            />
          </div>
        )}

        {selectedType === "e-card" && (
          <div className="e-card-section">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder={t("E-Card number")}
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                onKeyPress={handleAddCode}
              />
            </div>
            <p className="hint-text">
              {t("Press Enter to add Pack New Sizes")}
            </p>

            {codes.length > 0 && (
              <>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>{t("Code")}</th>
                        <th>{t("Status")}</th>
                        <th>{t("Action")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codes.map((code) => (
                        <tr key={code}>
                          <td>{code}</td>
                          <td className="status">{t("New")}</td>
                          <td>
                            <button
                              onClick={() => handleDelete(code)}
                              className="delete-button"
                              aria-label={t("Delete code")}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <div className="entries-info">
                    {t(
                      "Showing 1 to {{codesLength}} of {{codesLength}} entries",
                      {
                        codesLength: codes.length,
                      }
                    )}
                  </div>
                  <div className="pagination-controls">
                    <button className="pagination-button" disabled>
                      «
                    </button>
                    <button className="pagination-button" disabled>
                      ‹
                    </button>
                    <span className="current-page">{currentPage}</span>
                    <button className="pagination-button" disabled>
                      ›
                    </button>
                    <button className="pagination-button" disabled>
                      »
                    </button>
                    <select
                      value={entriesPerPage}
                      onChange={(e) =>
                        setEntriesPerPage(Number(e.target.value))
                      }
                      className="entries-select"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="quantity-info">
                  {t("Available Quantity: {{codesLength}}", {
                    codesLength: codes.length,
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DigitalType;

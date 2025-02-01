import "./details.scss";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

// Mock Data
import { locations } from "../../../dummyData";
import { suppliers } from "../../../dummyData";

function Details({ onLocationSelect, onPOInvoiceSearch, initialData }) {
  const { t } = useTranslation();

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [poInvoiceNumber, setPOInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  // Handle PO number changes
  const handlePOInvoiceChange = (e) => {
    const value = e.target.value;
    setPOInvoiceNumber(value);

    // Search for PO when Enter is pressed
    if (e.key === "Enter") {
      onPOInvoiceSearch(value);
    }
  };

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setSelectedSupplier(initialData.supplier.name);
      setSelectedLocation(initialData.stockLocationName);
      setNotes(initialData.notes);
    }
  }, [initialData]);

  // Handle Location Select
  const handleLocationSelect = (location) => {
    const locationDisplay = `${location.code} ${location.name}`;
    setSelectedLocation(locationDisplay);
    onLocationSelect(locationDisplay);
  };

  return (
    <div className="purchase-invoice-details">
      <h2>{t("Return Invoice Details")}</h2>

      <div className="form-grid">
        <div className="form-group">
          <label>
            {/* <span className="required">*</span> */}
            {t("PO Invoice Number")}
          </label>
          <input
            type="text"
            value={poInvoiceNumber}
            onChange={handlePOInvoiceChange}
            onKeyDown={handlePOInvoiceChange}
            placeholder={t("Enter PO invoice number")}
            // required
          />
        </div>

        <div className="form-group">
          <label>
            <span className="required">*</span>
            {t("Supplier Name")}
          </label>
          <div className="select-container">
            <div
              className="custom-select"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{selectedSupplier || t("Select Supplier")}</span>
              <ChevronDown size={20} />
            </div>
            {isDropdownOpen && (
              <div className="select-dropdown">
                {suppliers.map((option) => (
                  <div
                    key={option.id}
                    className="select-option"
                    onClick={() => {
                      setSelectedSupplier(option.name);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {option.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>
            <span className="required">*</span>
            {t("Location")}
          </label>
          <div className="select-container">
            <div
              className="custom-select"
              onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
            >
              <span>{selectedLocation || t("Select Location")}</span>
              <ChevronDown size={20} />
            </div>
            {locationDropdownOpen && (
              <div className="select-dropdown">
                {locations?.map((location) => (
                  <div
                    key={location.id}
                    className="select-option"
                    onClick={() => {
                      handleLocationSelect(location);
                      setLocationDropdownOpen(false);
                    }}
                  >
                    {`${location.code} ${location.name}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-group full-width">
          <label>{t("Notes")} </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={200}
            placeholder={t("Enter notes")}
          />
          <div className="char-count">{notes.length}/200</div>
        </div>
      </div>
    </div>
  );
}

export default Details;

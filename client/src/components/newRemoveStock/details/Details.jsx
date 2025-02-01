import "./details.scss";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

// Mock Data
import { locations } from "../../../dummyData";

function Details({ onLocationSelect }) {
  const { t } = useTranslation();

  const [selectedLocation, setSelectedLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  // Handle Location Select
  const handleLocationSelect = (location) => {
    const locationDisplay = `${location.code} ${location.name}`;
    setSelectedLocation(locationDisplay);
    onLocationSelect(locationDisplay);
  };

  return (
    <div className="purchase-invoice-details">
      <h2>{t("Remove Invoice Details")}</h2>

      <div className="form-grid">
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

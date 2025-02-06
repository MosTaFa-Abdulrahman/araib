import "./track.scss";
import { useState, useEffect } from "react";
import { Info, FileText, Barcode } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../../context/ThemeContext";

function Track({ onTrackChange, stockDisabled }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [isChecked, setIsChecked] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [selectedTrackingType, setSelectedTrackingType] = useState("batch");

  // Update parent when tracking status changes
  const handleTrackingChange = (checked) => {
    setIsChecked(checked);
    onTrackChange({
      isTracked: checked,
      trackingType: checked ? selectedTrackingType : null,
    });
  };

  // Disable tracking when stock management is disabled
  useEffect(() => {
    if (stockDisabled && isChecked) {
      handleTrackingChange(false);
    }
  }, [stockDisabled, isChecked]);

  return (
    <div className={`track-container ${theme}`}>
      <div className="track-header">
        <div className="track-title">
          <input
            type="checkbox"
            id="trackProduct"
            checked={isChecked}
            onChange={(e) => handleTrackingChange(e.target.checked)}
            className={`track-checkbox ${stockDisabled ? "disabled" : ""}`}
            disabled={stockDisabled}
          />
          <label
            htmlFor="trackProduct"
            className={stockDisabled ? "disabled" : ""}
          >
            {t("Track this product")}
          </label>
          <div
            className="info-icon-wrapper"
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
          >
            <Info size={16} className="info-icon" />
            {tooltipVisible && (
              <div className="tooltip">
                {stockDisabled
                  ? t("Tracking is disabled when stock management is disabled")
                  : t("Enable inventory tracking for this product.")}
              </div>
            )}
          </div>
        </div>

        {isChecked && (
          <p className="track-description">
            {t(
              "You can add tracking information for your product from the product page after saving it"
            )}
          </p>
        )}
      </div>

      {isChecked && (
        <div className="tracking-options">
          <div
            className={`tracking-card ${
              selectedTrackingType === "batch" ? "selected" : ""
            }`}
            onClick={() => setSelectedTrackingType("batch")}
          >
            <div className="radio-button">
              <div
                className={`radio-inner ${
                  selectedTrackingType === "batch" ? "selected" : ""
                }`}
              />
            </div>
            <FileText size={24} className="tracking-icon" />
            <span className="tracking-label">{t("Batch number")}</span>
          </div>

          <div
            className={`tracking-card ${
              selectedTrackingType === "serial" ? "selected" : ""
            }`}
            onClick={() => setSelectedTrackingType("serial")}
          >
            <div className="radio-button">
              <div
                className={`radio-inner ${
                  selectedTrackingType === "serial" ? "selected" : ""
                }`}
              />
            </div>
            <Barcode size={24} className="tracking-icon" />
            <span className="tracking-label">{t("Serial number")}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Track;

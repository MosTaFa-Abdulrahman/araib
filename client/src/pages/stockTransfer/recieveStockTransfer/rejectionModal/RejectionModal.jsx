import "./rejectionModal.scss";
import { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../context/ThemeContext";

function RejectionModal({ isOpen, onClose, onReject }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const reasons = [
    t("Missing products"),
    t("Additional products"),
    t("Different products"),
    t("Damaged products"),
    t("Other"),
  ];

  const handleSubmit = () => {
    const finalReason =
      selectedReason === "Other" ? customReason : selectedReason;
    onReject(finalReason);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`rejection-modal-overlay ${theme}`}>
      <div className="rejection-modal">
        <div className="rejection-modal-header">
          <h2>Add Rejection Reason</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="rejection-modal-content">
          {reasons.map((reason) => (
            <label key={reason} className="radio-option">
              <input
                type="radio"
                name="rejectionReason"
                value={reason}
                checked={selectedReason === reason}
                onChange={(e) => setSelectedReason(e.target.value)}
              />
              <span className="radio-label">{reason}</span>
            </label>
          ))}

          {selectedReason === "Other" && (
            <textarea
              className="custom-reason-input"
              placeholder="Write Your Reason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}
        </div>

        <div className="rejection-modal-footer">
          <button className="back-button" onClick={onClose}>
            Back
          </button>
          <button
            className="reject-button"
            onClick={handleSubmit}
            disabled={
              !selectedReason || (selectedReason === "Other" && !customReason)
            }
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectionModal;

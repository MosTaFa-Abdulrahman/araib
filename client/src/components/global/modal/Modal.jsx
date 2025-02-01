import "./modal.scss";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

function Modal({ isOpen, onClose, children }) {
  const { i18n } = useTranslation();

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      dir={i18n.dir()}
    >
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;

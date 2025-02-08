import "./specialProductModal.scss";
import Modal from "../../../../components/global/modal/Modal";
import { useTranslation } from "react-i18next";
import { useTheme } from "@emotion/react";

function SpecialProductModal({ isOpen, onClose, product }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={`special-product-modal ${theme}`}>
        <div className="modal-header">
          <h2>
            {product?.trackType === "serial"
              ? t("Serial Numbers")
              : t("Batch Numbers")}
          </h2>
        </div>

        <div className="modal-body">
          <div className="product-info">
            <span className="name">{product?.productVariantName}</span>
            <span className="sku">{product?.sku}</span>
          </div>

          <div className="table-container">
            <div className="table-header">
              <div>
                {product?.trackType === "serial"
                  ? t("Serial Number ID")
                  : t("Batch ID")}
              </div>
              <div>{t("Sent Stock")}</div>
              <div>{t("Received QTY")}</div>
            </div>

            <div className="table-body">
              {product?.transferStockVariantToTracks.map((track) => (
                <div key={track.id} className="table-row">
                  <div>{track.trackNo}</div>
                  <div>{track.transferredQuantity}</div>
                  <div>{track.receivedQuantity}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            {t("Close")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default SpecialProductModal;

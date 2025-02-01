import "./getStockTransferById.scss";
import { useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import EyeTooltip from "../../../components/global/eyeTooltip/EyeTooltip";
import SpecialProductModal from "./specialProductModal/SpecialProductModal";
import { formatDate } from "../../../components/global/formatDate";

// Mock Data
import { transferInvoiceById } from "../../../dummyData";

function GetStockTransferById() {
  const { t } = useTranslation();
  const { invoiceNumber } = useParams();

  const [openDestination, setOpenDestination] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleModalOpen = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const getRejectedQuantity = (sent, received) => {
    return sent - received;
  };

  const calculateTotals = () => {
    return transferInvoiceById.transferStockDetails.reduce(
      (acc, item) => {
        acc.totalSent += item.transferredQuantity;
        acc.totalReceived += item.receivedQuantity;
        acc.totalRejected += getRejectedQuantity(
          item.transferredQuantity,
          item.receivedQuantity
        );
        return acc;
      },
      { totalSent: 0, totalReceived: 0, totalRejected: 0 }
    );
  };

  const calculateRejectedCost = () => {
    return transferInvoiceById.transferStockDetails
      .reduce((total, item) => {
        const rejectedQty = getRejectedQuantity(
          item.transferredQuantity,
          item.receivedQuantity
        );
        return total + rejectedQty * item.costPrice;
      }, 0)
      .toFixed(2);
  };

  const totals = calculateTotals();

  return (
    <div className="getStockTransferById">
      {/* Transfer Info */}
      <div className="transfer-info">
        <div className="header-info">
          <div className="info-left">
            <div className="info-item">
              <div className="invoice-number-container">
                <label>{t("Invoice Number")}</label>
                <div
                  className="status-badge"
                  data-status={transferInvoiceById.status}
                >
                  {transferInvoiceById.status === "pending" &&
                    t("Waiting Receive")}
                  {transferInvoiceById.status === "rejected" && t("Rejected")}
                  {transferInvoiceById.status === "accepted" && t("Accepted")}
                  {transferInvoiceById.status === "partially-accepted" &&
                    t("Partially Accepted")}
                  {transferInvoiceById.status === "draft" && t("Draft")}
                </div>{" "}
              </div>
              <span>{transferInvoiceById.invoiceNumber}</span>
            </div>
            <div className="info-item">
              <label>{t("Requested Date")}</label>
              <span>{formatDate(transferInvoiceById.createdAt)}</span>
            </div>
            <div className="info-item">
              <label>{t("Receiving Date")}</label>
              <span>
                <span>{formatDate(transferInvoiceById.receivingDate)}</span>
              </span>
            </div>
            <div className="info-item">
              <label>{t("Source Location")}</label>
              <span>{transferInvoiceById.sourceStockLocationName}</span>
            </div>
          </div>
          <div className="info-right">
            <div className="info-item">
              <label>{t("Destination Location")}</label>
              <span>{transferInvoiceById.destinationStockLocationName}</span>
            </div>
          </div>
        </div>
        <div className="notes">
          <label>{t("Notes")}</label>
          <p>{transferInvoiceById.notes}</p>
        </div>
      </div>

      {/* Products Section */}
      <div className="products-section">
        <div className="products-header">
          {openDestination ? (
            <ChevronDown
              className="arrow-icon"
              onClick={() => setOpenDestination(!openDestination)}
            />
          ) : (
            <ChevronUp
              className="arrow-icon"
              onClick={() => setOpenDestination(!openDestination)}
            />
          )}
          <span>{transferInvoiceById.destinationStockLocationName}</span>
        </div>

        {!openDestination && (
          <>
            <div className="products-table">
              <div className="table-header">
                <div>{t("Product Name / SKU")}</div>
                <div>{t("Sent Stock")}</div>
                <div>{t("Received QTY")}</div>
                <div>{t("Rejected Stock")}</div>
              </div>

              <div className="table-body">
                {transferInvoiceById?.transferStockDetails?.map((item) => (
                  <div key={item.id} className="product-row">
                    <div className="product-main">
                      <div className="product-info">
                        <button
                          className="toggle-button"
                          onClick={() => toggleRow(item.id)}
                        >
                          {expandedRows[item.id] ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronRight size={20} />
                          )}
                        </button>
                        <div className="name-sku">
                          <div className="product-name">
                            <span>{item.productVariantName}</span>
                            {item.trackType && (
                              <EyeTooltip
                                title={`See ${
                                  item.trackType === "batch"
                                    ? "Batch Numbers"
                                    : "Serial Numbers"
                                }`}
                                onClick={() => handleModalOpen(item)}
                              />
                            )}
                          </div>
                          <span className="sku">{item.sku}</span>
                        </div>
                      </div>
                      <div className="sent-qty">{item.transferredQuantity}</div>
                      <div className="received-qty">
                        {item.receivedQuantity}
                      </div>
                      <div className="rejected-qty">
                        {getRejectedQuantity(
                          item.transferredQuantity,
                          item.receivedQuantity
                        )}
                      </div>
                    </div>

                    {expandedRows[item.id] && (
                      <div className="product-details">
                        <div className="cost-details">
                          <div className="product-price-container">
                            <div>
                              <label>{t("Product Cost:")} </label>
                              <span>{item.costPrice.toFixed(2)}</span>
                            </div>
                            <div>
                              <label>{t("Product Price:")} </label>
                              <span>{(item.costPrice + 2).toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="product-price-container">
                            <div>
                              <label>{t("Total Qty Cost:")} </label>
                              <span>
                                {(
                                  item.costPrice * item.transferredQuantity
                                ).toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <label>{t("Total Qty Price:")} </label>
                              <span>
                                {(
                                  (item.costPrice + 2) *
                                  item.transferredQuantity
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="totals">
              <div>
                <span>{t("Total Sent:")}</span>
                <span>{totals.totalSent}</span>
              </div>
              <div>
                <span>{t("Total Received:")}</span>
                <span>{totals.totalReceived}</span>
              </div>
              <div>
                <span>{t("Total Rejected:")}</span>
                <span>{totals.totalRejected}</span>
              </div>
              <div>
                <span>{t("Rejected Cost:")}</span>
                <span>{calculateRejectedCost()}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <SpecialProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}

export default GetStockTransferById;

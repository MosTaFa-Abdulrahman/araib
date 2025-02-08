import "./getPurchaseById.scss";
import React, { useState, useCallback } from "react";
import {
  Paperclip,
  Download,
  Trash2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Printer,
} from "lucide-react";
import InfoTooltip from "../../../components/global/infoTooltip/InfoTooltip";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// Mock Data
import { singlePurchaseOrder } from "../../../dummyData";
import toast from "react-hot-toast";

function GetPurchaseById() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const { id } = useParams();

  const [expandedProduct, setExpandedProduct] = useState(null);
  const [showTotals, setShowTotals] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file) => {
    const validTypes = [
      "image/gif",
      "image/png",
      "image/jpeg",
      "image/bmp",
      "image/webp",
      "application/pdf",
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload supported file formats only."
      );
      return false;
    }

    if (file.size > 20 * 1024 * 1024) {
      // 20MB
      toast.error("File size exceeds 20MB limit.");
      return false;
    }

    return true;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(validateFile);
    if (validFiles.length > 0) {
      const newAttachments = validFiles.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        link: URL.createObjectURL(file),
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Download failed. Please try again.");
    }
  };

  const handleDeleteAttachment = (id) => {
    setAttachments((prev) => prev.filter((file) => file.id !== id));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // ************************ ///
  // Handle Pay
  const handlePayCreditAmount = () => {};

  // Handle Print Invoice
  const handlePrintInvoice = () => {};

  // Handle Cancel
  const handleCancel = () => {};

  return (
    <div className={`getPurchaseById ${theme}`}>
      <div className="content-grid">
        {/* Left Column */}
        <div className="details-card">
          <div className="titleContent">
            <h2 className="card-title">{t("Purchase Invoice Details")}</h2>
            <div className="statusContainer">
              <span
                className={`status-chip ${singlePurchaseOrder?.paymentStatus}`}
              >
                {t(singlePurchaseOrder?.paymentStatus)}
              </span>
            </div>
          </div>

          <div className="details-content">
            <div className="detail-row">
              <span className="label">{t("Supplier Invoice Number")}</span>
              <span className="value">{singlePurchaseOrder.invoiceNumber}</span>
            </div>
            <div className="detail-row">
              <span className="label">{t("Supplier Name")}</span>
              <span className="value">
                {singlePurchaseOrder?.supplier?.name}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">{t("Location")}</span>
              <span className="value">
                {singlePurchaseOrder?.stockLocationName}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">{t("Issue Date")}</span>
              <span className="value">
                {new Date(singlePurchaseOrder?.issueDate).toLocaleString()}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">{t("Notes")}</span>
              <span className="value">{singlePurchaseOrder?.notes || "-"}</span>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="attachments-section">
            <h3 className="section-title">{t("Attachments")}</h3>

            <div
              className={`upload-zone ${isDragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="upload-content">
                <Paperclip className="icon" />
                <p>{t("Drag and drop files here")}</p>
                <span className="or-text">{t("or")}</span>
                <button
                  className="browse-button"
                  onClick={() => document.getElementById("file-input").click()}
                >
                  {t("Browse Files")}
                </button>
                <input
                  id="file-input"
                  type="file"
                  hidden
                  onChange={handleFileInputChange}
                  accept=".gif,.png,.jpg,.jpeg,.bmp,.webp,.pdf,.csv,.doc,.xlsx,.xls"
                  multiple
                />
                <p className="file-limit">
                  {t("File size is limited to 20 MB")}
                </p>
                <p className="file-types">
                  {t("Supported file formats are")}
                  <br />
                  gif, png, jpg, jpeg, bmp, webp, pdf, csv, doc, xlsx, xls
                </p>
              </div>
            </div>

            <div className="attached-files">
              {[...singlePurchaseOrder.attachments, ...attachments].map(
                (file) => (
                  <div key={file.id} className="file-item">
                    <Paperclip className="file-icon" />
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {Math.round(file.size / 1024)} KB
                    </span>
                    <div className="file-actions">
                      <Download
                        className="action-icon"
                        onClick={() => handleDownload(file.link, file.name)}
                      />
                      <Trash2
                        className="action-icon delete"
                        onClick={() => handleDeleteAttachment(file.id)}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="products-card">
          <div className="card-header">
            <h2 className="card-title">{t("Products")}</h2>
            <InfoTooltip
              title={t(
                "Products Qty, the average product cost and the latest buying price are updated after completing the purchase Invoice"
              )}
            />
          </div>

          {/* Table */}
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>{t("Product Name / SKU")}</th>
                  <th>{t("New QTY")}</th>
                  <th>
                    {t("New Cost")} ({t("Tax Exclusive")})
                  </th>
                  <th>{t("Tax Code")}</th>
                </tr>
              </thead>
              <tbody>
                {singlePurchaseOrder?.stockOrderItems?.map((product) => (
                  <React.Fragment key={product.id}>
                    <tr className="product-row">
                      <td className="product-info">
                        <button
                          className="expand-button"
                          onClick={() =>
                            setExpandedProduct(
                              expandedProduct === product?.id
                                ? null
                                : product?.id
                            )
                          }
                        >
                          {expandedProduct === product.id ? (
                            <ChevronDown />
                          ) : (
                            <ChevronRight />
                          )}
                        </button>
                        <div>
                          <div className="product-name">{product.name}</div>
                          <div className="product-sku">{product.sku}</div>
                        </div>
                      </td>
                      <td>{product.requestedQuantity}</td>
                      <td>{formatCurrency(product.requisitionCost)}</td>
                      <td>{t(product?.defaultTaxConfig?.name)}</td>
                    </tr>

                    {expandedProduct === product.id && (
                      <tr className="expanded-details">
                        <td colSpan="4">
                          <div className="details-grid">
                            <div className="details-column">
                              <div className="detail-item">
                                <div className="detail-label">
                                  {t("Available Qty")}
                                  <span className="sublabel">
                                    {t("(Available in stock)")}
                                  </span>
                                </div>
                                <div className="detail-value">
                                  {product.availableLocationQuantity}
                                </div>
                              </div>
                              <div className="detail-item">
                                <div className="detail-label">
                                  {t("Expected Qty")}
                                  <span className="sublabel">
                                    {t("(Total will be available)")}
                                  </span>
                                </div>
                                <div className="detail-value">
                                  {product.availableLocationQuantity +
                                    product.receivedQuantity}
                                </div>
                              </div>
                            </div>
                            <div className="details-column">
                              <div className="detail-item">
                                <div className="detail-label">
                                  {t("Average Cost")}
                                  <span className="sublabel">
                                    ({t("Tax Exclusive")})
                                  </span>
                                </div>
                                <div className="detail-value">
                                  {formatCurrency(product.averageCost)}
                                </div>
                              </div>
                              <div className="detail-item">
                                <div className="detail-label">
                                  {t("Buy Price")}
                                </div>
                                <div className="detail-value">
                                  {formatCurrency(product.buyPrice)}
                                </div>
                              </div>
                            </div>
                            <div className="details-column">
                              <div className="detail-item">
                                <div className="detail-label">
                                  {t("Total Cost")}
                                  <span className="sublabel">
                                    ({t("Tax Exclusive")})
                                  </span>
                                </div>
                                <div className="detail-value">
                                  {formatCurrency(product.subTotalTaxExclusive)}
                                </div>
                              </div>
                              <div className="detail-item">
                                <div className="detail-label">
                                  {t("Tax Amount")}
                                </div>
                                <div className="detail-value">
                                  {formatCurrency(
                                    product?.receivedQuantity *
                                      product.requisitionCost *
                                      0.15
                                  )}
                                </div>
                              </div>
                              <div className="detail-item">
                                <div className="detail-label">
                                  {t("Total Cost")}
                                  <span className="sublabel">
                                    ({t("Tax Inclusive")})
                                  </span>
                                </div>
                                <div className="detail-value">
                                  {formatCurrency(
                                    product.subTotalTaxExclusive +
                                      product?.receivedQuantity *
                                        product.requisitionCost *
                                        0.15
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="totals-section">
            <button
              className="toggle-totals"
              onClick={() => setShowTotals(!showTotals)}
            >
              {showTotals ? <ChevronUp /> : <ChevronDown />}
            </button>
            {showTotals && (
              <div className="totals-content">
                <div className="total-row">
                  <span>
                    {t("Sub Total")} ({t("Tax Exclusive")})
                  </span>
                  <span>
                    {formatCurrency(singlePurchaseOrder?.subTotalTaxExclusive)}
                  </span>
                </div>
                <div className="total-row discount">
                  <span>{t("Discount Amount")}</span>
                  <span>
                    - {formatCurrency(singlePurchaseOrder?.discountAmount)}
                  </span>
                </div>
                <div className="total-row tax">
                  <span>{t("Total Tax")}</span>
                  <span>+ {formatCurrency(singlePurchaseOrder?.totalTax)}</span>
                </div>
                <div className="total-row final">
                  <span>
                    {t("Total")} ({t("Tax Inclusive")})
                  </span>
                  <span>
                    {formatCurrency(singlePurchaseOrder?.totalTaxInclusive)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Paid */}
          <div className="paidContainer">
            <div className="paidContent">
              <div className="paidTitle">{t("Paid Amount")}</div>
              <div className="paidValue">
                {formatCurrency(singlePurchaseOrder?.paidAmount)}
              </div>
            </div>
            <div className="paidContent">
              <div className="paidTitle">{t("Credit Amount")}</div>
              <div style={{ color: "tomato" }}>
                {formatCurrency(
                  singlePurchaseOrder?.totalTaxInclusive -
                    singlePurchaseOrder?.paidAmount || ""
                )}
              </div>
            </div>
            <div className="paidContent">
              <div className="paidTitle">{t("Payment Due Date")}</div>
              <div>
                {new Date(singlePurchaseOrder?.paymentDueDate).toLocaleString()}
              </div>
            </div>
            <div className="paidContent">
              <div className="paidTitle">{t("Products Delivery Date")}</div>
              <div>
                {new Date(
                  singlePurchaseOrder?.expectedDeliveryDate
                ).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons  */}
      <div className="action-buttons">
        <button className="cancel-btn" onClick={handleCancel}>
          {t("Cancel")}
        </button>
        <button className="print-btn" onClick={handlePrintInvoice}>
          <Printer size={16} />
          <span>{t("Print Invoice")}</span>
        </button>

        {singlePurchaseOrder?.paymentStatus === "fully-paid" ? (
          ""
        ) : (
          <button className="pay-btn" onClick={handlePayCreditAmount}>
            {t("Pay Credit Amount")}
          </button>
        )}
      </div>
    </div>
  );
}

export default GetPurchaseById;

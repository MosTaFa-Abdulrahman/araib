import "./getRemoveStockById.scss";
import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  UndoDot,
  Printer,
} from "lucide-react";
import InfoTooltip from "../../../components/global/infoTooltip/InfoTooltip";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// Mock Data
import { removeInvoiceById } from "../../../dummyData";

function GetRemoveStockById() {
  const { theme } = useTheme();

  const { invoiceNumber } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [expandedProduct, setExpandedProduct] = useState(null);
  const [showTotals, setShowTotals] = useState(true);

  // Handle Format Currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // ************************* //
  // Handle Print
  const handlePrint = () => {
    try {
      console.log(`Printed successfully 😍`);
    } catch (error) {
      console.log(`${error.message} 😥`);
    }
  };

  // Handle Back
  const handleBack = () => {
    try {
      navigate(-1);
      console.log(`Backed Success 😍`);
    } catch (error) {
      console.log(`${error.message} 😥`);
    }
  };

  return (
    <div className={`getRemoveStockById ${theme}`}>
      <div className="content-grid">
        {/* Left Column */}
        <div className="details-card">
          <div className="titleContent">
            <h2 className="card-title">{t("Remove Invoice Details")}</h2>
          </div>

          <div className="details-content">
            <div className="detail-row">
              <span className="label">{t("Remove Invoice Number")}</span>
              <span className="value">{removeInvoiceById.invoiceNumber}</span>
            </div>

            <div className="detail-row">
              <span className="label">{t("Location")}</span>
              <span className="value">
                {removeInvoiceById.stockLocationName}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">{t("Issue Date")}</span>
              <span className="value">
                {new Date(removeInvoiceById.completeDate).toLocaleString()}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">{t("Notes")}</span>
              <span className="value">{removeInvoiceById.notes || "-"}</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="products-card">
          <div className="card-header">
            <h2 className="card-title">{t("Products")}</h2>
            <InfoTooltip
              title={t(
                "Products Qty, the average product cost and the latest buying price are updated after completing the remove Invoice"
              )}
            />
          </div>

          {/* Table */}
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>{t("Product Name / SKU")}</th>
                  <th>{t("Quantity")}</th>
                  <th>
                    {t("Cost")} ({t("Tax Exclusive")})
                  </th>
                  <th>{t("Tax Amount")}</th>
                </tr>
              </thead>
              <tbody>
                {removeInvoiceById.VariantToInvoices.map((product) => (
                  <React.Fragment key={product.id}>
                    <tr className="product-row">
                      <td className="product-info">
                        <button
                          className="expand-button"
                          onClick={() =>
                            setExpandedProduct(
                              expandedProduct === product.id ? null : product.id
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
                      <td>{product.quantity}</td>
                      <td>{formatCurrency(product.costExclusive)}</td>
                      <td>{formatCurrency(product.taxAmount)}</td>
                    </tr>

                    {expandedProduct === product.id && (
                      <tr className="expanded-details">
                        <td colSpan="4">
                          <div className="details-grid">
                            <div className="details-column">
                              <div className="detail-item">
                                <div className="detail-label">
                                  {t("Available Quantity")}
                                  <span className="sublabel">
                                    {t("(In stock)")}
                                  </span>
                                </div>
                                <div className="detail-value">
                                  {product.availableLocationQuantity}
                                </div>
                              </div>
                              {product.VariantToInvoiceTracks &&
                                product.VariantToInvoiceTracks.length > 0 && (
                                  <div className="detail-item">
                                    <div className="detail-label">
                                      {t("Track Number")}
                                    </div>
                                    <div className="detail-value">
                                      {
                                        product.VariantToInvoiceTracks[0]
                                          .trackNo
                                      }
                                    </div>
                                  </div>
                                )}
                            </div>
                            <div className="details-column">
                              <div className="detail-item">
                                <div className="detail-label">
                                  {t("Buy Price")} ({t("Exclusive")})
                                </div>
                                <div className="detail-value">
                                  {formatCurrency(product.buyPriceExclusive)}
                                </div>
                              </div>
                              <div className="detail-item">
                                <div className="detail-label">
                                  {t("Cost")} ({t("Inclusive")})
                                </div>
                                <div className="detail-value">
                                  {formatCurrency(product.costInclusive)}
                                </div>
                              </div>
                            </div>
                            <div className="details-column">
                              <div className="detail-item">
                                <div className="detail-label">
                                  {t("Total")} ({t("Exclusive")})
                                </div>
                                <div className="detail-value">
                                  {formatCurrency(product.totalExclusive)}
                                </div>
                              </div>
                              <div className="detail-item">
                                <div className="detail-label">
                                  {t("Tax Amount")}
                                </div>
                                <div className="detail-value">
                                  {formatCurrency(product.taxAmount)}
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
                    {formatCurrency(removeInvoiceById.subTotalTaxExclusive)}
                  </span>
                </div>
                <div className="total-row tax">
                  <span>{t("Total Tax")}</span>
                  <span>+ {formatCurrency(removeInvoiceById.totalTax)}</span>
                </div>
                <div className="total-row final">
                  <span>
                    {t("Total")} ({t("Tax Inclusive")})
                  </span>
                  <span>
                    {formatCurrency(removeInvoiceById.totalTaxInclusive)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="action-buttons">
        <button className="cancel-btn" onClick={handleBack}>
          <UndoDot size={16} />
          {t("Back")}
        </button>
        <button className="save-btn" onClick={handlePrint}>
          <Printer size={16} />
          {t("Print")}
        </button>
      </div>
    </div>
  );
}

export default GetRemoveStockById;

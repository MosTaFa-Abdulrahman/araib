import "./payCreditAmount.scss";
import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  UndoDot,
} from "lucide-react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// Mock Data
import { payCreditPurchaseData } from "../../../dummyData";
import { payCreditReturnData } from "../../../dummyData";
import toast from "react-hot-toast";

function PayCreditAmount() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const { supplierId } = useParams();

  const [selectedPayment, setSelectedPayment] = useState("Debit");
  const [notes, setNotes] = useState("");
  const [expandedPurchases, setExpandedPurchases] = useState({});
  const [expandedReturns, setExpandedReturns] = useState({});
  const [paidAmounts, setPaidAmounts] = useState({});
  const [inputErrors, setInputErrors] = useState({});
  const [paymentStatuses, setPaymentStatuses] = useState({});

  // Initialize payment statuses
  useEffect(() => {
    const initialStatuses = {};
    payCreditPurchaseData.forEach((invoice) => {
      initialStatuses[invoice.invoiceNumber] = invoice.paymentStatus;
    });
    setPaymentStatuses(initialStatuses);
  }, []);

  // Handle Toggle PO
  const togglePurchaseDetails = (invoiceNumber) => {
    setExpandedPurchases((prev) => ({
      ...prev,
      [invoiceNumber]: !prev[invoiceNumber],
    }));
  };
  // Handle Toggle RTN
  const toggleReturnDetails = (invoiceNumber) => {
    setExpandedReturns((prev) => ({
      ...prev,
      [invoiceNumber]: !prev[invoiceNumber],
    }));
  };

  // Handle Paid Effects with Status Update
  const handlePaidAmountChange = (invoiceNumber, amount) => {
    const numAmount = parseFloat(amount) || 0;
    const invoice = payCreditPurchaseData.find(
      (p) => p.invoiceNumber === invoiceNumber
    );

    if (invoice) {
      setPaidAmounts((prev) => ({
        ...prev,
        [invoiceNumber]: numAmount,
      }));

      // Calculate remaining credit after payment
      const remainingCredit = invoice.remainingBalance - numAmount;

      // Update payment status based on remaining credit
      setPaymentStatuses((prev) => ({
        ...prev,
        [invoiceNumber]: remainingCredit === 0 ? "Paid" : "Partially Paid",
      }));

      // Add validation check
      setInputErrors((prev) => ({
        ...prev,
        [invoiceNumber]: numAmount > invoice.remainingBalance,
      }));
    }
  };
  const calculateTotalPaid = () => {
    return Object.values(paidAmounts).reduce(
      (sum, amount) => sum + (amount || 0),
      0
    );
  };

  // Handle Fomat Numbers
  const formatNumber = (value) => {
    return (value || 0).toFixed(2);
  };

  // *********************** ((Actions-Buttons)) ******************************* //
  // Handle Pay
  const handlePay = () => {
    try {
      // Verify if any payments have been made
      const totalPaid = calculateTotalPaid();
      if (totalPaid <= 0) {
        toast.error("Please enter payment amount 🙄");
        return;
      }

      // Check for any input errors
      if (Object.values(inputErrors).some((error) => error)) {
        toast.error("Please correct payment amounts 🤗");
        return;
      }

      toast.success(`Payment processed successfully 😍`);
    } catch (error) {
      toast.error(`${error.message} 😥`);
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    try {
      toast.success(`Canceld Success 😍`);
    } catch (error) {
      toast.error(`${error.message} 😥`);
    }
  };

  return (
    <div className={`payCreditAmount ${theme}`}>
      <div className="content-wrapper">
        {/* Payment Select */}
        <div className="payment-section">
          <div className="method-select">
            <label className="required-label">{t("Payment Methods")}</label>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              required
            >
              <option value="Cash">{t("Cash")}</option>
              <option value="Credit Card">{t("Credit Card")}</option>
              <option value="Debit">{t("Debit")}</option>
            </select>
          </div>
          {selectedPayment === "Debit" && (
            <div className="debitTotalContainer">
              <p className="dLeft">{t("Debit Amount")}</p>
              <p className="dRight">3,148.75</p>
            </div>
          )}
          <div className="notes-field">
            <label>{t("Notes")}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("Enter Notes...")}
            />
          </div>
        </div>

        {/* Tables */}
        <div className="invoices-section">
          {/* PO Invoices */}
          <div className="purchase-invoices">
            <h2>{t("Purchase Invoices")}</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="arrow-column"></th>
                    <th>{t("Invoice Number")}</th>
                    <th>{t("Payment Status")}</th>
                    <th className="numeric">{t("Credit Amount")}</th>
                    <th className="numeric">
                      {t("Paid Amount")}
                      <div className="sub-label">{t("(Tax Inclusive)")}</div>
                    </th>
                    <th className="numeric">
                      {t("Invoice Credit")}
                      <div className="sub-label">{t("(After Payment)")}</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payCreditPurchaseData?.map((invoice) => (
                    <React.Fragment key={invoice.id}>
                      <tr>
                        <td className="arrow-column">
                          <button
                            className="toggle-button"
                            onClick={() =>
                              togglePurchaseDetails(invoice.invoiceNumber)
                            }
                          >
                            {expandedPurchases[invoice.invoiceNumber] ? (
                              <ChevronDown className="icon" />
                            ) : (
                              <ChevronRight className="icon" />
                            )}
                          </button>
                        </td>
                        <td>{invoice.invoiceNumber}</td>
                        <td>
                          <span
                            className={`status-badge ${invoice?.paymentStatus}`}
                          >
                            {t(invoice?.paymentStatus)}
                          </span>
                        </td>
                        <td className="numeric">
                          {formatNumber(invoice?.remainingBalance)}
                        </td>
                        <td className="numeric">
                          <div className="input-wrapper">
                            <input
                              type="number"
                              value={paidAmounts[invoice.invoiceNumber] || ""}
                              onChange={(e) =>
                                handlePaidAmountChange(
                                  invoice.invoiceNumber,
                                  e.target.value
                                )
                              }
                              step="0.01"
                              min="0"
                              className={`amount-input ${
                                inputErrors[invoice.invoiceNumber]
                                  ? "error"
                                  : ""
                              }`}
                            />
                            {inputErrors[invoice.invoiceNumber] && (
                              <div className="error-message">
                                {t("Amount exceeds credit limit")}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="numeric text-red">
                          {formatNumber(
                            invoice.remainingBalance -
                              (paidAmounts[invoice.invoiceNumber] || 0)
                          )}
                        </td>
                      </tr>
                      {expandedPurchases[invoice.invoiceNumber] && (
                        <tr className="details-row">
                          <td></td>
                          <td></td>
                          <td className="details-cell">
                            <div className="details-item">
                              <div className="main-text">{t("Total")}</div>
                              <div className="value">
                                {formatNumber(invoice.totalTaxInclusive)}
                              </div>
                            </div>
                            <div className="details-item">
                              <div className="gray-text">{t("Status")}</div>
                              <div className="sub-text">
                                {t("(After Payment)")}
                              </div>
                              <div className="value">
                                {t(paymentStatuses[invoice.invoiceNumber])}
                              </div>
                            </div>
                          </td>
                          <td></td>
                          <td className="details-cell" colSpan={2}>
                            <div className="details-item">
                              <div className="main-text">{t("Total Paid")}</div>
                              <div className="value">
                                {formatNumber(invoice.paidAmount)}
                              </div>
                            </div>
                            <div className="details-item">
                              <div className="gray-text">{t("Total Paid")}</div>
                              <div className="sub-text">
                                {t("(After Payment)")}
                              </div>
                              <div className="value">
                                {formatNumber(
                                  invoice.paidAmount +
                                    (paidAmounts[invoice.invoiceNumber] || 0)
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              {/* PO Totals */}
              <div className="totals">
                <div className="total-row">
                  <span>{t("Total credit before payment")}</span>
                  <span>
                    {formatNumber(
                      payCreditPurchaseData.reduce(
                        (sum, inv) => sum + inv.remainingBalance,
                        0
                      )
                    )}
                  </span>
                </div>
                <div className="total-row">
                  <span>{t("Total Paid")}</span>
                  <span>{formatNumber(calculateTotalPaid())}</span>
                </div>
                <div className="total-row final">
                  <span>{t("Total credit after payment")}</span>
                  <span className="text-red">
                    {formatNumber(
                      payCreditPurchaseData.reduce(
                        (sum, inv) => sum + inv.remainingBalance,
                        0
                      ) - calculateTotalPaid()
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {selectedPayment === "Debit" && (
            <hr style={{ marginBottom: "20px" }} />
          )}

          {/* RTN Invoices */}
          {selectedPayment === "Debit" && (
            <div className="return-invoices">
              <h2>{t("The invoice covers debit on amount")}</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="arrow-column"></th>
                      <th>{t("Invoice Number")}</th>
                      <th>{t("Payment Status")}</th>
                      <th className="numeric">{t("Total Credit")}</th>
                      <th className="numeric">{t("Total Debit")}</th>
                      <th className="numeric">
                        {t("Debit For Invoice")}
                        <div className="sub-label">{t("(After Payment)")}</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payCreditReturnData.map((invoice) => (
                      <React.Fragment key={invoice.id}>
                        <tr>
                          <td className="arrow-column">
                            <button
                              className="toggle-button"
                              onClick={() =>
                                toggleReturnDetails(invoice.invoiceNumber)
                              }
                            >
                              {expandedReturns[invoice.invoiceNumber] ? (
                                <ChevronDown className="icon" />
                              ) : (
                                <ChevronRight className="icon" />
                              )}
                            </button>
                          </td>
                          <td>{invoice.invoiceNumber}</td>
                          <td>
                            <span
                              className={`status-badge ${invoice.paymentStatus}`}
                            >
                              {t(invoice.paymentStatus)}
                            </span>
                          </td>
                          <td className="numeric">
                            {formatNumber(invoice.remainingBalance)}
                          </td>
                          <td className="numeric">{formatNumber(0)}</td>
                          <td className="numeric">
                            {formatNumber(invoice.debitForInvoice)}
                          </td>
                        </tr>
                        {expandedReturns[invoice.invoiceNumber] && (
                          <tr className="details-row">
                            <td></td>
                            <td></td>
                            <td className="details-cell">
                              <div className="details-item">
                                <div className="gray-text">{t("Status")}</div>
                                <div className="sub-text">
                                  {t("(After Payment)")}
                                </div>
                                <div className="value">
                                  {t("Not Paid Creditor")}
                                </div>
                              </div>
                              <div className="details-item">
                                <div className="gray-text">
                                  {t("Total Paid")}
                                </div>
                                <div className="sub-text">
                                  {t("(Before Payment)")}
                                </div>
                                <div className="value">0</div>
                              </div>
                            </td>
                            <td className="details-cell" colSpan={3}>
                              <div className="details-item">
                                <div className="gray-text">{t("Amount")}</div>
                                <div className="sub-text">
                                  {t("(Tax Inclusive)")}
                                </div>
                                <div className="value">0</div>
                              </div>
                              <div className="details-item">
                                <div className="gray-text">
                                  {t("Total Paid")}
                                </div>
                                <div className="sub-text">
                                  {t("(After Payment)")}
                                </div>
                                <div className="value">0</div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="action-buttons">
        <button className="cancel-btn" onClick={handleCancel}>
          <UndoDot size={16} />
          {t("Back")}
        </button>
        <button className="save-btn" onClick={handlePay}>
          <CircleDollarSign size={16} />
          {t("Pay Now")}
        </button>
      </div>
    </div>
  );
}

export default PayCreditAmount;

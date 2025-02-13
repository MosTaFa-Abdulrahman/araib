import "./recieveDebitAmountCustomer.scss";
import { useState, useEffect } from "react";
import { HandCoins, User } from "lucide-react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// order-management/customers/receive-debit/55

// RTKQ
import { singleCustomer, UnPaid_Invoices } from "../../../dummyData";
import toast from "react-hot-toast";
import InfoTooltip from "../../../components/global/infoTooltip/InfoTooltip";

function RecieveDebitAmountCustomer() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const { customerId } = useParams();

  const [selectedRows, setSelectedRows] = useState([]);
  const [payments, setPayments] = useState({});
  const [receivedAmount, setReceivedAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [considerPOS, setConsiderPOS] = useState(false);
  const [location, setLocation] = useState("");
  const [register, setRegister] = useState("");
  const [note, setNote] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  // Handle Total Debit
  const totalDebit = UnPaid_Invoices.reduce(
    (sum, invoice) => sum + invoice.debitAmount,
    0
  );
  // Handle Total Payments
  const totalPayments = Object.values(payments).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );

  // Format number to 2 decimal places
  // const formatNumber = (num) => {
  //   return Number(Number(num).toFixed(2));
  // };
  const formatNumber = (num) => {
    // Convert to number and limit to 2 decimal places
    const formatted = parseFloat(Number(num).toFixed(2));
    // Return original value if parsing fails
    return isNaN(formatted) ? 0 : formatted;
  };

  // Update selected rows based on payments
  useEffect(() => {
    const rowsToSelect = Object.entries(payments)
      .filter(([_, value]) => Number(value) > 0)
      .map(([id]) => parseInt(id));
    setSelectedRows(rowsToSelect);
  }, [payments]);

  // Handle Payment Changes
  const handlePaymentChange = (invoiceId, value) => {
    const invoice = UnPaid_Invoices.find((inv) => inv.id === invoiceId);
    const numValue = Number(value) || 0;

    let adjustedValue = formatNumber(numValue);

    // If the entered value exceeds debit amount
    if (adjustedValue > invoice.debitAmount) {
      adjustedValue = formatNumber(invoice.debitAmount);
      toast.error("Payment cannot exceed debit amount");
    }

    const updatedPayments = {
      ...payments,
      [invoiceId]: adjustedValue,
    };

    setPayments(updatedPayments);

    // Calculate new total and update received amount
    const newTotal = Object.values(updatedPayments).reduce(
      (sum, val) => sum + (Number(val) || 0),
      0
    );
    setReceivedAmount(formatNumber(newTotal));
  };

  // Handle ReceivedAmountChange
  const handleReceivedAmountChange = (value) => {
    let numValue = formatNumber(value);

    if (numValue > totalDebit) {
      toast.error("Received amount cannot exceed total debit");
      numValue = totalDebit;
    }

    setReceivedAmount(numValue);

    let remaining = numValue;
    const newPayments = {};

    // Distribute amount across invoices in order
    for (const invoice of UnPaid_Invoices) {
      if (remaining > 0) {
        const payment = formatNumber(Math.min(remaining, invoice.debitAmount));
        if (payment > 0) {
          newPayments[invoice.id] = payment;
          remaining = formatNumber(remaining - payment);
        }
      }
    }

    setPayments(newPayments);
  };

  // Handle Select Row
  const handleRowSelect = (invoiceId, checked) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, invoiceId]);
    } else {
      setSelectedRows((prev) => prev.filter((id) => id !== invoiceId));
      setPayments((prev) => {
        const { [invoiceId]: removed, ...rest } = prev;
        const newTotal = Object.values(rest).reduce(
          (sum, val) => sum + (Number(val) || 0),
          0
        );
        setReceivedAmount(formatNumber(newTotal));
        return rest;
      });
    }
  };

  // Add validation check effect
  useEffect(() => {
    const validateForm = () => {
      // Basic required fields
      const hasReceivedAmount = Number(receivedAmount) > 0;
      const hasPaymentMethod = paymentMethod !== "";
      const hasSelectedRows = selectedRows.length > 0;
      const hasValidPayments = totalPayments > 0;

      // Additional validation for POS fields if enabled
      const posFieldsValid = considerPOS
        ? location !== "" && register !== ""
        : true;

      // Check if amounts match
      const amountsMatch =
        formatNumber(totalPayments) === formatNumber(receivedAmount);

      return (
        hasReceivedAmount &&
        hasPaymentMethod &&
        hasSelectedRows &&
        hasValidPayments &&
        posFieldsValid &&
        amountsMatch
      );
    };

    setIsFormValid(validateForm());
  }, [
    receivedAmount,
    paymentMethod,
    selectedRows,
    totalPayments,
    considerPOS,
    location,
    register,
  ]);

  // ************************* ((Actions Button)) **************************************** //
  // Handle Pay
  const handlePay = () => {};

  // Handle Back
  const handleBack = () => {};

  return (
    <div className={`recieveDebitAmountCustomer ${theme}`}>
      {/* Header section */}
      <div className="customer-header">
        <User className="user-icon" />
        <span className="customer-name">{singleCustomer.name}</span>
      </div>

      <div className="main-content">
        {/* Payment Details */}
        <div className="payment-details">
          <div className="form-group">
            <label className="required">Received amount</label>
            <input
              type="number"
              value={receivedAmount || ""}
              onChange={(e) => handleReceivedAmountChange(e.target.value)}
              min="0"
              max={totalDebit}
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label className="required">Payment method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              <option value="">Select payment method</option>
              <option value="cash">Cash</option>
              <option value="credit">Credit Card</option>
              <option value="mourad">mourad</option>
            </select>
          </div>

          <div className="summary">
            <div className="summary-item">
              <span>Total Debit (before payment)</span>
              <span>{totalDebit.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Received amount</span>
              <span>{totalPayments.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Remaining Debit (after payment)</span>
              <span className="remaining-amount">
                {(totalDebit - totalPayments).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Switch Button */}
          <div className="pos-section">
            <div className="switch">
              <input
                type="checkbox"
                id="pos-toggle"
                checked={considerPOS}
                onChange={(e) => setConsiderPOS(e.target.checked)}
              />
              <label htmlFor="pos-toggle">
                Consider in POS Cash Management
              </label>
            </div>

            {considerPOS && (
              <div className="pos-details">
                <div className="form-group">
                  <label className="required">Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  >
                    <option value="">Select location</option>
                    <option value="loc1">Location 1</option>
                    <option value="loc2">Location 2</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="required">Register</label>
                  <select
                    value={register}
                    onChange={(e) => setRegister(e.target.value)}
                    required
                  >
                    <option value="">Select register</option>
                    <option value="reg1">Register 1</option>
                    <option value="reg2">Register 2</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Note</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, 100))}
                    maxLength={100}
                    rows={4}
                  />
                  <div className="char-count">{note.length}/100</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="invoices-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === UnPaid_Invoices.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(UnPaid_Invoices.map((inv) => inv.id));
                        handleReceivedAmountChange(totalDebit);
                      } else {
                        setSelectedRows([]);
                        setPayments({});
                        setReceivedAmount(0);
                      }
                    }}
                  />
                </th>
                <th>Invoice Number</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Debit</th>
                <th>
                  Payment
                  <InfoTooltip
                    title={t(
                      "Divding the recieved amount according to Debit Invoices"
                    )}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {UnPaid_Invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(invoice.id)}
                      onChange={(e) =>
                        handleRowSelect(invoice.id, e.target.checked)
                      }
                    />
                  </td>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.total.toFixed(2)}</td>
                  <td>{(invoice.total - invoice.debitAmount).toFixed(2)}</td>
                  <td>{invoice.debitAmount.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      value={payments[invoice.id] || ""}
                      onChange={(e) =>
                        handlePaymentChange(invoice.id, e.target.value)
                      }
                      className={
                        Number(payments[invoice.id]) > invoice.debitAmount
                          ? "error"
                          : ""
                      }
                      step="0.01"
                      min="0"
                      max={invoice.debitAmount}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="action-buttons">
        <button className="cancel-btn" onClick={handleBack}>
          {t("Back")}
        </button>
        <button
          className="save-btn"
          onClick={handlePay}
          disabled={!isFormValid}
        >
          <HandCoins size={16} />
          {t("Pay")}
        </button>
      </div>
    </div>
  );
}

export default RecieveDebitAmountCustomer;

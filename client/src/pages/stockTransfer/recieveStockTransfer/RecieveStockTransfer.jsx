import "./recieveStockTransfer.scss";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Pen, Save } from "lucide-react";
import { useLocation, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import PlusTooltip from "../../../components/global/plusTooltip/PlusTooltip";
import SpecialProductModal from "./specialProductModal/SpecialProductModal";
import RejectionModal from "./rejectionModal/RejectionModal";

// Date Time
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Mock Data
import { recieveTransferById } from "../../../dummyData";
import toast from "react-hot-toast";

function RecieveStockTransfer() {
  const { t } = useTranslation();
  const { invoiceId } = useParams();
  // recieveType: {reject,some,all}
  const location = useLocation();
  const recieveType = location?.state?.type;

  const [transferData, setTransferData] = useState(recieveTransferById);
  const [receivingDate, setReceivingDate] = useState(null);
  const [openDestination, setOpenDestination] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [receivedQuantities, setReceivedQuantities] = useState({});
  const [quantityErrors, setQuantityErrors] = useState({});
  const [editedItems, setEditedItems] = useState({});
  const [trackQuantities, setTrackQuantities] = useState({});
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);

  useEffect(() => {
    const quantities = {};
    transferData.transferStockDetails.forEach((item) => {
      quantities[item.id] =
        recieveType === "all" ? item.transferredQuantity : 0;
    });
    setReceivedQuantities(quantities);
  }, [recieveType, transferData]);

  // Handle Toggle Row
  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle Quantity Change
  const handleQuantityChange = (id, value, maxQuantity) => {
    // Allow empty string for clearing the input
    if (value === "") {
      setReceivedQuantities((prev) => ({
        ...prev,
        [id]: "",
      }));
      return;
    }

    // Convert to number and ensure non-negative
    const numValue = Math.max(0, parseFloat(value) || 0);

    // If value exceeds maxQuantity, set it to maxQuantity
    const adjustedValue = numValue > maxQuantity ? maxQuantity : numValue;

    setReceivedQuantities((prev) => ({
      ...prev,
      [id]: adjustedValue,
    }));

    // Show error message if the entered value was too high
    if (numValue > maxQuantity) {
      setQuantityErrors((prev) => ({
        ...prev,
        [id]: `Maximum quantity is ${maxQuantity}`,
      }));

      // Clear error after 3 seconds
      setTimeout(() => {
        setQuantityErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
      }, 3000);
    } else {
      setQuantityErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  // Handle Open Modal
  const handleModalOpen = (product) => {
    const productWithQuantities = {
      ...product,
      transferStockVariantToTracks: product.transferStockVariantToTracks.map(
        (track) => ({
          ...track,
          // Use saved track quantities if they exist
          receivedQuantity: trackQuantities[track.id] || 0,
        })
      ),
    };
    setSelectedProduct(productWithQuantities);
    setModalOpen(true);
  };

  // Handle Modal Save
  const handleModalSave = (items) => {
    if (selectedProduct) {
      // Calculate total received quantity from modal items
      const totalQty = items.reduce(
        (sum, item) => sum + Number(item.receivedQuantity || 0),
        0
      );

      // Save individual track quantities
      const newTrackQuantities = {};
      items.forEach((item) => {
        newTrackQuantities[item.id] = Number(item.receivedQuantity || 0);
      });
      setTrackQuantities((prev) => ({
        ...prev,
        ...newTrackQuantities,
      }));

      // Update total received quantities
      setReceivedQuantities((prev) => ({
        ...prev,
        [selectedProduct.id]: totalQty,
      }));

      // Mark this item as edited
      setEditedItems((prev) => ({
        ...prev,
        [selectedProduct.id]: true,
      }));
    }
    setModalOpen(false);
  };

  // Handle Calculate Totals
  const calculateTotals = () => {
    return transferData.transferStockDetails.reduce(
      (acc, item) => {
        acc.totalSent += item.transferredQuantity;
        const receivedQty =
          receivedQuantities[item.id] === ""
            ? 0
            : receivedQuantities[item.id] || 0;
        acc.totalReceived += receivedQty;
        return acc;
      },
      { totalSent: 0, totalReceived: 0 }
    );
  };

  // **************((Actions Buttons))**************** //
  // Handle Recieve
  const handleRecieveAll = () => {
    console.log("Recieved All...");
    toast.success("Recieved All Successfully 😍");
  };
  const handleRecieveSome = () => {
    console.log("Recieved Some...");
    toast.success("Recieved Some Successfully 😍");
  };

  // Handle Reject
  const handleReject = (reason) => {
    console.log("Rejected with reason:", reason);
    toast.success(`Reject Success Because ${reason} 😍`);
  };

  // Handle Back
  const handleBack = () => {
    console.log("Back...");
  };

  return (
    <>
      <div className="recieveStockTransfer">
        {/* Transfer Info (Left) */}
        <div className="transfer-info">
          <div className="header-info">
            <div className="info-left">
              <div className="info-item">
                <div className="invoiceNumberContainer">
                  <label>{t("Invoice Number")}</label>

                  <div className="status-badge">
                    {recieveTransferById.status === "pending" &&
                      t("Waiting Receive")}
                  </div>
                </div>
                <span>{transferData.invoiceNumber}</span>
              </div>

              <div className="info-item">
                <label>{t("Requested Date")}</label>
                <span>{new Date(transferData.createdAt).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label>{t("Source Location")}</label>
                <span>{transferData.sourceStockLocationName}</span>
              </div>
            </div>
            <div className="info-right">
              <div className="info-item">
                <label>{t("Destination Location")}</label>
                <span>{transferData.destinationStockLocationName}</span>
              </div>
            </div>
          </div>

          <div className="receiving-date">
            <label>{t("Receiving Date")}</label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={receivingDate}
                format="dd/MM/yyyy"
                onChange={setReceivingDate}
              />
            </LocalizationProvider>
          </div>

          <div className="notes">
            <label>{t("Notes")}</label>
            <p>{transferData.notes}</p>
          </div>
        </div>

        {/* Table (Right) */}
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
            <span>{transferData?.destinationStockLocationName}</span>
          </div>

          {!openDestination && (
            <>
              <div className="products-table">
                <div className="table-header">
                  <div>{t("Product Name / SKU")}</div>
                  <div>{t("Sent Stock")}</div>
                  <div>{t("Received QTY")}</div>
                </div>

                {transferData?.transferStockDetails?.map((item) => (
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
                            {item.trackType &&
                              recieveType !== "all" &&
                              (editedItems[item.id] ? (
                                <button
                                  className="edit-button"
                                  onClick={() => handleModalOpen(item)}
                                  title={`Edit ${
                                    item.trackType === "batch"
                                      ? t("Batch Numbers")
                                      : t("Serial Numbers")
                                  }`}
                                >
                                  <Pen size={16} />
                                </button>
                              ) : (
                                <PlusTooltip
                                  title={`${t("Add")} ${
                                    item.trackType === "batch"
                                      ? t("Batch Numbers")
                                      : t("Serial Numbers")
                                  }`}
                                  onClick={() => handleModalOpen(item)}
                                />
                              ))}
                          </div>
                          <span className="sku">{item.sku}</span>
                        </div>
                      </div>
                      <div className="sent-qty">{item.transferredQuantity}</div>
                      <div className="received-qty">
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={
                            receivedQuantities[item.id] === ""
                              ? ""
                              : receivedQuantities[item.id] || ""
                          }
                          placeholder="0"
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              e.target.value,
                              item.transferredQuantity
                            )
                          }
                          onKeyDown={(e) => {
                            // Prevent minus sign
                            if (e.key === "-" || e.key === "e") {
                              e.preventDefault();
                            }
                          }}
                          disabled={recieveType === "all" || item.trackType}
                          className={quantityErrors[item.id] ? "error" : ""}
                        />
                      </div>
                    </div>
                    {expandedRows[item.id] && (
                      <div className="product-details">
                        <div className="cost-details">
                          <div className="productPriceContainer">
                            <div>
                              <label>{t("Product Cost:")} </label>
                              <span>{item.costPrice.toFixed(2)}</span>
                            </div>
                            <div>
                              <label>{t("Product Price:")} </label>
                              <span>{(item.costPrice + 2).toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="productPriceContainer">
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

              <div className="totals">
                <div>
                  <span>{t("Total Sent:")}</span>
                  <span>{calculateTotals().totalSent}</span>
                </div>
                <div>
                  <span>{t("Total Received:")}</span>
                  <span>{calculateTotals().totalReceived}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* SpecialModal For ((Batch + Serial)) */}
        <SpecialProductModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          product={selectedProduct}
          onSave={handleModalSave}
        />
      </div>

      {/* Buttons */}
      <div className="action-buttonss">
        <button className="cancel-btn" onClick={handleBack}>
          {t("Back")}
        </button>

        {recieveType === "reject" ? (
          <>
            <button
              className="save-new-btn"
              onClick={() => setRejectionModalOpen(true)}
            >
              {t("Reject")}
            </button>

            <RejectionModal
              isOpen={rejectionModalOpen}
              onClose={() => setRejectionModalOpen(false)}
              onReject={handleReject}
            />
          </>
        ) : recieveType === "all" ? (
          <button className="save-btn" onClick={handleRecieveAll}>
            <Save size={16} />
            {t("Save")}
          </button>
        ) : (
          <button className="save-btn" onClick={handleRecieveSome}>
            <Save size={16} />
            {t("Save")}
          </button>
        )}
      </div>
    </>
  );
}

export default RecieveStockTransfer;

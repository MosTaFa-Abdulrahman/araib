import "./sendStockTransfer.scss";
import { useState } from "react";
import { Save } from "lucide-react";
import { useLocation, useParams } from "react-router";
import Locations from "../../../components/sendStockTransfer/locations/Locations";
import Products from "../../../components/sendStockTransfer/products/Products";
import RejectionModal from "../../../components/sendStockTransfer/rejectionModal/RejectionModal";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// RTKQ
import toast from "react-hot-toast";

function SendStockTransfer() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const { invoiceId } = useParams();
  // recieveType: {reject,some,all}
  const location = useLocation();
  const recieveType = location?.state?.type;

  const [selectedSource, setSelectedSource] = useState("");
  const [locationsData, setLocationsData] = useState([]);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);

  // ********************* ((Actions Buttons)) ******************** //
  const handleSendAll = () => {
    console.log("SendAll...");
    toast.success("SendAll Successfully 😍");
  };
  const handleSendSome = () => {
    console.log("SendSome...");
    toast.success("SendSome Successfully 😎");
  };

  const handleBack = () => {
    console.log("Back...");
    toast.success("Backed Successfully 🥱");
  };
  const handleReject = (reason) => {
    console.log("Rejected...", reason);
    toast.success(`Rejected Successfully ${reason} 😣`);
  };

  return (
    <>
      <div className={`sendStockTransfer ${theme}`}>
        <Locations
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
          setLocationsData={setLocationsData}
        />
        <Products
          selectedSource={selectedSource}
          locationsData={locationsData}
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
          <button className="save-btn" onClick={handleSendAll}>
            <Save size={16} />
            {t("Save")}
          </button>
        ) : (
          <button className="save-btn" onClick={handleSendSome}>
            <Save size={16} />
            {t("Save")}
          </button>
        )}
      </div>
    </>
  );
}

export default SendStockTransfer;

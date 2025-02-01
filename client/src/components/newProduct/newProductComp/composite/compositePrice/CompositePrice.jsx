import "./compositePrice.scss";
import { useState } from "react";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";
import InfoTooltip from "../../../../global/infoTooltip/InfoTooltip";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

function CompositePrice({ productDetails }) {
  const { t } = useTranslation();

  // Define branches
  const [branches] = useState(["default", "Elbasha"]);

  // State for branch data
  const [branchData, setBranchData] = useState(
    branches.reduce(
      (acc, branch) => ({
        ...acc,
        [branch]: {
          retailPrice: "",
          wholesalePrice: "",
          taxType: "VAT",
          maxToSell: "0",
        },
      }),
      {}
    )
  );

  const [isOpen, setIsOpen] = useState(
    branches.reduce(
      (acc, branch) => ({
        ...acc,
        [branch]: true,
      }),
      {}
    )
  );

  const taxOptions = ["Not Subject to Tax", "VAT"];

  const handleToggle = (branch) => {
    setIsOpen((prev) => ({
      ...prev,
      [branch]: !prev[branch],
    }));
  };

  const handleFieldChange = (branch, field, value) => {
    setBranchData((prev) => ({
      ...prev,
      [branch]: {
        ...prev[branch],
        [field]: value,
      },
    }));
  };

  // Handle copy - now copies all fields to all other branches
  const handleCopy = (fromBranch) => {
    const sourceBranch = branchData[fromBranch];
    const newBranchData = { ...branchData };

    // Copy to all other branches
    branches.forEach((branch) => {
      if (branch !== fromBranch) {
        newBranchData[branch] = {
          ...newBranchData[branch],
          retailPrice: sourceBranch.retailPrice,
          wholesalePrice: sourceBranch.wholesalePrice,
          taxType: sourceBranch.taxType,
          maxToSell: sourceBranch.maxToSell,
        };
      }
    });

    setBranchData(newBranchData);
    toast.success(t("Copied Success 🤩!"));
  };

  return (
    <div className="compositePrice">
      <div className="headerCompPrice">
        <h2>{t("Stock and Pricing")}</h2>
        <InfoTooltip
          title={t("Enter pricing information for different locations")}
        />
      </div>

      <div className="cost-field">
        <label>{t("Cost")}</label>
        <input
          type="number"
          value="999"
          disabled
          className="cost-input"
          placeholder={t("Cost")}
        />
      </div>

      {branches.map((branch) => (
        <div key={branch} className="location-section">
          <div className="location-header">
            <div
              className="location-toggle"
              onClick={() => handleToggle(branch)}
            >
              {isOpen[branch] ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
            <span className="location-name">{branch}</span>

            {branch === "default" && (
              <div className="copy-section">
                <button
                  className="copy-button"
                  onClick={() => handleCopy(branch)}
                >
                  <Copy size={16} />
                  <span>{t("Copy")}</span>
                </button>
                <span className="to-all">{t("to all locations")}</span>
              </div>
            )}
          </div>

          {isOpen[branch] && (
            <div className="branch-section">
              <div className="branch-row">
                <span className="branch-name">
                  {productDetails.productName}
                </span>
                <div className="price-fields">
                  <div className="price-field">
                    <div className="label-group">
                      <label>{t("Retail Price")}</label>
                      <InfoTooltip
                        title={t(
                          "This field accepts up to 2 digits after the decimal point. The entered price will be reflected in the POS and reports."
                        )}
                      />
                    </div>
                    <input
                      type="number"
                      value={branchData[branch].retailPrice}
                      onChange={(e) =>
                        handleFieldChange(branch, "retailPrice", e.target.value)
                      }
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="price-field">
                    <div className="label-group">
                      <label>{t("Wholesale Price")}</label>
                      <InfoTooltip
                        title={t(
                          "This field accepts up to 2 digits after the decimal point. The entered price will be reflected in the POS and reports."
                        )}
                      />
                    </div>
                    <input
                      type="number"
                      value={branchData[branch].wholesalePrice}
                      onChange={(e) =>
                        handleFieldChange(
                          branch,
                          "wholesalePrice",
                          e.target.value
                        )
                      }
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="price-field">
                    <div className="label-group">
                      <label>{t("Tax Type")}</label>
                    </div>
                    <select
                      value={branchData[branch].taxType}
                      onChange={(e) =>
                        handleFieldChange(branch, "taxType", e.target.value)
                      }
                      className="tax-select"
                    >
                      {taxOptions.map((option) => (
                        <option key={option} value={option}>
                          {t(option)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="price-field">
                    <div className="label-group">
                      <label>{t("Max To Sell")}</label>
                    </div>
                    <input
                      type="number"
                      value={branchData[branch].maxToSell}
                      onChange={(e) =>
                        handleFieldChange(branch, "maxToSell", e.target.value)
                      }
                      placeholder="0"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default CompositePrice;

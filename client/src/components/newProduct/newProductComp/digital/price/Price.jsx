import "./price.scss";
import { useState } from "react";
import { Copy, ChevronDown } from "lucide-react";
import InfoTooltip from "../../../../global/infoTooltip/InfoTooltip";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

function Price({ productDetails }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const [initialCost, setInitialCost] = useState("0.00");
  const [branches] = useState([
    { id: 1, name: t("default") },
    { id: 2, name: t("Elbasha") },
  ]);
  const [isExpanded, setIsExpanded] = useState(
    branches.reduce((acc, branch) => ({ ...acc, [branch.name]: true }), {})
  );

  const [pricesData, setPricesData] = useState(
    branches.reduce(
      (acc, branch) => ({
        ...acc,
        [branch.name]: {
          retailPrice: "0.00",
          wholesalePrice: "0.00",
          buyPrice: "0.00",
          taxType: t("VAT"),
        },
      }),
      {}
    )
  );

  const [selectedFields, setSelectedFields] = useState("");

  const toggleExpand = (branchName) => {
    setIsExpanded((prev) => ({ ...prev, [branchName]: !prev[branchName] }));
  };

  const handleFieldChange = (branch, field, value) => {
    setPricesData((prev) => ({
      ...prev,
      [branch]: {
        ...prev[branch],
        [field]: value,
      },
    }));
  };

  const handleCopy = (fromBranch) => {
    const newPricesData = { ...pricesData };
    const sourceBranchData = pricesData[fromBranch];

    if (selectedFields) {
      const fieldsToUpdate =
        selectedFields === "all"
          ? ["retailPrice", "wholesalePrice", "buyPrice", "taxType"]
          : selectedFields.split(",");

      branches.forEach((branch) => {
        if (branch.name !== fromBranch) {
          newPricesData[branch.name] = {
            ...newPricesData[branch.name],
            ...fieldsToUpdate.reduce(
              (acc, field) => ({
                ...acc,
                [field]: sourceBranchData[field],
              }),
              {}
            ),
          };
        }
      });
    } else {
      branches.forEach((branch) => {
        if (branch.name !== fromBranch) {
          newPricesData[branch.name] = JSON.parse(
            JSON.stringify(sourceBranchData)
          );
        }
      });
    }

    setPricesData(newPricesData);
    toast.success(t("Copied Success 🤩!"));
  };

  return (
    <div className={`price-container ${isRTL ? "rtl" : ""}`}>
      <div className="price-header">
        <h2>{t("Stock and Pricing")}</h2>
        <InfoTooltip title={t("Configure pricing details for your product")} />
      </div>

      <div className="initial-cost">
        <label>{t("Initial Cost")}</label>
        <input
          type="number"
          value={initialCost}
          onChange={(e) => setInitialCost(e.target.value)}
          placeholder="0.00"
          min="0"
        />
      </div>

      <div className="branches-container">
        {branches.map((branch) => (
          <div key={branch.id} className="branch-section">
            <div className="branch-header">
              <div className="branch-title">
                <span>{branch.name}</span>
                <button
                  className="expand-button"
                  onClick={() => toggleExpand(branch.name)}
                >
                  <ChevronDown
                    className={`chevron ${
                      isExpanded[branch.name] ? "rotated" : ""
                    }`}
                  />
                </button>
              </div>

              {branch.name === t("default") && (
                <div className="branch-actions">
                  <button
                    className="copy-button"
                    onClick={() => handleCopy(branch.name)}
                  >
                    <Copy size={16} />
                    <span>{t("Copy")}</span>
                  </button>
                  <div className="select-wrapper">
                    <select
                      value={selectedFields}
                      onChange={(e) => setSelectedFields(e.target.value)}
                    >
                      <option value="">{t("Retail Price,...")}</option>
                      <option value="retailPrice">{t("Retail Price")}</option>
                      <option value="retailPrice,wholesalePrice">
                        {t("Retail & Wholesale Price")}
                      </option>
                      <option value="all">{t("All Fields")}</option>
                    </select>
                    <span>{t("to all locations")}</span>
                  </div>
                </div>
              )}
            </div>

            {isExpanded[branch.name] && (
              <div className="table-wrapper">
                <table className="price-table">
                  <thead>
                    <tr>
                      <th>{t("Product")}</th>
                      <th>
                        {t("Retail Price")}
                        <InfoTooltip
                          title={t(
                            "Set the retail price including tax. This will be displayed in POS and reports"
                          )}
                        />
                      </th>
                      <th>
                        {t("Wholesale Price")}
                        <InfoTooltip
                          title={t(
                            "Configure wholesale pricing with tax included"
                          )}
                        />
                      </th>
                      <th>
                        {t("Buy Price")}
                        <InfoTooltip
                          title={t(
                            "Enter the purchase price for inventory management"
                          )}
                        />
                      </th>
                      <th>
                        {t("Tax Type")}
                        <InfoTooltip
                          title={t("Select the applicable tax category")}
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="product-name">
                        {productDetails?.productName || ""}
                      </td>
                      <td>
                        <div className="price-input">
                          <div className="input-group">
                            <input
                              type="number"
                              placeholder="0.00"
                              min="0"
                              value={pricesData[branch.name].retailPrice}
                              onChange={(e) =>
                                handleFieldChange(
                                  branch.name,
                                  "retailPrice",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="price-input">
                          <div className="input-group">
                            <input
                              type="number"
                              placeholder="0.00"
                              min="0"
                              value={pricesData[branch.name].wholesalePrice}
                              onChange={(e) =>
                                handleFieldChange(
                                  branch.name,
                                  "wholesalePrice",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="price-input">
                          <div className="input-group">
                            <input
                              type="number"
                              placeholder="0.00"
                              min="0"
                              value={pricesData[branch.name].buyPrice}
                              onChange={(e) =>
                                handleFieldChange(
                                  branch.name,
                                  "buyPrice",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          value={pricesData[branch.name].taxType}
                          onChange={(e) =>
                            handleFieldChange(
                              branch.name,
                              "taxType",
                              e.target.value
                            )
                          }
                        >
                          <option value="VAT">{t("VAT")}</option>
                          <option value="noTax">
                            {t("Not Subject to Tax")}
                          </option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Price;

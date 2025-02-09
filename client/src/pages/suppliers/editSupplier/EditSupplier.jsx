import "./editSupplier.scss";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Save, Search } from "lucide-react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";
import moment from "moment";

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Bahrain",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Canada",
  "China",
  "Denmark",
  "Egypt",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Italy",
  "Japan",
  "Jordan",
  "Kuwait",
  "Lebanon",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Norway",
  "Oman",
  "Pakistan",
  "Palestine",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Russia",
  "Saudi Arabia",
  "Singapore",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Syria",
  "Thailand",
  "Turkey",
  "UAE",
  "UK",
  "USA",
  "Yemen",
];

// RTKQ
import { singleSupplier } from "../../../dummyData";
import toast from "react-hot-toast";

function EditSupplier() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const { id } = useParams();

  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const searchInputRef = useRef(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    code: "",
    phoneNumber: "",
    email: "",
    vatNumber: "",
    countryKey: "",
    city: "",
    state: "",
    district: "",
    streetAddress: "",
    zipCode: "",
    buildingNumber: "",
    additionalNumber: "",
    debitAmount: 0,
    creditAmount: 0,
    totalPaidAmount: 0,
    openingBalanceAmount: 0,
    openingBalancePaidAmount: 0,
    netDue: 0,
  });

  const [errors, setErrors] = useState({});

  // Load initial data
  useEffect(() => {
    setFormData({
      id: singleSupplier.id || "",
      name: singleSupplier.name || "",
      code: singleSupplier.code || "",
      phoneNumber: singleSupplier.phoneNumber || "",
      email: singleSupplier.email || "",
      vatNumber: singleSupplier.vatNumber || "",
      countryKey: singleSupplier.countryKey || "",
      city: singleSupplier.city || "",
      state: singleSupplier.state || "",
      district: singleSupplier.district || "",
      streetAddress: singleSupplier.streetAddress || "",
      zipCode: singleSupplier.zipCode || "",
      buildingNumber: singleSupplier.buildingNumber || "",
      additionalNumber: singleSupplier.additionalNumber || "",
    });
  }, []);

  // Handle Validation Inputs
  const validateForm = () => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = "Supplier Name is required";
    if (!formData.code) tempErrors.code = "Supplier Code is required";
    if (!formData.phoneNumber)
      tempErrors.phoneNumber = "Phone Number is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle Inputs Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle Select Country
  useEffect(() => {
    if (showCountryDropdown && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showCountryDropdown]);
  const handleCountrySelect = (country) => {
    setFormData((prev) => ({
      ...prev,
      countryKey: country,
    }));
    setShowCountryDropdown(false);
    setCountrySearch("");
  };
  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // ********************* ((Actions-Buttons)) ***************************** //
  // Handle Save
  const handleSave = () => {
    try {
      if (validateForm()) {
        // Here you would typically make an API call to update the supplier
        console.log("Updating supplier...", {
          ...formData,
          updatedAt: new Date().toISOString(),
        });
        toast.success("Supplier Updated Successfully 😍");
      } else {
        toast.error("Please fill all required fields 🙄");
      }
    } catch (error) {
      toast.error(`${error.message} 😥`);
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    try {
      // Reset to original supplier data
      setFormData({
        id: singleSupplier.id || "",
        name: singleSupplier.name || "",
        code: singleSupplier.code || "",
        phoneNumber: singleSupplier.phoneNumber || "",
        email: singleSupplier.email || "",
        vatNumber: singleSupplier.vatNumber || "",
        countryKey: singleSupplier.countryKey || "",
        city: singleSupplier.city || "",
        state: singleSupplier.state || "",
        district: singleSupplier.district || "",
        streetAddress: singleSupplier.streetAddress || "",
        zipCode: singleSupplier.zipCode || "",
        buildingNumber: singleSupplier.buildingNumber || "",
        additionalNumber: singleSupplier.additionalNumber || "",
      });
      setErrors({});
    } catch (error) {
      toast.error(`${error.message} 😥`);
    }
  };

  return (
    <div className={`editSupplier ${theme}`}>
      <div className="form-container">
        <h2 className="section-title">Personal Information</h2>
        <div className="form-grid">
          {/* Personal Information Section */}
          <div className="form-column">
            <div className="form-group">
              <label>
                Supplier Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "error" : ""}
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label>
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={errors.phoneNumber ? "error" : ""}
              />
              {errors.phoneNumber && (
                <span className="error-message">{errors.phoneNumber}</span>
              )}
            </div>

            <div className="form-group">
              <label>VAT Number</label>
              <input
                type="text"
                name="vatNumber"
                value={formData.vatNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-column">
            <div className="form-group">
              <label>
                Supplier Code <span className="required">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={errors.code ? "error" : ""}
              />
              {errors.code && (
                <span className="error-message">{errors.code}</span>
              )}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Address Section */}
        <h2 className="section-title">Address</h2>
        <div className="form-grid">
          <div className="form-column">
            <div className="form-group">
              <label>Country</label>
              <div className="country-select">
                <div
                  className="selected-country"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                >
                  {formData.countryKey || "Select Country"}{" "}
                  <ChevronDown size={18} />
                </div>
                {showCountryDropdown && (
                  <div className="country-dropdown">
                    <div className="search-box">
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Search country..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        ref={searchInputRef}
                      />
                    </div>
                    <div className="country-list">
                      {filteredCountries?.map((country) => (
                        <div
                          key={country}
                          className="country-option"
                          onClick={() => handleCountrySelect(country)}
                        >
                          {country}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Building No.</label>
              <input
                type="text"
                name="buildingNumber"
                value={formData.buildingNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-column">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Additional No.</label>
              <input
                type="text"
                name="additionalNumber"
                value={formData.additionalNumber}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payments Supplier */}
      <div className="supPaymentsContainer">
        <div className="supWrapper">
          <div className="moneyContent">
            <p className="supplierTitle">Nearest Due Date</p>
            <p className="supMoneyValue">
              {moment(singleSupplier?.dueDate).format("DD/MM/YYYY")}
            </p>
          </div>
          <div className="moneyContent">
            <p className="supplierTitle">Debit Amount</p>
            <p className="supMoneyValue">{singleSupplier?.debitAmount}</p>
          </div>
          <div className="moneyContent">
            <p className="supplierTitle">Credit Amount</p>
            <p className="supMoneyValue">{singleSupplier?.creditAmount}</p>
          </div>
          <div className="moneyContent">
            <p className="supplierTitle">Total Paid Amount</p>
            <p className="supMoneyValue">{singleSupplier?.totalPaidAmount}</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="action-buttons">
        <button className="cancel-btn" onClick={handleCancel}>
          {t("Cancel")}
        </button>
        <button className="save-btn" onClick={handleSave}>
          <Save size={16} />
          {t("Save")}
        </button>
      </div>
    </div>
  );
}

export default EditSupplier;

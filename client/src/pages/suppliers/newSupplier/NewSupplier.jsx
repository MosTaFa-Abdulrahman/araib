import "./newSupplier.scss";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Save, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// Country list - you can expand this
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
import toast from "react-hot-toast";

function NewSupplier() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const [formData, setFormData] = useState({
    supplierName: "",
    supplierCode: "",
    phoneNumber: "",
    email: "",
    vatNumber: "",
    country: "Saudi Arabia",
    city: "",
    state: "",
    districtName: "",
    streetName: "",
    zipCode: "",
    buildingNo: "",
    additionalNumber: "",
  });
  const [errors, setErrors] = useState({});

  // Handle Validation Inputs
  const validateForm = () => {
    let tempErrors = {};
    if (!formData.supplierName)
      tempErrors.supplierName = "Supplier Name is required";
    if (!formData.supplierCode)
      tempErrors.supplierCode = "Supplier Code is required";
    if (!formData.phoneNumber)
      tempErrors.phoneNumber = "Phone Number is required";
    if (!formData.vatNumber) {
      tempErrors.vatNumber = "VAT Number is required";
    } else if (!/^3\d{13}3$/.test(formData.vatNumber)) {
      tempErrors.vatNumber =
        "VAT Number must be 15 digits, starting and ending with 3";
    }

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
      country,
    }));
    setShowCountryDropdown(false);
    setCountrySearch("");
  };
  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  //  *********************************** ((Actions-Buttons)) *********************************** //
  // Handle Save
  const handleSave = () => {
    try {
      if (validateForm()) {
        console.log("Saving...", formData);
        toast.success("Created Successfully 😍");
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
      setFormData({
        supplierName: "",
        supplierCode: "",
        phoneNumber: "",
        email: "",
        vatNumber: "",
        country: "Saudi Arabia",
        city: "",
        state: "",
        districtName: "",
        streetName: "",
        zipCode: "",
        buildingNo: "",
        additionalNumber: "",
      });
      setErrors({});
    } catch (error) {
      toast.error(`${error.message} 😥`);
    }
  };

  return (
    <div className={`newSupplier ${theme}`}>
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
                name="supplierName"
                value={formData.supplierName}
                onChange={handleChange}
                className={errors.supplierName ? "error" : ""}
              />
              {errors.supplierName && (
                <span className="error-message">{errors.supplierName}</span>
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
              <label>
                VAT Number <span className="required">*</span>
              </label>
              <input
                type="text"
                name="vatNumber"
                value={formData.vatNumber}
                onChange={handleChange}
                className={errors.vatNumber ? "error" : ""}
                placeholder="15 digits, starting and ending with 3 (Ex: 301121971500003)"
              />
              {errors.vatNumber && (
                <span className="error-message">{errors.vatNumber}</span>
              )}
            </div>
          </div>

          <div className="form-column">
            <div className="form-group">
              <label>
                Supplier Code <span className="required">*</span>
              </label>
              <input
                type="text"
                name="supplierCode"
                value={formData.supplierCode}
                onChange={handleChange}
                className={errors.supplierCode ? "error" : ""}
              />
              {errors.supplierCode && (
                <span className="error-message">{errors.supplierCode}</span>
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
                  {formData.country} <ChevronDown size={18} />
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
                      {filteredCountries.map((country) => (
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
              <label>District Name</label>
              <input
                type="text"
                name="districtName"
                value={formData.districtName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Street Name</label>
              <input
                type="text"
                name="streetName"
                value={formData.streetName}
                onChange={handleChange}
                placeholder="The name of the street on which the main entrance to the building is located"
              />
            </div>

            <div className="form-group">
              <label>Building No.</label>
              <input
                type="text"
                name="buildingNo"
                value={formData.buildingNo}
                onChange={handleChange}
                placeholder="4 Numbers representing a residential or commercial building"
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
                placeholder="4 Numbers representing the coordinates of the exact location of the building"
              />
            </div>
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

export default NewSupplier;

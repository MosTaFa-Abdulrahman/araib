import "./newCustomer.scss";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Save, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// DateTime
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// RTKQ
import toast from "react-hot-toast";

// Countries
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

function NewCustomer() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    mobileNumber: "",
    email: "",
    vatNumber: "",
    birthDate: null,
    nationalId: "",
    gender: "",
    commercialRegisterNumber: "",
    debitAmount: 0,
    totalPaid: 0,
    notes: "",
    additionalNumber: "",
    buildingNumber: "",
    streetName: "",
    city: "",
    countryKey: "",
    district: "",
    zip: "",
    source: "POS",
  });

  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showCountryDropdown && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showCountryDropdown]);

  // Handle Valide Fields
  const validateField = (name, value) => {
    if (!touchedFields[name]) return "";

    switch (name) {
      case "code":
        return value.trim() ? "" : "Customer Code is required";
      case "name":
        return value.trim() ? "" : "Customer Name is required";
      case "mobileNumber":
        return value.trim() ? "" : "Mobile Number is required";
      case "email":
        return value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? "Invalid email format"
          : "";
      case "vatNumber":
        return value && !/^3\d{13}3$/.test(value)
          ? "VAT Number must be 15 digits, starting and ending with 3"
          : "";
      case "nationalId":
        return value && !/^\d{10}$/.test(value)
          ? "National ID must be 10 digits"
          : "";
      case "commercialRegisterNumber":
        return value && !/^\d{10}$/.test(value)
          ? "Commercial Register Number must be 10 digits"
          : "";
      case "buildingNumber":
        return value && !/^\d{4}$/.test(value)
          ? "Building Number must be 4 digits"
          : "";
      case "additionalNumber":
        return value && !/^\d{4}$/.test(value)
          ? "Additional Number must be 4 digits"
          : "";
      case "zip":
        return value && !/^\d{5}$/.test(value)
          ? "ZIP Code must be 5 digits"
          : "";
      case "notes":
        return value && value.length > 300
          ? "Notes cannot exceed 300 characters"
          : "";
      case "countryKey":
        return !value && touchedFields.countryKey ? "Country is required" : "";
      default:
        return "";
    }
  };

  // Validate Form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Mark all fields as touched when submitting
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouchedFields(allTouched);

    // Validate all fields
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate only the changed field
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // Handle Select Country
  const handleCountrySelect = (country) => {
    setFormData((prev) => ({
      ...prev,
      countryKey: country,
    }));
    setTouchedFields((prev) => ({
      ...prev,
      countryKey: true,
    }));
    setErrors((prev) => ({
      ...prev,
      countryKey: "",
    }));
    setShowCountryDropdown(false);
    setCountrySearch("");
  };

  // Handle Blur
  const handleBlur = (fieldName) => {
    setTouchedFields((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
    const error = validateField(fieldName, formData[fieldName]);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  // Handle filteredCountries
  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // ******************** ((Actions-Buttons)) ******************************** //
  // Handle Save
  const handleSave = () => {
    if (validateForm()) {
      console.log("Saving...", formData);
      toast.success("Customer created successfully! 😊");
    } else {
      toast.error("Please check the form for errors 🙄");
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    setFormData({
      code: "",
      name: "",
      mobileNumber: "",
      email: "",
      vatNumber: "",
      birthDate: null,
      nationalId: "",
      gender: "",
      commercialRegisterNumber: "",
      debitAmount: 0,
      totalPaid: 0,
      notes: "",
      additionalNumber: "",
      buildingNumber: "",
      streetName: "",
      city: "",
      countryKey: "",
      district: "",
      zip: "",
      source: "POS",
    });
    setErrors({});
    setTouchedFields({});
    setCountrySearch("");
  };

  return (
    <div className={`newCustomer ${theme}`}>
      <div className="form-container">
        <h2 className="section-title">Personal Information</h2>

        <div className="form-grid">
          <div className="form-column">
            <div className="form-group">
              <label>
                Customer Code <span className="required">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                onBlur={() => handleBlur("code")}
                className={errors.code && touchedFields.code ? "error" : ""}
              />
              {errors.code && touchedFields.code && (
                <span className="error-message">{errors.code}</span>
              )}
            </div>

            <div className="form-group">
              <label>
                Customer Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur("name")}
                className={errors.name && touchedFields.name ? "error" : ""}
              />
              {errors.name && touchedFields.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label>
                Mobile Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                onBlur={() => handleBlur("mobileNumber")}
                className={
                  errors.mobileNumber && touchedFields.mobileNumber
                    ? "error"
                    : ""
                }
              />
              {errors.mobileNumber && touchedFields.mobileNumber && (
                <span className="error-message">{errors.mobileNumber}</span>
              )}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                className={errors.email && touchedFields.email ? "error" : ""}
              />
              {errors.email && touchedFields.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label>VAT Number</label>
              <input
                type="text"
                name="vatNumber"
                value={formData.vatNumber}
                onChange={handleChange}
                onBlur={() => handleBlur("vatNumber")}
                className={
                  errors.vatNumber && touchedFields.vatNumber ? "error" : ""
                }
                placeholder="301121971500003"
              />
              <span className="hint-message">
                15 digits, starting and ending with 3, Ex: 301121971500003
              </span>
              {errors.vatNumber && touchedFields.vatNumber && (
                <span className="error-message">{errors.vatNumber}</span>
              )}
            </div>
          </div>

          <div className="form-column">
            <div className="form-group">
              <label>Birth Date</label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={formData.birthDate}
                  onChange={(newValue) =>
                    setFormData((prev) => ({ ...prev, birthDate: newValue }))
                  }
                  renderInput={(params) => <input {...params} />}
                />
              </LocalizationProvider>
            </div>

            <div className="form-group">
              <label>National ID</label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                onBlur={() => handleBlur("nationalId")}
                className={
                  errors.nationalId && touchedFields.nationalId ? "error" : ""
                }
                maxLength={10}
              />
              <span className="hint-message">Must be 10 digits</span>
              {errors.nationalId && touchedFields.nationalId && (
                <span className="error-message">{errors.nationalId}</span>
              )}
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onBlur={() => handleBlur("gender")}
                className={errors.gender && touchedFields.gender ? "error" : ""}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label>Commercial Register Number</label>
              <input
                type="text"
                name="commercialRegisterNumber"
                value={formData.commercialRegisterNumber}
                onChange={handleChange}
                onBlur={() => handleBlur("commercialRegisterNumber")}
                className={
                  errors.commercialRegisterNumber &&
                  touchedFields.commercialRegisterNumber
                    ? "error"
                    : ""
                }
                maxLength={10}
              />
              <span className="hint-message">Must be 10 digits</span>
              {errors.commercialRegisterNumber &&
                touchedFields.commercialRegisterNumber && (
                  <span className="error-message">
                    {errors.commercialRegisterNumber}
                  </span>
                )}
            </div>
          </div>
        </div>

        <h2 className="section-title">Address Information</h2>
        <div className="form-grid">
          <div className="form-column">
            <div className="form-group">
              <label>
                Country <span className="required">*</span>
              </label>
              <div className="country-select" ref={dropdownRef}>
                <div
                  className={`selected-country ${
                    errors.countryKey && touchedFields.countryKey ? "error" : ""
                  }`}
                  onClick={() => {
                    setShowCountryDropdown(!showCountryDropdown);
                    setTouchedFields((prev) => ({ ...prev, countryKey: true }));
                  }}
                >
                  {formData.countryKey || "Select Country"}
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
                      {filteredCountries.map((country) => (
                        <div
                          key={country}
                          className={`country-option ${
                            formData.countryKey === country ? "selected" : ""
                          }`}
                          onClick={() => handleCountrySelect(country)}
                        >
                          {country}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {errors.countryKey && touchedFields.countryKey && (
                  <span className="error-message">{errors.countryKey}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Building Number</label>
              <input
                type="text"
                name="buildingNumber"
                value={formData.buildingNumber}
                onChange={handleChange}
                onBlur={() => handleBlur("buildingNumber")}
                className={
                  errors.buildingNumber && touchedFields.buildingNumber
                    ? "error"
                    : ""
                }
                maxLength={4}
              />
              <span className="hint-message">
                4 Numbers representing a residential or commercial building
              </span>
              {errors.buildingNumber && touchedFields.buildingNumber && (
                <span className="error-message">{errors.buildingNumber}</span>
              )}
            </div>

            <div className="form-group">
              <label>Street Name</label>
              <input
                type="text"
                name="streetName"
                value={formData.streetName}
                onChange={handleChange}
                onBlur={() => handleBlur("streetName")}
              />
              <span className="hint-message">
                The name of the street on which the main entrance to the
                building is located
              </span>
            </div>

            <div className="form-group">
              <label>Additional Number</label>
              <input
                type="text"
                name="additionalNumber"
                value={formData.additionalNumber}
                onChange={handleChange}
                onBlur={() => handleBlur("additionalNumber")}
                className={
                  errors.additionalNumber && touchedFields.additionalNumber
                    ? "error"
                    : ""
                }
                maxLength={4}
              />
              <span className="hint-message">
                4 Numbers representing the coordinates of the exact location of
                the building
              </span>
              {errors.additionalNumber && touchedFields.additionalNumber && (
                <span className="error-message">{errors.additionalNumber}</span>
              )}
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
                onBlur={() => handleBlur("city")}
              />
            </div>

            <div className="form-group">
              <label>District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                onBlur={() => handleBlur("district")}
              />
            </div>

            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                onBlur={() => handleBlur("zip")}
                className={errors.zip && touchedFields.zip ? "error" : ""}
                maxLength={5}
              />
              <span className="hint-message">Must be 5 digits</span>
              {errors.zip && touchedFields.zip && (
                <span className="error-message">{errors.zip}</span>
              )}
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                onBlur={() => handleBlur("notes")}
                className={errors.notes && touchedFields.notes ? "error" : ""}
                maxLength={300}
                rows={4}
              />
              <span className="hint-message">
                {300 - (formData.notes?.length || 0)} characters remaining
              </span>
              {errors.notes && touchedFields.notes && (
                <span className="error-message">{errors.notes}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="cancel-btn" onClick={handleCancel}>
          {t("Cancel")}
        </button>
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={!isFormValid}
        >
          <Save size={16} />
          {t("Save")}
        </button>
      </div>
    </div>
  );
}

export default NewCustomer;

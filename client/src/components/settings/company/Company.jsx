import "./company.scss";
import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// RTKQ
import toast from "react-hot-toast";

function Company() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    companyName: "",
    vatNumber: "",
    email: "",
    phone: "",
    website: "",
    companyAddress: "",
    commercialRegister: "",
    businessType: "",
  });
  const [logo, setLogo] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const businessTypes = [
    t("Other"),
    t("Supermarkets & Groceries"),
    t("Fruits & vegetables"),
    t("Butcher Shop"),
    t("Consulting & Legal activities"),
    t("Advertising"),
    t("Gyms & Sport Courts"),
    t("Laundry"),
  ];

  const validateVatNumber = (value) => {
    const regex = /^3\d{13}3$/;
    return regex.test(value);
  };

  const validateCommercialRegister = (value) => {
    return /^\d{10}$/.test(value);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validation
    const newErrors = { ...errors };

    if (name === "companyName" && !value.trim()) {
      newErrors.companyName = "Company name is required";
    } else if (name === "companyName") {
      delete newErrors.companyName;
    }

    if (name === "email") {
      if (!value.trim()) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(value)) {
        newErrors.email = "Please enter a valid email address";
      } else {
        delete newErrors.email;
      }
    }

    if (name === "vatNumber" && value) {
      if (!validateVatNumber(value)) {
        newErrors.vatNumber =
          "VAT number must be 15 digits, starting and ending with 3";
      } else {
        delete newErrors.vatNumber;
      }
    }

    if (name === "commercialRegister" && value) {
      if (!validateCommercialRegister(value)) {
        newErrors.commercialRegister = "Commercial Register must be 10 digits";
      } else {
        delete newErrors.commercialRegister;
      }
    }

    if (name === "businessType" && !value) {
      newErrors.businessType = "Business type is required";
    } else if (name === "businessType") {
      delete newErrors.businessType;
    }

    setErrors(newErrors);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should not exceed 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteLogo = (e) => {
    e.stopPropagation();
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogoContainerClick = () => {
    if (!logo && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isFormValid = () => {
    const requiredFields = {
      companyName: formData.companyName,
      email: formData.email && validateEmail(formData.email),
      businessType: formData.businessType,
    };

    return (
      Object.values(requiredFields).every(Boolean) &&
      Object.keys(errors).length === 0
    );
  };

  // ****************************** ((Actions-Buttons)) ************************************** //
  const handleSave = () => {
    try {
      toast.success("Company Updated Successfully 😍");
    } catch (error) {
      toast.error(`${error.message} 😥`);
    }
  };

  return (
    <div className={`company ${theme}`}>
      <form className="company__form" onSubmit={(e) => e.preventDefault()}>
        <div className="company__logo-section">
          <label>Company Logo</label>
          <div
            className="company__logo-container"
            onClick={handleLogoContainerClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="company__logo-input"
            />
            {logo ? (
              <>
                <img
                  src={logo}
                  alt="Company logo"
                  className="company__logo-image"
                />
                <button
                  type="button"
                  onClick={handleDeleteLogo}
                  className="company__delete-button"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <div className="company__upload-placeholder">
                <Upload size={24} className="company__upload-icon" />
              </div>
            )}
          </div>
        </div>

        <div className="company__form-row">
          <div className="company__input-group">
            <label>
              Company Name
              <span className="required">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className={errors.companyName ? "error" : ""}
            />
            {errors.companyName && (
              <div className="error-message">{errors.companyName}</div>
            )}
          </div>

          <div className="company__input-group">
            <label>
              VAT Number
              <span className="required">*</span>
            </label>
            <input
              type="text"
              name="vatNumber"
              value={formData.vatNumber}
              onChange={handleInputChange}
              className={errors.vatNumber ? "error" : ""}
            />
            <div className="hint">
              Must be 15 digits, starting and ending with 3, Ex: 301121971500003
            </div>
            {errors.vatNumber && (
              <div className="error-message">{errors.vatNumber}</div>
            )}
          </div>
        </div>

        <div className="company__form-row">
          <div className="company__input-group">
            <label>
              Email
              <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? "error" : ""}
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="company__input-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="company__form-row">
          <div className="company__input-group">
            <label>Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
            />
          </div>

          <div className="company__input-group">
            <label>Commercial Register</label>
            <input
              type="text"
              name="commercialRegister"
              value={formData.commercialRegister}
              onChange={handleInputChange}
              className={errors.commercialRegister ? "error" : ""}
            />
            <div className="hint">Must be 10 digits</div>
            {errors.commercialRegister && (
              <div className="error-message">{errors.commercialRegister}</div>
            )}
          </div>
        </div>

        <div className="company__form-row">
          <div className="company__input-group">
            <label>Company Address</label>
            <input
              type="text"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleInputChange}
            />
          </div>

          <div className="company__input-group">
            <label>
              Business Type
              <span className="required">*</span>
            </label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleInputChange}
              className={errors.businessType ? "error" : ""}
            >
              <option value="">Select business type</option>
              {businessTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.businessType && (
              <div className="error-message">{errors.businessType}</div>
            )}
          </div>
        </div>

        <div className="company__button-container">
          <button
            type="submit"
            className="company__submit-button"
            disabled={!isFormValid()}
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default Company;

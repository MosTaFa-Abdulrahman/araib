import "./details.scss";
import { useEffect, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import PlusTooltip from "../../global/plusTooltip/PlusTooltip";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// DateTime
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// RTKQ
import toast from "react-hot-toast";

// Mock Data
import { locations } from "../../../dummyData";
import { suppliers } from "../../../dummyData";
const countries = ["Saudi Arabia", "Canada", "Egypt", "England"];

function Details({ onLocationSelect, onDataChange }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const [supplierForm, setSupplierForm] = useState({
    supplierCode: "",
    supplierName: "",
    phoneNumber: "",
    email: "",
    vatNumber: "",
    buildingNumber: "",
    streetName: "",
    country: "Saudi Arabia",
    state: "",
    city: "",
    districtName: "",
    zipCode: "",
    additionalNumber: "",
  });

  // Filterd Countries
  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Handle Location Select
  const handleLocationSelect = (option) => {
    setSelectedLocation(option.name);
    onLocationSelect(option.name); // Pass selected location up to parent
  };

  // Handle Supplier Inputs Change
  const handleSupplierInputChange = (e) => {
    const { name, value } = e.target;
    setSupplierForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add Supplier
  const handleSubmitSupplier = (e) => {
    e.preventDefault();
    try {
      toast.success("Created Successfully 🥰");
      console.log(supplierForm);
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  //  *** Pass All Data to Father (NewPurchaseOrder)  ***
  useEffect(() => {
    onDataChange({
      supplierName: selectedSupplier,
      location: selectedLocation,
      issueDate: selectedDate,
      supplierInvoiceNumber,
      notes,
      supplierDetails: supplierForm,
    });
  }, [
    selectedSupplier,
    selectedLocation,
    selectedDate,
    supplierInvoiceNumber,
    notes,
    supplierForm,
    onDataChange,
  ]);

  return (
    <div className={`purchase-invoice-details ${theme}`}>
      <h2>{t("Purchase Invoice Details")}</h2>

      <div className="form-grid">
        <div className="form-group">
          <label>
            <span className="required">*</span>
            {t("Supplier Name")}
          </label>
          <div className="select-container">
            <div
              className="custom-select"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{selectedSupplier || "Select Supplier"}</span>
              <ChevronDown size={20} />
            </div>
            {isDropdownOpen && (
              <div className="select-dropdown">
                {suppliers.map((option) => (
                  <div
                    key={option?.id}
                    className="select-option"
                    onClick={() => {
                      setSelectedSupplier(option.name);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {option.name}
                  </div>
                ))}
              </div>
            )}
            <PlusTooltip
              title={t("Add Supplier")}
              onClick={() => setIsModalOpen(true)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>
            <span className="required">*</span>
            {t("Location")}
          </label>
          <div className="select-container">
            <div
              className="custom-select"
              onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
            >
              <span>{selectedLocation || "Select Location"}</span>
              <ChevronDown size={20} />
            </div>
            {locationDropdownOpen && (
              <div className="select-dropdown">
                {locations?.map((location) => (
                  <div
                    key={location.id}
                    className="select-option"
                    onClick={() => {
                      handleLocationSelect(location);
                      setLocationDropdownOpen(false);
                    }}
                  >
                    {`${location.code} ${location.name}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>{t("Issue Date")}</label>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              format="dd/MM/yyyy"
              className="mui-date-picker"
              slotProps={{
                textField: {
                  variant: "outlined",
                  size: "small",
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>
        </div>

        <div className="form-group">
          <label>{t("Supplier Invoice Number")} </label>
          <input
            type="text"
            value={supplierInvoiceNumber}
            onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
            placeholder={t("Enter invoice number")}
          />
        </div>

        <div className="form-group full-width">
          <label>{t("Notes")} </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={200}
            placeholder={t("Enter notes")}
          />
          <div className="char-count">{notes.length}/200</div>
        </div>
      </div>

      {/* Supplier Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="add-supplier-modal">
            <div className="modal-header">
              <h3>{t("Add Supplier")} </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="close-button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitSupplier}>
              <div className="form-content">
                {/* Basic Info Section */}
                <div className="form-section">
                  <div className="form-group">
                    <label>
                      <span className="required">*</span>
                      {t("Supplier Code")}
                    </label>
                    <input
                      type="text"
                      name="supplierCode"
                      value={supplierForm.supplierCode}
                      onChange={handleSupplierInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="required">*</span>
                      {t("Supplier Name")}
                    </label>
                    <input
                      type="text"
                      name="supplierName"
                      value={supplierForm.supplierName}
                      onChange={handleSupplierInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="required">*</span>
                      {t("Phone Number")}
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={supplierForm.phoneNumber}
                      onChange={handleSupplierInputChange}
                      required
                    />
                  </div>

                  {!showMoreDetails ? (
                    <button
                      type="button"
                      className="more-details-button"
                      onClick={() => setShowMoreDetails(true)}
                    >
                      {t("More Details")} <ChevronDown size={16} />
                    </button>
                  ) : (
                    <>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={supplierForm.email}
                          onChange={handleSupplierInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>VAT Number</label>
                        <input
                          type="text"
                          name="vatNumber"
                          value={supplierForm.vatNumber}
                          onChange={handleSupplierInputChange}
                        />
                        <small>
                          {t(
                            "15 digits, starting and ending with 3, Ex:301121971500003"
                          )}
                        </small>
                      </div>

                      <div className="form-group">
                        <label>{t("Building Number")}</label>
                        <input
                          type="text"
                          name="buildingNumber"
                          value={supplierForm.buildingNumber}
                          onChange={handleSupplierInputChange}
                        />
                        <small>
                          {t(
                            "4 Numbers representing a residential or commercial building"
                          )}
                        </small>
                      </div>

                      <div className="form-group">
                        <label>{t("Street Name")} </label>
                        <input
                          type="text"
                          name="streetName"
                          value={supplierForm.streetName}
                          onChange={handleSupplierInputChange}
                        />
                        <small>
                          {t(
                            "The name of the street on which the main entrance to the building is located"
                          )}
                        </small>
                      </div>

                      <div className="form-group">
                        <label>{t("Country")} </label>
                        <div className="country-select">
                          <div
                            className="selected-country"
                            onClick={() =>
                              setIsCountryDropdownOpen(!isCountryDropdownOpen)
                            }
                          >
                            <span>{supplierForm.country}</span>
                            <div className="country-actions">
                              {supplierForm.country !== "Saudi Arabia" && (
                                <X
                                  size={16}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSupplierForm((prev) => ({
                                      ...prev,
                                      country: "Saudi Arabia",
                                    }));
                                  }}
                                />
                              )}
                              <ChevronDown size={16} />
                            </div>
                          </div>

                          {isCountryDropdownOpen && (
                            <div className="country-dropdown">
                              <div className="search-container">
                                <Search size={16} />
                                <input
                                  type="text"
                                  placeholder="Search..."
                                  value={countrySearch}
                                  onChange={(e) =>
                                    setCountrySearch(e.target.value)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div className="countries-list">
                                {filteredCountries.map((country) => (
                                  <div
                                    key={country}
                                    className="country-option"
                                    onClick={() => {
                                      setSupplierForm((prev) => ({
                                        ...prev,
                                        country,
                                      }));
                                      setIsCountryDropdownOpen(false);
                                      setCountrySearch("");
                                    }}
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
                        <label>{t("State")} </label>
                        <input
                          type="text"
                          name="state"
                          value={supplierForm.state}
                          onChange={handleSupplierInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>{t("City")} </label>
                        <input
                          type="text"
                          name="city"
                          value={supplierForm.city}
                          onChange={handleSupplierInputChange}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsModalOpen(false)}
                >
                  {t("Cancel")}
                </button>
                <button type="submit" className="save-button">
                  {t("Add")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Details;

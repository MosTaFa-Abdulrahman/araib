import "./details.scss";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

// DateTime
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// RTKQ
import { locations } from "../../../dummyData";

function Details({ onLocationSelect, onDataChange }) {
  const { t } = useTranslation();
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [countName, setCountName] = useState("");
  const [notes, setNotes] = useState("");

  const handleLocationSelect = (location) => {
    setSelectedLocation(location.name);
    const newCountName = generateCountName(location.name);
    setCountName(newCountName);

    // Pass the complete location object
    onLocationSelect(location);
    setLocationDropdownOpen(false);

    onDataChange({
      location: location,
      countName: newCountName,
      countDate: selectedDate,
      notes: notes,
    });
  };

  const generateCountName = (locationName) => {
    const formattedDate = format(selectedDate, "ddMMyyyy");
    return `${locationName} - ${formattedDate}`;
  };

  return (
    <div className="purchase-invoice-details">
      <h2>{t("Stock Count Details")}</h2>

      <div className="form-grid">
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
              <span>{selectedLocation || t("Select Location")}</span>
              <ChevronDown size={20} />
            </div>
            {locationDropdownOpen && (
              <div className="select-dropdown">
                {locations?.map((location) => (
                  <div
                    key={location.id}
                    className="select-option"
                    onClick={() => handleLocationSelect(location)}
                  >
                    {`${location.code} ${location.name}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>
            <span className="required">*</span>
            {t("Count Name")}
          </label>
          <input
            type="text"
            value={countName}
            onChange={(e) => setCountName(e.target.value)}
            placeholder={t("Enter Count Name")}
            required
          />
        </div>

        <div className="form-group">
          <label>
            <span className="required">*</span>
            {t("Count Date")}
          </label>
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

        <div className="form-group full-width">
          <label>{t("Notes")}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={200}
            placeholder={t("Enter notes")}
          />
          <div className="char-count">{notes.length}/200</div>
        </div>
      </div>
    </div>
  );
}

export default Details;

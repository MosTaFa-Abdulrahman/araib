import "./locations.scss";
import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDate } from "../../global/formatDate";

// RTKQ
import { locations, sendTransferById } from "../../../dummyData";

function Locations({ selectedSource, setSelectedSource, setLocationsData }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Filter out destination location and filter by search term
  const filteredLocations = locations.filter(
    (location) =>
      location.id !== sendTransferById.destinationStockLocationId &&
      location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Set initial locations data
  useEffect(() => {
    setLocationsData(locations);
  }, [setLocationsData]);

  // Handle clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle source selection
  const handleSourceSelect = (locationName) => {
    setSelectedSource(locationName.toLowerCase());
    setIsOpen(false);
    setSearchTerm("");
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="locations">
      <div className="locations__source" ref={dropdownRef}>
        <label className="locations__source-label">
          {t("Source")}
          <span className="locations__subtitle">
            {t("(The branch which sending the stock)")}
          </span>
        </label>

        <div className="locations__select-container">
          <div
            className="locations__select-header"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span>{selectedSource || t("Select a Location")}</span>
            <ChevronDown
              size={20}
              className={`locations__select-arrow ${isOpen ? "open" : ""}`}
            />
          </div>

          {isOpen && (
            <div className="locations__dropdown">
              <div className="locations__search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder={t("Search location...")}
                  value={searchTerm}
                  onChange={handleSearch}
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <X
                    size={16}
                    className="locations__search-clear"
                    onClick={handleClearSearch}
                  />
                )}
              </div>

              <div className="locations__options">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((location) => (
                    <div
                      key={location.id}
                      className="locations__option"
                      onClick={() => handleSourceSelect(location.name)}
                    >
                      {location.name}
                    </div>
                  ))
                ) : (
                  <div className="locations__no-results">
                    {t("No locations found")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="locations__transfer-info">
        <div className="locations__invoice">
          <div className="locations__invoice-number">
            <span className="locations__invoice-label">Invoice Number</span>
            <span>{sendTransferById.invoiceNumber}</span>
          </div>
          <div className="locations__status">
            {sendTransferById.status === "requested" && "Waiting Send"}
          </div>
        </div>

        <div className="locations__info-row">
          <span className="locations__info-label">Request Date</span>
          <span>{formatDate(sendTransferById.createdAt)}</span>
        </div>

        <div className="locations__info-row">
          <span className="locations__info-label">Destination Location</span>
          <span>{sendTransferById.destinationStockLocationName}</span>
        </div>
      </div>
    </div>
  );
}

export default Locations;

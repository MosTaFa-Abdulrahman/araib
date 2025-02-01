import "./locations.scss";
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

// Mock Data
import { locations } from "../../../dummyData";

function Locations({
  selectedDestinations,
  setSelectedDestinations,
  setLocationsData,
}) {
  const { t } = useTranslation();
  const dropdownRef = useRef(null);

  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLocations, setFilteredLocations] = useState(locations);

  // Set initial locations data
  useEffect(() => {
    setLocationsData(locations);
  }, [setLocationsData]);

  // Handle clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDestinationOpen(false);
        setSearchTerm("");
      }
    }

    if (isDestinationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDestinationOpen]);

  // Filter locations based on search term
  useEffect(() => {
    const filtered = locations.filter((location) =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLocations(filtered);
  }, [searchTerm]);

  // Handle destination selection
  const handleDestinationToggle = (locationName) => {
    setSelectedDestinations((prev) => {
      if (prev.includes(locationName)) {
        return prev.filter((name) => name !== locationName);
      } else {
        return [...prev, locationName];
      }
    });
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Handle dropdown close
  const handleCloseDropdown = (e) => {
    e.stopPropagation();
    setIsDestinationOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="locations">
      <div className="locations__container">
        <div className="locations__section">
          <label className="locations__label">
            Destination(s)
            <span className="locations__subtitle">
              (The branch which receiving the stock)
            </span>
          </label>
          <div
            className="locations__select"
            onClick={() => setIsDestinationOpen(true)}
            ref={dropdownRef}
          >
            <div className="locations__select-input">
              {selectedDestinations.length > 0
                ? selectedDestinations.join(", ")
                : "Select destination(s)"}
            </div>
            {isDestinationOpen && (
              <div className="locations__dropdown">
                <div className="locations__search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="locations__search-input"
                    value={searchTerm}
                    onChange={handleSearch}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchTerm && (
                    <X
                      size={16}
                      className="locations__search-clear"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearSearch();
                      }}
                    />
                  )}
                  <X
                    size={16}
                    className="locations__dropdown-close"
                    onClick={handleCloseDropdown}
                  />
                </div>
                <div className="locations__options">
                  {filteredLocations.map((location) => (
                    <div
                      key={location.id}
                      className="locations__option"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDestinationToggle(location.name);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDestinations.includes(location.name)}
                        onChange={() => {}}
                      />
                      <span>{location.name}</span>
                    </div>
                  ))}
                  {filteredLocations.length === 0 && (
                    <div className="locations__no-results">
                      No locations found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Locations;

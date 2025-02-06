import "./options.scss";
import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import InfoTooltip from "../../../../../global/infoTooltip/InfoTooltip";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../../../context/ThemeContext";

function Options({ onOptionsChange }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [options, setOptions] = useState([]);
  const [currentOption, setCurrentOption] = useState("");
  const [currentValues, setCurrentValues] = useState({}); // Separate value for each option

  // Handle Add Option
  const handleAddOption = () => {
    if (
      currentOption.trim() &&
      !options.find(
        (opt) => opt.name.toLowerCase() === currentOption.trim().toLowerCase()
      )
    ) {
      const newOption = { name: currentOption.trim(), values: [] };
      setOptions([...options, newOption]);
      setCurrentValues({ ...currentValues, [newOption.name]: "" });
      setCurrentOption("");
      onOptionsChange([...options, newOption]);
    }
  };

  // Handle Add Value for ((Option))
  const handleAddValue = (optionIndex) => {
    const option = options[optionIndex];
    const valueToAdd = currentValues[option.name]?.trim();

    if (valueToAdd && !option.values.includes(valueToAdd)) {
      const newOptions = [...options];
      newOptions[optionIndex].values.push(valueToAdd);
      setOptions(newOptions);
      setCurrentValues({
        ...currentValues,
        [option.name]: "", // Reset only this option's input
      });
      onOptionsChange(newOptions);
    }
  };

  // Handle Remove ((Option))
  const handleRemoveOption = (optionIndex) => {
    const newOptions = options.filter((_, index) => index !== optionIndex);
    const newCurrentValues = { ...currentValues };
    delete newCurrentValues[options[optionIndex].name];
    setOptions(newOptions);
    setCurrentValues(newCurrentValues);
    onOptionsChange(newOptions);
  };

  // Handle Remove ((Value))
  const handleRemoveValue = (optionIndex, valueIndex) => {
    const newOptions = [...options];
    newOptions[optionIndex].values = newOptions[optionIndex].values.filter(
      (_, index) => index !== valueIndex
    );
    setOptions(newOptions);
    onOptionsChange(newOptions);
  };

  // Handle Key Press ((Enter))
  const handleKeyPress = (e, type, optionIndex) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "option") {
        handleAddOption();
      } else if (type === "value") {
        handleAddValue(optionIndex);
      }
    }
  };

  // Handle Value Changes
  const handleValueChange = (optionName, value) => {
    setCurrentValues({
      ...currentValues,
      [optionName]: value,
    });
  };

  return (
    <div className={`options-container ${theme}`}>
      <div className="header-options">
        <h2>{t("Product Options")}</h2>
        <InfoTooltip
          title={t("Add product variations like color, size, etc.")}
        />
      </div>

      {options.map((option, optionIndex) => (
        <div key={optionIndex} className="option-item">
          <div className="option-header">
            <input
              type="text"
              value={option.name}
              readOnly
              className="option-input"
            />
            <button
              onClick={() => handleRemoveOption(optionIndex)}
              className="remove-button"
              aria-label={t("Remove option")}
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="values-container">
            {option.values.map((value, valueIndex) => (
              <div key={valueIndex} className="value-tag">
                <span>{value}</span>
                <button
                  onClick={() => handleRemoveValue(optionIndex, valueIndex)}
                  className="remove-value"
                  aria-label={t("Remove value")}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="value-input">
            <input
              type="text"
              placeholder={t("Enter value")}
              value={currentValues[option.name] || ""}
              onChange={(e) => handleValueChange(option.name, e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, "value", optionIndex)}
            />
            <button
              onClick={() => handleAddValue(optionIndex)}
              aria-label={t("Add value")}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      ))}

      <div className="add-option">
        <input
          type="text"
          placeholder={t("Enter option name")}
          value={currentOption}
          onChange={(e) => setCurrentOption(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, "option")}
        />
        <button onClick={handleAddOption} aria-label={t("Add option")}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default Options;

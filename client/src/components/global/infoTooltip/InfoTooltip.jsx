import "./infoTooltip.scss";
import { useState } from "react";
import { Info } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

function InfoTooltip({ title }) {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className={`info-tooltip ${theme}`}>
      <Info
        className="info-icon"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        size={16}
      />
      {isVisible && (
        <div className="tooltip-content">
          {title}
          <div className="tooltip-arrow" />
        </div>
      )}
    </span>
  );
}

export default InfoTooltip;

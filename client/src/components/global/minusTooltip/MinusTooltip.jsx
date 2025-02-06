import "./minusTooltip.scss";
import { useState } from "react";
import { CircleMinus } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

function MinusTooltip({ title, onClick }) {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className={`minus-tooltip ${theme}`}>
      <CircleMinus
        className="minus-icon"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        size={20}
        onClick={onClick}
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

export default MinusTooltip;

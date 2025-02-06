import "./plusTooltip.scss";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

function PlusTooltip({ title, onClick }) {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className={`plus-tooltip ${theme}`}>
      <Plus
        className="plus-icon"
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

export default PlusTooltip;

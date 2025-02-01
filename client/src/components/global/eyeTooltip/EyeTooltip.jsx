import "./eyeTooltip.scss";
import { Eye } from "lucide-react";
import { useState } from "react";

function EyeTooltip({ title, onClick }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="eye-tooltip">
      <Eye
        className="eye-icon"
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

export default EyeTooltip;

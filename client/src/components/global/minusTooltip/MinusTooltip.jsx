import "./minusTooltip.scss";
import { CircleMinus } from "lucide-react";
import { useState } from "react";

function MinusTooltip({ title, onClick }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="minus-tooltip">
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

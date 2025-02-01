import "./plusTooltip.scss";
import { Plus } from "lucide-react";
import { useState } from "react";

function PlusTooltip({ title, onClick }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="plus-tooltip">
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

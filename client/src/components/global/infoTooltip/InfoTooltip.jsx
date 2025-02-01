import "./infoTooltip.scss";
import { useState } from "react";
import { Info } from "lucide-react";

function InfoTooltip({ title }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="info-tooltip">
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

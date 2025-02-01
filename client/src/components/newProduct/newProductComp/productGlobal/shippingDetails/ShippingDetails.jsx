import "./shippingDetails.scss";
import InfoTooltip from "../../../../global/infoTooltip/InfoTooltip";
import { useTranslation } from "react-i18next";

function ShippingDetails() {
  const { t } = useTranslation();

  return (
    <div className="shipping-details">
      <div className="shipping-details__container">
        <div className="shipping-details__header">
          <h2>{t("Shipping Details")}</h2>
          <InfoTooltip
            title={t(
              "Enter shipping information, including weight and dimensions."
            )}
          />
        </div>

        <div className="shipping-details__content">
          <div className="shipping-details__field shipping-details__field--full">
            <input
              type="number"
              placeholder={t("Weight (kg)")}
              className="shipping-details__input"
            />
          </div>

          <div className="shipping-details__dimensions">
            <div className="shipping-details__field">
              <input
                type="number"
                placeholder={t("Length (cm)")}
                className="shipping-details__input"
              />
            </div>
            <div className="shipping-details__field">
              <input
                type="number"
                placeholder={t("Width (cm)")}
                className="shipping-details__input"
              />
            </div>
            <div className="shipping-details__field">
              <input
                type="number"
                placeholder={t("Height (cm)")}
                className="shipping-details__input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShippingDetails;

import "./passwordCriteria.scss";
import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const PasswordCriteria = ({ password }) => {
  const { t } = useTranslation();

  const criteria = [
    { label: t("At least 6 characters"), met: password.length >= 6 },
    { label: t("Contains uppercase letter"), met: /[A-Z]/.test(password) },
    { label: t("Contains lowercase letter"), met: /[a-z]/.test(password) },
    { label: t("Contains a number"), met: /\d/.test(password) },
    {
      label: t("Contains special character"),
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  return (
    <div className="criteria">
      {criteria.map((item) => (
        <div key={item.label} className="criteria-item">
          {item.met ? (
            <Check className="icon success" />
          ) : (
            <X className="icon failure" />
          )}
          <span className={item.met ? "success-text" : "failure-text"}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const PasswordStrengthMeter = ({ password }) => {
  const { t } = useTranslation();

  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^a-zA-Z\d]/.test(pass)) strength++;
    return strength;
  };

  const strength = getStrength(password);

  const getStrengthText = (strength) => {
    if (strength === 0) return t("Very Weak");
    if (strength === 1) return t("Weak");
    if (strength === 2) return t("Fair");
    if (strength === 3) return t("Good");
    return t("Strong");
  };

  return (
    <div className="strength-meter">
      <div className="meter-header">
        <span>{t("Password Strength")}</span>
        <span>{getStrengthText(strength)}</span>
      </div>
      <div className="meter-bars">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`bar ${index < strength ? "active" : ""}`}
          />
        ))}
      </div>
      <PasswordCriteria password={password} />
    </div>
  );
};

export default PasswordStrengthMeter;

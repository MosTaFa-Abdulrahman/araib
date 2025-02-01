import "./languages.scss";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function Languages() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLanguage);
    setLanguage(newLanguage);
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  return (
    <div className="headerLanguage">
      <button
        style={{ color: "white" }}
        className="language-toggle"
        onClick={toggleLanguage}
      >
        <img
          src={
            language === "ar"
              ? "https://cdn-icons-png.flaticon.com/128/8363/8363075.png"
              : "https://cdn-icons-png.flaticon.com/128/5111/5111777.png"
          }
          alt="flag"
          className="flag-icon"
        />
        <p>{language === "ar" ? "EN" : "ع"}</p>
      </button>
    </div>
  );
}

export default Languages;

import "./newProduct.scss";
import { useState } from "react";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// Components
import Simple from "../../../components/newProduct/types/simple/Simple";
import Variable from "../../../components/newProduct/types/variable/Variable";
import Composite from "../../../components/newProduct/types/composite/Composite";
import Digital from "../../../components/newProduct/types/digital/Digital";

function NewProduct() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState("simple");

  const productTypes = [
    {
      id: "simple",
      name: t("Simple Product"),
      tooltip: t("A single, standalone product with no sizes or colors."),
      component: Simple,
    },
    {
      id: "variable",
      name: t("Variable Product"),
      tooltip: t("Product with multiple variations like size or color"),
      component: Variable,
    },
    {
      id: "composite",
      name: t("Composite Product"),
      tooltip: t("A product made up of multiple other products"),
      component: Composite,
    },
    {
      id: "digital",
      name: t("Digital Product"),
      tooltip: t("Downloadable or virtual products"),
      component: Digital,
    },
  ];

  const renderComponent = () => {
    const type = productTypes.find((type) => type.id === selectedType);
    const Component = type?.component;
    return Component ? <Component /> : null;
  };

  return (
    <div className={`newProduct ${theme}`}>
      <div className="productType">
        <div className="productType__header">
          <h3>
            <span className="required">*</span>
            {t("Product Type")}
            <Info size={16} />
          </h3>
          <p>{t("You can't edit this choice after saving the product")}</p>
        </div>

        <div className="productType__options">
          {productTypes.map((type) => (
            <div
              key={type.id}
              className={`productType__option ${
                selectedType === type.id ? "productType__option--selected" : ""
              }`}
              onClick={() => setSelectedType(type.id)}
            >
              <div className="option-content">
                <span>{type.name}</span>
                <Info size={16} />
                <div className="tooltip">{type.tooltip}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="productType__content">{renderComponent()}</div>
    </div>
  );
}

export default NewProduct;

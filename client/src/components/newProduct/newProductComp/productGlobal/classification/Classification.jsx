import "./classification.scss";
import { useState } from "react";
import { ChevronDown, Plus, X, ChevronUp, Loader } from "lucide-react";
import InfoTooltip from "../../../../global/infoTooltip/InfoTooltip";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../../context/ThemeContext";

// RTKQ
import { useCreateBrandMutation } from "../../../../../store/brand/brandSlice";
import toast from "react-hot-toast";

// Dropdown
const Dropdown = ({ label, options = [], onAdd, value, onChange }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="dropdown">
      <button className="dropdown__button" onClick={() => setIsOpen(!isOpen)}>
        <span>{value || t(label)}</span>
        <ChevronDown size={20} />
      </button>

      <button
        className="dropdown__add"
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
      >
        <Plus size={20} />
      </button>

      {isOpen && (
        <div className="dropdown__menu">
          {options.map((option, index) => (
            <div
              key={index}
              className="dropdown__menu-item"
              onClick={() => handleSelect(option)}
            >
              {t(option)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Modal
const Modal = ({ isOpen, onClose, title, children }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__content">
        <div className="modal__header">
          <h2>{t(title)}</h2>
          <button className="modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Brand
const AddBrandModal = ({ isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  // RTKQ
  const [createBrand, { isLoading, isError, error }] = useCreateBrandMutation();

  // Handle Create
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createBrand({ name, createdBy: "mostafa2001" }).unwrap();
      onSave(name);
      setName("");
      setTouched(false);
      onClose();
      toast.success(`Created Success ${name} 🥰`);
    } catch (error) {
      console.error("Failed to create brand:", error);
      toast.error(`Error Create Brand ${error.message} 😥`);
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const showError = (touched && !name.trim()) || isError;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("Add Brand")}>
      <div className="modal__body">
        <form className="form-group" onSubmit={handleCreate}>
          <label className="required">{t("Brand Name")}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleBlur}
            placeholder={t("Brand Name")}
            style={{
              borderColor: showError ? "#ef4444" : "",
              backgroundColor: showError ? "#fff5f5" : "",
            }}
            required
          />
          {touched && !name.trim() && (
            <div
              className="error-message"
              style={{
                color: "#ef4444",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
              }}
            >
              {t("Brand name is required")}
            </div>
          )}
          {isError && (
            <div
              className="error-message"
              style={{
                color: "#ef4444",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
              }}
            >
              {error?.data?.message || t("Error creating brand")}
            </div>
          )}
        </form>
      </div>
      <div className="modal__footer">
        <button
          type="button"
          className="button button--secondary"
          onClick={onClose}
          disabled={isLoading}
        >
          {t("Cancel")}
        </button>
        <button
          type="submit"
          className="button button--primary"
          onClick={handleCreate}
          disabled={isLoading || !name.trim()}
        >
          {isLoading ? <Loader className="spinner" /> : t("Save Brand")}
        </button>
      </div>
    </Modal>
  );
};

// Category
const AddCategoryModal = ({ isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
  const [categoryName, setCategoryName] = useState("");
  const [isMainCategory, setIsMainCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleSave = () => {
    onSave({
      name: categoryName,
      isMain: isMainCategory,
      parent: selectedCategory,
    });
    setCategoryName("");
    setIsMainCategory(false);
    setSelectedCategory("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add new category">
      <div className="modal__body">
        <div className="form-group">
          <label>{t("Category Name")}</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder={t("Category Name")}
          />
        </div>
        <div className="form-group">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={isMainCategory}
              onChange={(e) => setIsMainCategory(e.target.checked)}
            />
            <span>{t("Add to main category")}</span>
          </label>
        </div>
        {isMainCategory && (
          <div className="form-group">
            <label>{t("Choose Category")}</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">{t("Choose Category")}</option>
              <option value="fruits">{t("Fruits")}</option>
            </select>
          </div>
        )}
      </div>
      <div className="modal__footer">
        <button className="button button--secondary" onClick={onClose}>
          {t("Cancel")}
        </button>
        <button className="button button--primary" onClick={handleSave}>
          {t("Save Category")}
        </button>
      </div>
    </Modal>
  );
};

// Supplier
const AddSupplierModal = ({ isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(true);
  const [supplierData, setSupplierData] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    vat: "",
    building: "",
    street: "",
  });

  const handleSave = () => {
    onSave(supplierData);
    setSupplierData({
      code: "",
      name: "",
      email: "",
      phone: "",
      vat: "",
      building: "",
      street: "",
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Supplier">
      <div className="modal__body">
        <div className="form-group">
          <label className="required">{t("Supplier Code")}</label>
          <input
            type="text"
            value={supplierData.code}
            onChange={(e) =>
              setSupplierData({ ...supplierData, code: e.target.value })
            }
            placeholder={t("Supplier Code")}
          />
        </div>
        <div className="form-group">
          <label className="required">{t("Supplier Name")}</label>
          <input
            type="text"
            value={supplierData.name}
            onChange={(e) =>
              setSupplierData({ ...supplierData, name: e.target.value })
            }
            placeholder={t("Supplier Name")}
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            value={supplierData.email}
            onChange={(e) =>
              setSupplierData({ ...supplierData, email: e.target.value })
            }
            placeholder={t("Email")}
          />
        </div>
        <div className="form-group">
          <input
            type="tel"
            value={supplierData.phone}
            onChange={(e) =>
              setSupplierData({ ...supplierData, phone: e.target.value })
            }
            placeholder={t("Phone Number")}
          />
        </div>

        <button
          className="button button--secondary button--full"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? t("More Details") : t("Less Details")}
          {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {!showDetails && (
          <>
            <div className="form-group">
              <input
                type="text"
                value={supplierData.vat}
                onChange={(e) =>
                  setSupplierData({ ...supplierData, vat: e.target.value })
                }
                placeholder={t("VAT Number")}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                value={supplierData.building}
                onChange={(e) =>
                  setSupplierData({ ...supplierData, building: e.target.value })
                }
                placeholder={t("Building No.")}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                value={supplierData.street}
                onChange={(e) =>
                  setSupplierData({ ...supplierData, street: e.target.value })
                }
                placeholder={t("Street Name")}
              />
            </div>
          </>
        )}
      </div>
      <div className="modal__footer">
        <button className="button button--secondary" onClick={onClose}>
          {t("Cancel")}
        </button>
        <button className="button button--primary" onClick={handleSave}>
          {t("Save")}
        </button>
      </div>
    </Modal>
  );
};

function Classification() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  const handleAddBrand = (brandName) => {
    console.log(t("Adding brand:"), brandName);
  };

  const handleAddCategory = (categoryData) => {
    console.log(t("Adding category:"), categoryData);
  };

  const handleAddSupplier = (supplierData) => {
    console.log(t("Adding supplier:"), supplierData);
  };

  return (
    <div className={`classification ${theme}`}>
      <div className="classification__container">
        <div className="classification__header">
          <h2>{t("Classification")}</h2>
          <InfoTooltip
            title={t(
              "Categorizing your products allows you to access products faster and see reports for each category."
            )}
          />
        </div>

        <Dropdown
          label="Category"
          options={["Electronics", "Clothing", "Food"]}
          value={selectedCategory}
          onChange={setSelectedCategory}
          onAdd={() => setIsCategoryModalOpen(true)}
        />

        <Dropdown
          label="Supplier"
          options={["Supplier A", "Supplier B", "Supplier C"]}
          value={selectedSupplier}
          onChange={setSelectedSupplier}
          onAdd={() => setIsSupplierModalOpen(true)}
        />

        <Dropdown
          label="Brand"
          options={["Brand X", "Brand Y", "Brand Z"]}
          value={selectedBrand}
          onChange={setSelectedBrand}
          onAdd={() => setIsBrandModalOpen(true)}
        />

        <AddBrandModal
          isOpen={isBrandModalOpen}
          onClose={() => setIsBrandModalOpen(false)}
          onSave={handleAddBrand}
        />

        <AddCategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={handleAddCategory}
        />

        <AddSupplierModal
          isOpen={isSupplierModalOpen}
          onClose={() => setIsSupplierModalOpen(false)}
          onSave={handleAddSupplier}
        />
      </div>
    </div>
  );
}

export default Classification;

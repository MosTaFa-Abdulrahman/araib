import "./compositeProducts.scss";
import { useState } from "react";
import { Search, Plus, Minus, Trash2 } from "lucide-react";
import InfoTooltip from "../../../../global/infoTooltip/InfoTooltip";
import { useTranslation } from "react-i18next";

function CompositeProducts() {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Mock API data
  const mockProducts = [
    { id: "437781773763", name: "banana", price: 1.0 },
    { id: "437781773764", name: "apple", price: 1.5 },
    { id: "437781773765", name: "orange", price: 1.25 },
  ];

  // Handle Search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      const filtered = mockProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(value.toLowerCase()) ||
          product.id.includes(value)
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      addProduct(searchResults[0]);
    }
  };

  const addProduct = (product) => {
    if (!products.find((p) => p.id === product.id)) {
      setProducts([...products, { ...product, quantity: 1 }]);
    }
    setSearchTerm("");
    setShowResults(false);
  };

  const updateQuantity = (id, increment) => {
    setProducts(
      products.map((product) => {
        if (product.id === id) {
          const newQuantity = product.quantity + increment;
          return newQuantity > 0
            ? { ...product, quantity: newQuantity }
            : product;
        }
        return product;
      })
    );
  };

  const removeProduct = (id) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  return (
    <div className="compositing-products">
      <h2>
        {t("Compositing Products")}
        <InfoTooltip title={t("Combine multiple items into one product")} />
      </h2>

      <div className="search-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder={t("Search for products")}
            value={searchTerm}
            onChange={handleSearch}
            onKeyPress={handleKeyPress}
          />
        </div>

        {showResults && (
          <div className="search-results">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="search-result-item"
                onClick={() => addProduct(result)}
              >
                <span className="product-id">{result.id}</span>
                <span className="product-name">{result.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="products-list">
        {products.map((product) => (
          <div key={product.id} className="product-item">
            <span className="product-name">{product.name}</span>
            <div className="product-controls">
              <button
                className="quantity-btn"
                onClick={() => updateQuantity(product.id, -1)}
              >
                <Minus size={16} />
              </button>
              <span className="quantity">{product.quantity.toFixed(2)}</span>
              <button
                className="quantity-btn"
                onClick={() => updateQuantity(product.id, 1)}
              >
                <Plus size={16} />
              </button>
              <button
                className="delete-btn"
                onClick={() => removeProduct(product.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="no-products">{t("No product added")}</div>
        )}
      </div>
    </div>
  );
}

export default CompositeProducts;

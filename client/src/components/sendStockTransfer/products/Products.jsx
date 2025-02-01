import "./products.scss";
import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Import,
  Edit2,
  MapPinned,
} from "lucide-react";
import PlusTooltip from "../../global/plusTooltip/PlusTooltip";
import SpecialProductModal from "./specialProductModal/SpecialProductModal";
import { useTranslation } from "react-i18next";

// RTKQ
import { mockSearchProductss, sendTransferById } from "../../../dummyData";

function Products({ selectedSource, locationsData }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [expandedProducts, setExpandedProducts] = useState({});
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSpecialProduct, setSelectedSpecialProduct] = useState(null);
  const [specialProductItems, setSpecialProductItems] = useState({});

  // Get source and destination data for a product
  const getProductData = (productId) => {
    const originalProduct = mockSearchProductss.find((p) => p.id === productId);
    if (!originalProduct)
      return { sourceData: {}, destinationData: {}, originalProduct: null };

    const sourceLocationId = locationsData.find(
      (loc) => loc.name.toLowerCase() === selectedSource?.toLowerCase()
    )?.id;

    const sourceData =
      originalProduct.ProductVariantToStockLocations?.find(
        (loc) => loc.stockLocationId === sourceLocationId
      ) || {};

    const destinationData =
      originalProduct.ProductVariantToStockLocations?.find(
        (loc) =>
          loc.stockLocationId === sendTransferById.destinationStockLocationId
      ) || {};

    return {
      sourceData,
      destinationData,
      originalProduct,
    };
  };

  // Calculate composite cost
  const calculateCompositeCost = (product, sourceData) => {
    if (!product) return sourceData?.cost || 0;

    if (
      product.type === "composite" &&
      product.VariantToComposites?.length > 0
    ) {
      return product.VariantToComposites.reduce((acc, composite) => {
        const componentCost =
          composite.ProductVariant?.ProductVariantToStockLocations?.[0]?.cost ||
          0;
        const rate = composite.rate || 0;
        return acc + componentCost * rate;
      }, 0);
    }
    return sourceData?.cost || 0;
  };

  // Initialize products from sendTransferById
  useEffect(() => {
    const initialProducts = sendTransferById.transferStockDetails.map(
      (detail) => ({
        id: detail.productVariantId,
        name: detail.productVariantName,
        sku: detail.sku,
        type: detail.type,
        productType: detail.productType,
        trackType: detail.trackType,
        requestedQuantity: detail.requestedQuantity,
        transferQty: "",
        sourceStock: 0,
        destinationStock: getDestinationStock(detail.productVariantId),
      })
    );
    setProducts(initialProducts);
  }, []);

  // Update source stock when source is selected
  useEffect(() => {
    if (selectedSource) {
      setProducts((prevProducts) =>
        prevProducts.map((product) => ({
          ...product,
          sourceStock: getSourceStock(product.id),
        }))
      );
    }
  }, [selectedSource]);

  // Get source stock
  const getSourceStock = (productId) => {
    if (!selectedSource) return 0;
    const { sourceData } = getProductData(productId);
    return sourceData?.quantity || 0;
  };

  // Get destination stock
  const getDestinationStock = (productId) => {
    const { destinationData } = getProductData(productId);
    return destinationData?.quantity || 0;
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      const filtered = mockSearchProductss.filter(
        (product) =>
          !products.find((p) => p.id === product.id) &&
          (product.name?.toLowerCase().includes(term.toLowerCase()) ||
            product.sku?.toLowerCase().includes(term.toLowerCase()))
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  // Handle add product
  const handleAddProduct = (product) => {
    setProducts((prev) => [
      ...prev,
      {
        id: product.id,
        name: product.name,
        sku: product.sku,
        type: product.type,
        productType: product.productType,
        trackType: product.trackType,
        requestedQuantity: 0,
        transferQty: "",
        sourceStock: getSourceStock(product.id),
        destinationStock: getDestinationStock(product.id),
      },
    ]);
    setSearchTerm("");
    setSearchResults([]);
  };

  // Handle quantity change
  const handleQuantityChange = (productId, value) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          let parsedValue =
            value === ""
              ? ""
              : Math.max(0, Math.min(Number(value), product.sourceStock));

          if (
            (product.trackType === "batch" || product.trackType === "serial") &&
            product.transferQty !== parsedValue.toString()
          ) {
            setSpecialProductItems((prevItems) => {
              const newItems = { ...prevItems };
              delete newItems[product.id];
              return newItems;
            });
          }

          return {
            ...product,
            transferQty: parsedValue.toString(),
            error:
              value < 0
                ? "Negative quantities are not allowed"
                : Number(value) > product.sourceStock
                ? "Transfer QTY cannot exceed Source Stock"
                : "",
          };
        }
        return product;
      })
    );
  };

  // Toggle product details
  const toggleProductDetails = (productId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Handle special product click
  const handleSpecialProductClick = (product, editing = false) => {
    // Get the complete product data including VariantToTracks
    const { sourceData, originalProduct } = getProductData(product.id);

    const transformedProduct = {
      ...product,
      ...originalProduct,
      ProductVariantToStockLocations: [sourceData], // Pass source location data only
    };

    // When editing, initialize items with existing data
    if (editing && specialProductItems[product.id]) {
      setSelectedSpecialProduct({
        ...transformedProduct,
        existingTrackingItems: specialProductItems[product.id],
      });
    } else {
      setSelectedSpecialProduct(transformedProduct);
    }
    setShowModal(true);
  };

  // Calculate totals
  const calculateTotals = () => {
    return products.reduce(
      (acc, product) => {
        const transferQty = parseFloat(product.transferQty || 0);
        const { sourceData, originalProduct } = getProductData(product.id);
        const productCost = calculateCompositeCost(originalProduct, sourceData);

        return {
          totalTransferred: acc.totalTransferred + transferQty,
          totalCost: acc.totalCost + transferQty * productCost,
        };
      },
      { totalTransferred: 0, totalCost: 0 }
    );
  };

  // Render Product Details
  const renderProductDetails = (product) => {
    const { sourceData, destinationData, originalProduct } = getProductData(
      product.id
    );

    const productCost = calculateCompositeCost(originalProduct, sourceData);

    return (
      <div className="products__details">
        {originalProduct?.type === "composite" &&
          originalProduct?.VariantToComposites?.length > 0 && (
            <div className="products__contained-products">
              <h5>Contained Products</h5>
              <table className="products__contained-table">
                <thead>
                  <tr>
                    <th>Product Name / SKU</th>
                    <th>Source Stock</th>
                    <th>Destination Stock</th>
                    <th>Rate</th>
                    <th>Unit Cost</th>
                    <th>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {originalProduct.VariantToComposites.map((composite) => {
                    const containedProduct = composite.ProductVariant;
                    const sourceStock =
                      containedProduct?.ProductVariantToStockLocations?.find(
                        (loc) =>
                          loc.stockLocationId === sourceData.stockLocationId
                      )?.quantity || 0;
                    const destStock =
                      containedProduct?.ProductVariantToStockLocations?.find(
                        (loc) =>
                          loc.stockLocationId ===
                          destinationData.stockLocationId
                      )?.quantity || 0;

                    const componentCost =
                      containedProduct?.ProductVariantToStockLocations?.[0]
                        ?.cost || 0;
                    const totalComponentCost =
                      componentCost * (composite.rate || 0);

                    return (
                      <tr key={composite.id}>
                        <td>
                          <div className="products__contained-product-info">
                            <span>
                              {containedProduct?.name || "Unknown Product"}
                            </span>
                            <span className="products__sku">
                              {containedProduct?.sku || "No SKU"}
                            </span>
                          </div>
                        </td>
                        <td>{sourceStock}</td>
                        <td>{destStock}</td>
                        <td>{composite.rate || 0}</td>
                        <td>{componentCost.toFixed(2)}</td>
                        <td>{totalComponentCost.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                  <tr className="products__contained-table-total">
                    <td
                      colSpan={5}
                      style={{ textAlign: "right", fontWeight: "500" }}
                    >
                      Total Composite Cost:
                    </td>
                    <td style={{ fontWeight: "500" }}>
                      {productCost.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

        <div className="products__cost-details">
          <div className="products__details-column">
            <div className="products__details-item">
              <span>Product Cost</span>
              <span>{productCost.toFixed(2)}</span>
            </div>
            <div className="products__details-item">
              <span>Total Qty Cost</span>
              <span>
                {((product.transferQty || 0) * productCost).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="products__details-column">
            <div className="products__details-item">
              <span>Product Price</span>
              <span>{sourceData?.retailPrice?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="products__details-item">
              <span>Total Qty Price</span>
              <span>
                {(
                  (product.transferQty || 0) * (sourceData?.retailPrice || 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {specialProductItems[product.id] && (
          <div className="products__special-items">
            <h5>Special Items</h5>
            {specialProductItems[product.id].map((item, index) => (
              <div key={index} className="products__special-item">
                <span>
                  {item.serialNumber} ({item.quantity})
                  {item.expirationDate &&
                    ` - Expires: ${item.expirationDate.toLocaleDateString()}`}
                </span>
                <Edit2
                  size={16}
                  className="edit-icon"
                  onClick={() => handleSpecialProductClick(product, true)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Empty state
  if (!sendTransferById.destinationStockLocationName) {
    return (
      <div className="products">
        <div className="emptyContainer">
          <MapPinned className="emptyIcon" strokeWidth={0.5} />
          <p>{t("No destination location found")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products">
      <div className="products__location">
        <div className="products__location-header">
          <ChevronDown size={20} />
          <h3>{sendTransferById.destinationStockLocationName}</h3>
        </div>

        <div className="products__search">
          <div className="products__search-container">
            <div className="products__search-input">
              <Search size={16} />
              <input
                type="text"
                placeholder={t("Search by Variant Name or SKU")}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="products__search-results">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="products__search-item"
                    onClick={() => handleAddProduct(product)}
                  >
                    <div className="products__search-item-info">
                      <span className="name">{product.name}</span>
                      <span className="sku">{product.sku}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="products__import-btn">
            <Import size={16} />
            {t("Import Products")}
          </button>
        </div>

        <div className="products__table">
          <table>
            <thead>
              <tr>
                <th>{t("Product Name / SKU")}</th>
                <th>{t("Source Stock")}</th>
                <th>{t("Destination Stock")}</th>
                <th>{t("Requested Quantity")}</th>
                <th>{t("Transfer QTY")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <React.Fragment key={product.id}>
                  <tr>
                    <td className="products__name-cell">
                      <button
                        onClick={() => toggleProductDetails(product.id)}
                        className="products__expand-btn"
                      >
                        {expandedProducts[product.id] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>
                      <div>
                        <span>{product.name}</span>
                        <span className="products__sku">{product.sku}</span>
                      </div>
                      {(product.trackType === "batch" ||
                        product.trackType === "serial") &&
                        (!specialProductItems[product.id] ? (
                          <PlusTooltip
                            title={`Add ${product.trackType} numbers`}
                            onClick={() => handleSpecialProductClick(product)}
                          />
                        ) : (
                          <Edit2
                            size={16}
                            className="edit-icon"
                            onClick={() =>
                              handleSpecialProductClick(product, true)
                            }
                          />
                        ))}
                    </td>
                    <td>{product.sourceStock}</td>
                    <td>{product.destinationStock}</td>
                    <td>{product.requestedQuantity}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        value={product.transferQty}
                        onChange={(e) =>
                          handleQuantityChange(product.id, e.target.value)
                        }
                        className={`products__qty-input ${
                          product.error ? "products__qty-input--error" : ""
                        }`}
                      />
                      {product.error && (
                        <div className="products__qty-error">
                          {product.error}
                        </div>
                      )}
                    </td>
                  </tr>
                  {expandedProducts[product.id] && (
                    <tr className="products__details-row">
                      <td colSpan="5">{renderProductDetails(product)}</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div className="products__totals">
            <div className="products__totals-item">
              <span>{t("Total Transferred")}:</span>
              <span>{calculateTotals().totalTransferred}</span>
            </div>
            <div className="products__totals-item">
              <span>{t("Total Cost")}:</span>
              <span>{calculateTotals().totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal SpecialProductModal ((Batch + Serial)) */}
      <SpecialProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        product={selectedSpecialProduct}
        locationsData={locationsData}
        selectedSource={selectedSource}
        onSave={(items) => {
          if (selectedSpecialProduct) {
            setSpecialProductItems((prev) => ({
              ...prev,
              [selectedSpecialProduct.id]: items,
            }));

            // Update the transfer quantity based on the total items
            const totalQuantity = items.reduce(
              (sum, item) => sum + Number(item.quantity),
              0
            );

            setProducts((prev) =>
              prev.map((p) =>
                p.id === selectedSpecialProduct.id
                  ? { ...p, transferQty: totalQuantity.toString() }
                  : p
              )
            );

            setShowModal(false);
          }
        }}
        existingItems={
          selectedSpecialProduct
            ? specialProductItems[selectedSpecialProduct.id] || []
            : []
        }
        transferQty={
          selectedSpecialProduct
            ? parseInt(selectedSpecialProduct.transferQty) || 0
            : 0
        }
      />
    </div>
  );
}

export default Products;

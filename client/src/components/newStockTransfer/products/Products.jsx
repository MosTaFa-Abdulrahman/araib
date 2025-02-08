import "./products.scss";
import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Trash2,
  Import,
  Edit2,
  MapPinned,
} from "lucide-react";
import PlusTooltip from "../../global/plusTooltip/PlusTooltip";
import SpecialProductModal from "./specialProductModal/SpecialProductModal";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";

// Mock Data
import { mockSearchProductss } from "../../../dummyData";

function Products({ selectedSource, selectedDestinations, locationsData }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [productsByDestination, setProductsByDestination] = useState({});
  const [searchTerms, setSearchTerms] = useState({});
  const [searchResults, setSearchResults] = useState({});
  const [expandedProducts, setExpandedProducts] = useState({});
  const [isLocationExpanded, setIsLocationExpanded] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedSpecialProduct, setSelectedSpecialProduct] = useState(null);
  const [specialProductItems, setSpecialProductItems] = useState({});
  const [editingSpecialProduct, setEditingSpecialProduct] = useState(null);

  // Initialize locations expanded state
  useEffect(() => {
    if (selectedDestinations.length > 0) {
      const initialExpanded = selectedDestinations.reduce((acc, dest) => {
        acc[dest] = true;
        return acc;
      }, {});
      setIsLocationExpanded(initialExpanded);

      const initialSearchTerms = selectedDestinations.reduce((acc, dest) => {
        acc[dest] = "";
        return acc;
      }, {});
      setSearchTerms(initialSearchTerms);

      const initialSearchResults = selectedDestinations.reduce((acc, dest) => {
        acc[dest] = [];
        return acc;
      }, {});
      setSearchResults(initialSearchResults);
    }
  }, [selectedDestinations]);

  // Handle search
  const handleSearch = (destination, term) => {
    setSearchTerms((prev) => ({ ...prev, [destination]: term }));

    if (term.trim()) {
      const destinationProducts = productsByDestination[destination] || [];
      const filtered = mockSearchProductss.filter(
        (product) =>
          !destinationProducts.find((p) => p.id === product.id) &&
          (product.name?.toLowerCase().includes(term.toLowerCase()) ||
            product.sku?.toLowerCase().includes(term.toLowerCase()))
      );
      setSearchResults((prev) => ({ ...prev, [destination]: filtered }));
    } else {
      setSearchResults((prev) => ({ ...prev, [destination]: [] }));
    }
  };

  // Handle Locations Expanded
  const toggleLocationExpanded = (location) => {
    setIsLocationExpanded((prev) => ({
      ...prev,
      [location]: !prev[location],
    }));
  };

  // Handle Add Product To Table
  const handleAddProduct = (product, destination) => {
    setProductsByDestination((prev) => ({
      ...prev,
      [destination]: [
        ...(prev[destination] || []),
        { ...product, transferQty: "" },
      ],
    }));
    setSearchTerms((prev) => ({ ...prev, [destination]: "" }));
    setSearchResults((prev) => ({ ...prev, [destination]: [] }));
  };

  // Handle Quantity Changes
  const handleQuantityChange = (productId, value, destination) => {
    setProductsByDestination((prev) => ({
      ...prev,
      [destination]: prev[destination].map((product) => {
        if (product.id === productId) {
          const sourceData = getSourceData(product);
          const sourceStock = sourceData.quantity || 0;
          let parsedValue =
            value === ""
              ? ""
              : Math.max(0, Math.min(Number(value), sourceStock));

          if (
            (product.trackType === "batch" ||
              product.trackType === "serial" ||
              product.Product?.type === "ecard") &&
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
                : Number(value) > sourceStock
                ? "Transfer QTY cannot exceed Source Stock"
                : "",
          };
        }
        return product;
      }),
    }));
  };

  // Handle Delete From Table
  const handleDelete = (productId, destination) => {
    setProductsByDestination((prev) => ({
      ...prev,
      [destination]: prev[destination].filter(
        (product) => product.id !== productId
      ),
    }));
    setSpecialProductItems((prev) => {
      const newItems = { ...prev };
      delete newItems[productId];
      return newItems;
    });
  };

  // Handle Copy To All Locations
  const handleCopyToAllLocations = (sourceDestination) => {
    const sourceProducts = productsByDestination[sourceDestination] || [];
    const updatedProductsByDestination = { ...productsByDestination };

    selectedDestinations.forEach((destination) => {
      if (destination !== sourceDestination) {
        updatedProductsByDestination[destination] = sourceProducts.map(
          (product) => ({
            ...product,
            transferQty: product.transferQty,
          })
        );
      }
    });

    setProductsByDestination(updatedProductsByDestination);
  };

  // Handle Product Details
  const toggleProductDetails = (productId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Handle Special Product click
  const handleSpecialProductClick = (product, editing = false) => {
    const existingItems = specialProductItems[product.id] || [];
    setSelectedSpecialProduct({
      ...product,
      existingTrackingItems: existingItems,
    });
    setEditingSpecialProduct(editing ? product : null);
    setShowModal(true);
  };

  // Handle Special Product Save
  const handleSpecialProductSave = (items) => {
    if (!selectedSpecialProduct) return;

    setSpecialProductItems((prev) => ({
      ...prev,
      [selectedSpecialProduct.id]: items,
    }));

    const totalQuantity = items.reduce(
      (sum, item) => sum + Number(item.quantity),
      0
    );

    setProductsByDestination((prev) => {
      const updatedProductsByDestination = { ...prev };

      Object.keys(updatedProductsByDestination).forEach((destination) => {
        updatedProductsByDestination[destination] =
          updatedProductsByDestination[destination].map((product) =>
            product.id === selectedSpecialProduct.id
              ? {
                  ...product,
                  transferQty: totalQuantity.toString(),
                  specialItems: items,
                }
              : product
          );
      });

      return updatedProductsByDestination;
    });
  };

  // Handle Calculate Totals
  const calculateTotals = (products) => {
    return products.reduce(
      (acc, product) => {
        const transferQty = parseFloat(product.transferQty || 0);
        const productCost =
          product.ProductVariantToStockLocations?.[0]?.cost || 0;

        return {
          totalTransferred: acc.totalTransferred + transferQty,
          totalCost: acc.totalCost + transferQty * productCost,
        };
      },
      { totalTransferred: 0, totalCost: 0 }
    );
  };

  // Handle Get SourceData
  const getSourceData = (product) => {
    if (!product) return {};

    const locationMapping = locationsData.reduce((acc, location) => {
      acc[location.name] = location.id;
      return acc;
    }, {});

    const sourceLocationId = locationMapping[selectedSource];

    if (product.type === "composite" && product.ProductVariants?.length > 0) {
      return (
        product.ProductVariants[0].ProductVariantToStockLocations?.find(
          (loc) => loc.stockLocationId === sourceLocationId
        ) || {}
      );
    }

    return (
      product.ProductVariantToStockLocations?.find(
        (loc) => loc.stockLocationId === sourceLocationId
      ) || {}
    );
  };

  // Handle Get DestinationData
  const getDestinationData = (product, destination) => {
    if (!product) return {};

    const locationMapping = locationsData.reduce((acc, location) => {
      acc[location.name] = location.id;
      return acc;
    }, {});

    const destinationLocationId = locationMapping[destination];

    if (product.type === "composite" && product.ProductVariants?.length > 0) {
      return (
        product.ProductVariants[0].ProductVariantToStockLocations?.find(
          (loc) => loc.stockLocationId === destinationLocationId
        ) || {}
      );
    }

    return (
      product.ProductVariantToStockLocations?.find(
        (loc) => loc.stockLocationId === destinationLocationId
      ) || {}
    );
  };

  // ************************* ((Renderd)) **************************** //
  // Render Product Details
  const renderProductDetails = (product, sourceData, destinationData) => {
    // Calculate composite product cost
    const calculateCompositeCost = () => {
      if (
        product.type === "composite" &&
        product.VariantToComposites?.length > 0
      ) {
        return product.VariantToComposites.reduce((acc, composite) => {
          const componentCost =
            composite.ProductVariant?.ProductVariantToStockLocations?.[0]
              ?.cost || 0;
          const rate = composite.rate || 0;
          return acc + componentCost * rate;
        }, 0);
      }
      return sourceData.cost || 0;
    };

    const productCost = calculateCompositeCost();

    if (product.Product?.type === "ecard" && specialProductItems[product.id]) {
      return (
        <div className="products__special-items">
          <h5>E-Card Numbers</h5>
          {specialProductItems[product.id].map((item, index) => (
            <div key={index} className="products__special-item">
              <span>
                {item.serialNumber} (Qty: {item.quantity})
              </span>
              <Edit2
                size={16}
                className="edit-icon"
                onClick={() => handleSpecialProductClick(product, true)}
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="products__details">
        {product.type === "composite" &&
          product.VariantToComposites?.length > 0 && (
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
                  {product.VariantToComposites.map((composite) => {
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
                          destinationData?.stockLocationId
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
              <span>{sourceData.retailPrice?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="products__details-item">
              <span>Total Qty Price</span>
              <span>
                {(
                  (product.transferQty || 0) * (sourceData.retailPrice || 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {specialProductItems[product.id] && product.trackType !== "ecard" && (
          <div className="products__special-items">
            <h5>Special Items</h5>
            {specialProductItems[product.id].map((item, index) => (
              <div key={index} className="products__special-item">
                <span>
                  {/* Continuing from where your code left off */}
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

  // Render Location Content
  const renderLocationContent = (destination) => {
    if (!isLocationExpanded[destination]) return null;

    const destinationProducts = productsByDestination[destination] || [];
    const currentSearchTerm = searchTerms[destination] || "";
    const currentSearchResults = searchResults[destination] || [];

    return (
      <>
        <div className="products__search">
          <div className="products__search-container">
            <div className="products__search-input">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by Variant Name or SKU"
                value={currentSearchTerm}
                onChange={(e) => handleSearch(destination, e.target.value)}
              />
            </div>
            {currentSearchResults.length > 0 && (
              <div className="products__search-results">
                {currentSearchResults.map((product) => (
                  <div
                    key={product.id}
                    className="products__search-item"
                    onClick={() => handleAddProduct(product, destination)}
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
            Import Products
          </button>
        </div>

        {destinationProducts.length > 0 && (
          <>
            <div className="products__table">
              <h4>Products</h4>
              <table>
                <thead>
                  <tr>
                    <th>Product Name / SKU</th>
                    <th>Source Stock</th>
                    <th>Destination Stock</th>
                    <th>Transfer QTY</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {destinationProducts.map((product) => {
                    const sourceData = getSourceData(product);
                    const destinationData = getDestinationData(
                      product,
                      destination
                    );

                    return (
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
                              <span className="products__sku">
                                {product.sku}
                              </span>
                            </div>
                            {(product.trackType === "batch" ||
                              product.trackType === "serial" ||
                              product.Product?.type === "ecard") &&
                              (!specialProductItems[product.id] ? (
                                <PlusTooltip
                                  title={
                                    product.Product?.type === "ecard"
                                      ? "Add E-Card numbers"
                                      : `Add ${product.trackType} numbers`
                                  }
                                  onClick={() =>
                                    handleSpecialProductClick(product)
                                  }
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
                          <td>{sourceData.quantity || 0}</td>
                          <td>{destinationData.quantity || 0}</td>
                          <td>
                            <input
                              type="number"
                              min={1}
                              onKeyDown={(e) => {
                                if (e.key === "-" || e.key === "e") {
                                  e.preventDefault();
                                }
                              }}
                              value={product.transferQty || ""}
                              onChange={(e) =>
                                handleQuantityChange(
                                  product.id,
                                  e.target.value,
                                  destination
                                )
                              }
                              className={`products__qty-input ${
                                product.error
                                  ? "products__qty-input--error"
                                  : ""
                              }`}
                            />
                            {product.error && (
                              <div className="products__qty-error">
                                {product.error}
                              </div>
                            )}
                          </td>
                          <td>
                            <button
                              className="products__delete-btn"
                              onClick={() =>
                                handleDelete(product.id, destination)
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                        {expandedProducts[product.id] && (
                          <tr className="products__details-row">
                            <td colSpan="5">
                              {renderProductDetails(
                                product,
                                sourceData,
                                destinationData
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              <div className="products__totals">
                <div className="products__totals-item">
                  <span>Total Transferred:</span>
                  <span>
                    {calculateTotals(destinationProducts).totalTransferred}
                  </span>
                </div>
                <div className="products__totals-item">
                  <span>Total Cost:</span>
                  <span>
                    {calculateTotals(destinationProducts).totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  };

  // Render Not Select Any Destinations
  if (!selectedDestinations.length) {
    return (
      <div className="products">
        <div className="emptyContainer">
          <MapPinned className="emptyIcon" strokeWidth={0.5} />
          <p>
            {t(
              "Select the stock source and destination(s) to be able to select the products"
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`products ${theme}`}>
      {selectedDestinations?.map((destination) => (
        <div key={destination} className="products__location">
          <div
            className="products__location-header"
            onClick={() => toggleLocationExpanded(destination)}
          >
            {isLocationExpanded[destination] ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
            <h3>{destination}</h3>
            <span
              className="products__copy-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyToAllLocations(destination);
              }}
            >
              {t("Copy To All Locations")}
            </span>
          </div>
          {renderLocationContent(destination)}
        </div>
      ))}

      {/* Modal For ((Batch + Serial + ECard)) */}
      <SpecialProductModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingSpecialProduct(null);
        }}
        product={selectedSpecialProduct}
        onSave={handleSpecialProductSave}
        existingItems={
          editingSpecialProduct
            ? specialProductItems[editingSpecialProduct.id]
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

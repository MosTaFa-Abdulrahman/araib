import "./products.scss";
import { useState, useEffect } from "react";
import { Search, Pen, ScanBarcode } from "lucide-react";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import PlusTooltip from "../../global/plusTooltip/PlusTooltip";
import SpecialProductModal from "./specialProductModal/SpecialProductModal";
import ScanModal from "./scanModal/ScanModal";
import { useTheme } from "../../../context/ThemeContext";

// RTKQ
import { mockSearchProductss } from "../../../dummyData";

function Products({ selectedLocation, onDataChange }) {
  const { theme } = useTheme();

  const [rows, setRows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  // BarCode Component
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  useEffect(() => {
    if (selectedLocation?.id) {
      const formattedRows = mockSearchProductss.map((product, index) => {
        const locationStock =
          product.ProductVariantToStockLocations?.find(
            (loc) => loc.stockLocationId === selectedLocation.id
          ) || null;

        const uniqueId = `${product.id}_${selectedLocation.id}_${index}`;

        return {
          id: uniqueId,
          name: product.name,
          sku: product.sku,
          expected: locationStock?.quantity || 0,
          counted: 0,
          difference: 0,
          cost: locationStock?.cost || 0,
          trackType: product.trackType,
          productType: product.Product?.type,
          isEcard: product.isEcard,
          product: { ...product, id: uniqueId },
          originalId: product.id,
        };
      });

      setRows(formattedRows);
      setFilteredRows(formattedRows);
    }
  }, [selectedLocation]);

  // Handle Count Changes
  const handleCountChange = (id, value) => {
    const numValue =
      typeof value === "object" ? value.counted : Math.max(0, Number(value));

    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        const difference = numValue - row.expected;
        return { ...row, counted: numValue, difference };
      }
      return row;
    });

    setRows(updatedRows);
    setFilteredRows((prevFiltered) =>
      prevFiltered.map((row) => {
        if (row.id === id) {
          const difference = numValue - row.expected;
          return { ...row, counted: numValue, difference };
        }
        return row;
      })
    );

    onDataChange({
      selectedProducts: updatedRows.filter((row) => row.counted > 0),
    });
  };

  // Handle Special Count
  const handleSpecialCount = (product) => {
    const locationStock = product.ProductVariantToStockLocations?.find(
      (loc) => loc.stockLocationId === selectedLocation.id
    );

    const currentRow = rows.find((row) => row.id === product.id);

    let transformedProduct = {
      ...product,
      expected: locationStock?.quantity || 0,
      savedData: currentRow?.savedData,
    };

    // For batch products
    if (product.trackType === "batch") {
      transformedProduct.batches =
        locationStock?.VariantToTracks?.map((track) => {
          const savedItem = currentRow?.savedData?.items?.find(
            (item) => item.number === track.trackNo
          );

          return {
            number: track.trackNo,
            expected: track.quantity,
            quantity: savedItem?.quantity || 0,
            difference: savedItem?.difference || 0,
            expiryDate: new Date(track.expiryDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
          };
        }) || [];
    }

    // For serial products
    if (product.trackType === "serial") {
      transformedProduct.serials =
        locationStock?.VariantToTracks?.map((track) => {
          const savedItem = currentRow?.savedData?.items?.find(
            (item) => item.number === track.trackNo
          );

          return {
            number: track.trackNo,
            status: track.quantity > 0 ? "Available" : "Unavailable",
            addedDate: new Date(track.issueDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            expiryDate: new Date(track.expiryDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            isSelected: savedItem ? true : false,
          };
        }) || [];
    }

    // For ecard products
    if (product.Product?.type === "ecard") {
      transformedProduct.ecards =
        product.Ecards?.map((card) => {
          const savedItem = currentRow?.savedData?.items?.find(
            (item) => item.number === card.code
          );

          return {
            number: card.code,
            status: card.isSold ? "Unavailable" : "Available",
            addedDate: new Date(card.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            isSelected: savedItem ? true : false,
          };
        }) || [];
    }

    setSelectedProduct(transformedProduct);
    setIsModalOpen(true);
  };

  // Handle Search
  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = rows.filter(
      (row) =>
        row.name.toLowerCase().includes(term.toLowerCase()) ||
        row.sku.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredRows(filtered);
  };

  // Handle Reset
  const handleReset = () => {
    setSearchTerm("");
    setFilteredRows(rows);
    const resetRows = rows.map((row) => ({
      ...row,
      counted: 0,
      difference: 0,
    }));
    setRows(resetRows);
    setFilteredRows(resetRows);
    onDataChange({ selectedProducts: [] });
  };

  // Handle Scanned Products
  const handleScannedProducts = (scannedProducts) => {
    scannedProducts.forEach((scannedProduct) => {
      const existingRow = rows.find((row) => row.sku === scannedProduct.sku);
      if (existingRow) {
        handleCountChange(existingRow.id, {
          counted: (existingRow.counted || 0) + scannedProduct.count,
        });
      }
    });
  };

  // Columns
  const columns = [
    {
      field: "name",
      headerName: "Product Name / SKU",
      flex: 2,
      renderCell: (params) => (
        <div className="name-cell">
          <div className="product-name">{params.row.name}</div>
          <div className="product-sku">{params.row.sku}</div>
        </div>
      ),
    },
    {
      field: "expected",
      headerName: "Expected",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "counted",
      headerName: "Counted",
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const needsSpecialCount =
          params.row.trackType === "serial" ||
          params.row.trackType === "batch" ||
          params.row.productType === "ecard";

        if (needsSpecialCount) {
          return (
            <div className="count-cell">
              {params.row.counted > 0 ? (
                <button
                  className="edit-btn"
                  onClick={() => handleSpecialCount(params.row.product)}
                >
                  <Pen size={16} className="edit-icon" />
                  <span>{params.row.counted}</span>
                </button>
              ) : (
                <PlusTooltip
                  title={`Count ${params.row.name}`}
                  onClick={() => handleSpecialCount(params.row.product)}
                />
              )}
            </div>
          );
        }

        return (
          <input
            type="number"
            value={params.row.counted || ""}
            onChange={(e) => handleCountChange(params.row.id, e.target.value)}
            min="0"
            className="count-input"
          />
        );
      },
    },
    {
      field: "difference",
      headerName: "Difference",
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <span
          className={`difference ${
            params.value > 0 ? "positive" : params.value < 0 ? "negative" : ""
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "cost",
      headerName: "Cost",
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const totalCost = (params.row.cost || 0) * (params.row.counted || 0);
        return totalCost.toFixed(2);
      },
    },
  ];

  return (
    <div className={`products-container ${theme}`}>
      {/* Search */}
      <div className="search-bar">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by Product Name or SKU"
            className="search-input"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <ScanBarcode
          size={25}
          className="scanIcon"
          onClick={() => setIsScanModalOpen(true)}
        />
        <ScanModal
          isOpen={isScanModalOpen}
          onClose={() => setIsScanModalOpen(false)}
          onAddToCount={handleScannedProducts}
          mockSearchProductss={mockSearchProductss}
        />
      </div>

      {/* Filters */}
      <div className="filter-container">
        <select className="filter-select">
          <option value="">Product Status - All</option>
        </select>
        <select className="filter-select">
          <option value="">Categories</option>
        </select>
        <select className="filter-select">
          <option value="">Suppliers</option>
        </select>
        <select className="filter-select">
          <option value="">Brands</option>
        </select>
        <select className="filter-select">
          <option value="">Counted Quantities</option>
        </select>
        <button className="reset-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      <Paper className="grid-paper">
        <DataGrid
          rows={filteredRows}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          pageSizeOptions={[25, 50, 100]}
          pageSize={25}
          rowHeight={60}
          disableColumnMenu
          disableSelectionOnClick
          className="data-grid"
          getRowId={(row) => row.id}
        />
      </Paper>

      {/* Modal For ((Batch + Serial + E-Card)) */}
      {selectedProduct && (
        <SpecialProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
          onSave={(savedData) => {
            handleCountChange(selectedProduct.id, savedData.counted);
            // Store the saved data for future edits
            setRows((prev) =>
              prev.map((row) => {
                if (row.id === selectedProduct.id) {
                  return {
                    ...row,
                    savedData,
                  };
                }
                return row;
              })
            );
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default Products;

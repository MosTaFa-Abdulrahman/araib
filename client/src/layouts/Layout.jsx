import "./layout.scss";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation, matchPath } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../components/global/header/Header";
import Sidebar from "../components/global/sidebar/Sidebar";

// Pages
import Home from "../pages/home/Home";
import NotFound from "../pages/notFound/NotFound";
// Inventory (Products)
import GetProducts from "../pages/products/getProducts/GetProducts";
import NewProduct from "../pages/products/newProduct/NewProduct";
// Invoices (Purchase Orders)
import GetPurchaseOrder from "../pages/purchaseOrder/getPurchaseOrder/GetPurchaseOrder";
import GetPurchaseById from "../pages/purchaseOrder/getPurchaseById/GetPurchaseById";
import NewPurchaseOrder from "../pages/purchaseOrder/newPurchaseOrder/NewPurchaseOrder";
// Invoices (Return Invoices)
import GetReturnInvoices from "../pages/returnInvoices/getReturnInvoices/GetReturnInvoices";
import GetReturnById from "../pages/returnInvoices/getReturnById/GetReturnById";
import NewReturnInvoices from "../pages/returnInvoices/newReturnInvoices/NewReturnInvoices";
// Suppliers
import NewSupplier from "../pages/suppliers/newSupplier/NewSupplier";
import EditSupplier from "../pages/suppliers/editSupplier/EditSupplier";
import GetSuppliers from "../pages/suppliers/getSuppliers/GetSuppliers";
import PayCreditAmount from "../pages/suppliers/payCreditAmount/PayCreditAmount";
import RecieveDebitAmount from "../pages/suppliers/recieveDebitAmount/RecieveDebitAmount";
import Payments from "../pages/suppliers/payments/Payments";
// Stock Transfer
import NewStockTransfer from "../pages/stockTransfer/newStockTransfer/NewStockTransfer";
import NewRequestStockTransfer from "../pages/stockTransfer/newRequestStockTransfer/NewRequestStockTransfer";
import GetStockTransfer from "../pages/stockTransfer/getStockTransfer/GetStockTransfer";
import GetStockTransferById from "../pages/stockTransfer/getStockTransferById/GetStockTransferById";
import RecieveStockTransfer from "../pages/stockTransfer/recieveStockTransfer/RecieveStockTransfer";
import SendStockTransfer from "../pages/stockTransfer/sendStockTransfer/SendStockTransfer";
// Remove Stock
import GetRemoveStock from "../pages/removeStock/getRemoveStock/GetRemoveStock";
import NewRemoveStock from "../pages/removeStock/newRemoveStock/NewRemoveStock";
import GetRemoveStockById from "../pages/removeStock/getRemoveStockById/GetRemoveStockById";
// Stock Count
import GetStockCount from "../pages/stockCount/getStockCount/GetStockCount";
import NewStockCount from "../pages/stockCount/newStockCount/NewStockCount";
import GetStockCountById from "../pages/stockCount/getStockCountById/GetStockCountById";

function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Define routes patterns for matching
  const routes = [
    { path: "/", title: "Dashboard" },
    // Products
    { path: "/inventory/products", title: "Products" },
    { path: "/inventory/products/new", title: "Create Product" },
    // Purchase Invoices
    { path: "/invoices/purchase-orders", title: "Purchase Invoices" },
    { path: "/invoices/purchase-orders/new", title: "New Purchase Invoice" },
    {
      path: "/invoices/purchase-orders/:id/view",
      title: "Purchase Invoice Details",
    },
    // Return Invoices
    { path: "/invoices/return-stocks", title: "Return Invoices" },
    {
      path: "/invoices/return-stocks/:id/view",
      title: "Return Invoice Details",
    },
    { path: "/invoices/return-stocks/new", title: "New Return Inventory" },
    // Suppliers
    { path: "/invoices/suppliers/new", title: "New Supplier" },
    { path: "/invoices/suppliers/:id", title: "Edit Supplier" },
    { path: "/invoices/suppliers", title: "All Suppliers" },
    {
      path: "/invoices/suppliers/:supplierId/payments/pay-credit",
      title: "Pay Credit Amount",
    },
    {
      path: "/invoices/suppliers/:supplierId/payments/receive-debit",
      title: "Recieve Debit Amount",
    },
    {
      path: "/invoices/payments",
      title: "Supplier Payments",
    },
    // Stock Transfer
    {
      path: "/invoices/transfer-stock",
      title: "Stock Transfer",
    },
    {
      path: "/invoices/transfer-stock/new-multiple/new",
      title: "New Transfer Stock",
    },
    {
      path: "/invoices/transfer-stock/new-multiple/request",
      title: "Request Stock",
    },
    {
      path: "/invoices/transfer-stock/recieve-stock/:invoiceId",
      title: "Receieve Transfer Stock",
    },
    {
      path: "/invoices/transfer-stock/send-stock/:invoiceId",
      title: "Send Stock",
    },
    {
      path: "/invoices/transfer-stock/:invoiceNumber/view",
      title: "Transfer Stock Details",
    },
    // Remove Stock
    {
      path: "/invoices/remove-stock",
      title: "Remove Stock",
    },
    {
      path: "/invoices/remove-stock/new",
      title: "New Remove Stock",
    },
    {
      path: "/invoices/remove-stock/:invoiceNumber/view",
      title: "Remove Stock Details",
    },
    // Stock Count
    {
      path: "/invoices/stock-count",
      title: "Stock Count",
    },
    {
      path: "/invoices/stock-count/new",
      title: "New Stock Count",
    },
    {
      path: "/invoices/stock-count/:invoiceId/view",
      title: "Stock Count Details",
    },
  ];

  // Get page title based on current route
  const getPageTitle = () => {
    // Find matching route pattern
    const matchingRoute = routes.find((route) =>
      matchPath(route.path, location.pathname)
    );

    return matchingRoute ? t(matchingRoute.title) : t("Not Found");
  };

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [isRTL]);

  return (
    <div className="layout">
      <Sidebar isOpen={isSidebarOpen} />
      <div
        className={`main-content ${isSidebarOpen ? "expanded" : "collapsed"}`}
      >
        <Header
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          title={getPageTitle()}
        />

        <Routes>
          <Route path="/" element={<Home />} />
          {/* Inventory */}
          <Route path="/inventory/products" element={<GetProducts />} />
          <Route path="/inventory/products/new" element={<NewProduct />} />
          {/* Purchase Invoices */}
          <Route
            path="/invoices/purchase-orders"
            element={<GetPurchaseOrder />}
          />
          <Route
            path="/invoices/purchase-orders/:id/view"
            element={<GetPurchaseById />}
          />
          <Route
            path="/invoices/purchase-orders/new"
            element={<NewPurchaseOrder />}
          />
          {/* Return Invoices */}
          <Route
            path="/invoices/return-stocks"
            element={<GetReturnInvoices />}
          />
          <Route
            path="/invoices/return-stocks/:id/view"
            element={<GetReturnById />}
          />
          <Route
            path="/invoices/return-stocks/new"
            element={<NewReturnInvoices />}
          />
          {/* Suppliers */}
          <Route path="/invoices/suppliers/new" element={<NewSupplier />} />
          <Route path="/invoices/suppliers/:id" element={<EditSupplier />} />
          <Route path="/invoices/suppliers" element={<GetSuppliers />} />
          <Route
            path="/invoices/suppliers/:supplierId/payments/pay-credit"
            element={<PayCreditAmount />}
          />
          <Route
            path="/invoices/suppliers/:supplierId/payments/receive-debit"
            element={<RecieveDebitAmount />}
          />
          <Route path="/invoices/payments" element={<Payments />} />
          {/* Stock Transfer */}
          <Route
            path="/invoices/transfer-stock"
            element={<GetStockTransfer />}
          />
          <Route
            path="/invoices/transfer-stock/new-multiple/new"
            element={<NewStockTransfer />}
          />
          <Route
            path="/invoices/transfer-stock/new-multiple/request"
            element={<NewRequestStockTransfer />}
          />
          <Route
            path="/invoices/transfer-stock/recieve-stock/:invoiceId"
            element={<RecieveStockTransfer />}
          />
          <Route
            path="/invoices/transfer-stock/send-stock/:invoiceId"
            element={<SendStockTransfer />}
          />
          <Route
            path="/invoices/transfer-stock/:invoiceNumber/view"
            element={<GetStockTransferById />}
          />
          {/* Remove Stock */}
          <Route path="/invoices/remove-stock" element={<GetRemoveStock />} />
          <Route
            path="/invoices/remove-stock/new"
            element={<NewRemoveStock />}
          />
          <Route
            path="/invoices/remove-stock/:invoiceNumber/view"
            element={<GetRemoveStockById />}
          />
          {/* Stock Count */}
          <Route path="/invoices/stock-count" element={<GetStockCount />} />
          <Route path="/invoices/stock-count/new" element={<NewStockCount />} />
          <Route
            path="/invoices/stock-count/:invoiceId/view"
            element={<GetStockCountById />}
          />

          {/* NotFound Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default Layout;

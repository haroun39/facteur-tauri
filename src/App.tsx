import { useState } from "react";
import "./App.css";
import CustomersPage from "./components/Customers/CustomersPage";
import InvoicesPage from "./components/Invoices/InvoicesPage";
import PaymentsPage from "./components/Payments/PaymentsPage";
import DebtsPage from "./components/Debts/DebtsPage";
import ReportsPage from "./components/Reports/ReportsPage";
type Page = "customers" | "invoices" | "payments" | "debts" | "reports";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("invoices");

  const renderPage = () => {
    switch (currentPage) {
      case "customers":
        return <CustomersPage />;
      case "invoices":
        return <InvoicesPage />;
      case "payments":
        return <PaymentsPage />;
      case "debts":
        return <DebtsPage />;
      case "reports":
        return <ReportsPage />;
      default:
        return <CustomersPage />;
    }
  };
  return (
    <div className="flex h-screen bg-gray-100 flex-col">
      {/* Sidebar */}
      <div className="bg-gray-800 text-white flex items-end gap-4 ">
        <div className="p-6 py-1">
          <h1 className="text-2xl font-bold">Facteur</h1>
          <p className="text-sm text-gray-400">نظام الفواتير والديون</p>
        </div>

        <nav className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage("reports")}
            className={`w-full text-right px-6 py-2 hover:bg-gray-700 transition-colors ${
              currentPage === "reports" ? "border-b-4 border-primary" : ""
            }`}
          >
            التقارير
          </button>

          <button
            onClick={() => setCurrentPage("invoices")}
            className={`w-full text-right px-6 py-2 hover:bg-gray-700 transition-colors ${
              currentPage === "invoices" ? "border-b-4 border-primary" : ""
            }`}
          >
            الفواتير
          </button>

          <button
            onClick={() => setCurrentPage("payments")}
            className={`w-full text-right px-6 py-2 hover:bg-gray-700 transition-colors ${
              currentPage === "payments" ? "border-b-4 border-primary" : ""
            }`}
          >
            المدفوعات
          </button>

          <button
            onClick={() => setCurrentPage("debts")}
            className={`w-full text-right px-6 py-2 hover:bg-gray-700 transition-colors ${
              currentPage === "debts" ? "border-b-4 border-primary" : ""
            }`}
          >
            الديون
          </button>

          <button
            onClick={() => setCurrentPage("customers")}
            className={`w-full text-right px-6 py-2 hover:bg-gray-700 transition-colors ${
              currentPage === "customers" ? "border-b-4 border-primary" : ""
            }`}
          >
            العملاء
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{renderPage()}</div>
    </div>
  );
}

export default App;

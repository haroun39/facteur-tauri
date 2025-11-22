import React, { useState, useEffect } from "react";
import { Customer } from "../../types";
import CustomerForm from "./CustomerForm";
import CustomerList from "./CustomerList";
import PrintDialog from "./dialogs/PrintDialog";
import {
  createCustomer,
  deleteCustomer,
  getAllCustomers,
  updateCustomer,
} from "@/main";

declare global {
  interface Window {
    electronAPI: any;
  }
}

const CustomersPage: React.FC = () => {
  const [notMore, setNotMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogPrintOpen, setIsDialogPrintOpen] = useState(false);
  const [printCustomer, setPrintCustomer] = useState<Customer | null>(null);

  const loadCustomers = async () => {
    const data = await getAllCustomers(
      searchTerm.trim() || undefined,
      currentPage,
      pageSize
    );
    if (data.length === 0 && currentPage > 1) {
      setNotMore(true);
      return;
    } else if (data.length < pageSize) {
      setNotMore(true);
    } else {
      setNotMore(false);
    }

    setCustomers(data);
  };

  const handleSave = async (customer: Omit<Customer, "id" | "createdAt">) => {
    if (selectedCustomer && selectedCustomer.id) {
      await updateCustomer(selectedCustomer.id, customer);
    } else {
      await createCustomer(customer);
    }

    await loadCustomers();
    setShowForm(false);
    setSelectedCustomer(null);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      await deleteCustomer(id);
      await loadCustomers();
    }
  };

  const handleNew = () => {
    setSelectedCustomer(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedCustomer(null);
  };

  const handlePrint = (customer: Customer) => {
    setPrintCustomer(customer);
    setIsDialogPrintOpen(true);
  };

  useEffect(() => {
    loadCustomers();
  }, [searchTerm, currentPage, pageSize]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">إدارة العملاء</h1>
        <button onClick={handleNew} className="btn-primary">
          إضافة عميل جديد
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="بحث عن عميل..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
        />
      </div>

      {showForm ? (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">
            {selectedCustomer ? "تعديل العميل" : "إضافة عميل جديد"}
          </h2>
          <CustomerForm
            customer={selectedCustomer}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      ) : null}
      <CustomerList
        customers={customers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        notMore={notMore}
        pageSize={pageSize}
        setPageSize={setPageSize}
        onPrint={handlePrint}
      />
      {printCustomer && isDialogPrintOpen && (
        <PrintDialog
          open={isDialogPrintOpen}
          onOpenChange={setIsDialogPrintOpen}
          item={printCustomer}
        />
      )}
    </div>
  );
};

export default CustomersPage;

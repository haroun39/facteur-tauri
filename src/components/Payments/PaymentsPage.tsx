import React, { useState, useEffect } from "react";
import { Payment } from "../../types";
import PaymentForm from "./PaymentForm";
import PaymentList from "./PaymentList";
import {
  createPayment,
  deletePayment,
  getAllPayments,
  updatePayment,
} from "@/main";

declare global {
  interface Window {
    electronAPI: any;
  }
}

const PaymentsPage: React.FC = () => {
  const [notMore, setNotMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    loadPayments();
  }, [searchTerm, currentPage, pageSize]);

  const loadPayments = async () => {
    const { data, sum_amount } = await getAllPayments(
      searchTerm.trim() || undefined,
      currentPage,
      pageSize
    );
    setTotalAmount(sum_amount);
    if (data.length === 0 && currentPage > 1) {
      setNotMore(true);
      return;
    } else if (data.length < pageSize) {
      setNotMore(true);
    } else {
      setNotMore(false);
    }
    setPayments(data);
  };

  const handleSave = async (payment: Payment) => {
    if (editingPayment?.id) {
      await updatePayment(editingPayment.id, payment);
      setShowForm(false);
    } else {
      await createPayment(payment);
    }
    await loadPayments();
    setEditingPayment(null);
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الدفعة؟")) {
      await deletePayment(id);
      await loadPayments();
    }
  };

  const handleNew = () => {
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPayment(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">إدارة المدفوعات</h1>
        <button onClick={handleNew} className="btn-primary">
          تسجيل دفعة جديدة
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="بحث في المدفوعات..."
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
            {editingPayment ? "تعديل دفعة" : "تسجيل دفعة جديدة"}
          </h2>
          <PaymentForm
            payment={editingPayment || undefined}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      ) : null}

      <PaymentList
        payments={payments}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        notMore={notMore}
        pageSize={pageSize}
        setPageSize={setPageSize}
        sumAmount={totalAmount}
      />
    </div>
  );
};

export default PaymentsPage;

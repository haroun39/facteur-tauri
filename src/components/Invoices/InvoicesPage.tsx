import React, { useState, useEffect } from "react";
import { Invoice, InvoiceItem } from "../../types";
import InvoiceForm from "./InvoiceForm";
import InvoiceList from "./InvoiceList";
import {
  createInvoice,
  createInvoiceItem,
  createPayment,
  deleteByInvoiceId,
  deleteInvoice,
  getAllInvoices,
  updateInvoice,
} from "@/main";
import InvoicesPrint from "./prints/invoices/InvoicesPrint";

declare global {
  interface Window {
    electronAPI: any;
  }
}

const InvoicesPage: React.FC = () => {
  const [notMore, setNotMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isOpenPrint, setIsOpenPrint] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, [searchTerm, currentPage, pageSize]);

  const loadInvoices = async () => {
    const { data, total } = await getAllInvoices(
      searchTerm.trim() || undefined,
      currentPage,
      pageSize
    );
    setTotalInvoices(total);
    if (data.length === 0 && currentPage > 1) {
      setNotMore(true);
      return;
    } else if (data.length < pageSize) {
      setNotMore(true);
    } else {
      setNotMore(false);
    }
    setInvoices(data);
  };

  const handleSave = async (invoice: Invoice, items: InvoiceItem[]) => {
    let invoiceId: number;

    if (editingInvoice && editingInvoice.id) {
      invoiceId = editingInvoice.id;
      await updateInvoice(editingInvoice.id, invoice);
      deleteByInvoiceId(editingInvoice.id);

      for (const item of items) {
        createInvoiceItem({
          ...item,
          invoice_id: editingInvoice.id,
        });
      }
      setShowForm(false);
    } else {
      invoiceId = await createInvoice(invoice);

      for (const item of items) {
        createInvoiceItem({
          ...item,
          invoice_id: invoiceId,
        });
      }

      // إضافة دفعة إذا كانت الفاتورة مدفوعة أو دفع جزئي
      if (
        (invoice.status === "partial" &&
          invoice.paid_amount &&
          invoice.paid_amount > 0) ||
        invoice.status === "paid"
      ) {
        createPayment({
          customer_id: invoice.customer_id,
          invoice_id: invoiceId,
          amount:
            invoice.status === "partial" ? invoice.paid_amount : invoice.total,
          date: invoice.date,
          notes:
            invoice.status === "paid"
              ? "دفعة كاملة - تم الدفع عند إنشاء الفاتورة"
              : "دفعة جزئية - تم الدفع عند إنشاء الفاتورة",
        });
      }
    }

    await loadInvoices();
    setEditingInvoice(null);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
      await deleteInvoice(id);
      await loadInvoices();
    }
  };

  const handleNew = () => {
    setEditingInvoice(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInvoice(null);
  };

  const onPrint = async () => {
    setIsOpenPrint(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">إدارة الفواتير</h1>
        <button onClick={handleNew} className="btn-primary">
          إنشاء فاتورة جديدة
        </button>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          placeholder="بحث في الفواتير..."
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
            {editingInvoice ? "تعديل الفاتورة" : "إنشاء فاتورة جديدة"}
          </h2>
          <InvoiceForm
            invoice={editingInvoice}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      ) : null}

      <InvoiceList
        invoices={invoices}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        notMore={notMore}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalInvoices={totalInvoices}
        onPrint={onPrint}
      />
      {isOpenPrint && (
        <InvoicesPrint open={isOpenPrint} onOpenChange={setIsOpenPrint} />
      )}
    </div>
  );
};

export default InvoicesPage;

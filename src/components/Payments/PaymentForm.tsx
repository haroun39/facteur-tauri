import React, { useState, useEffect } from "react";
import { Payment } from "../../types";
import InputSearch2 from "../ui/input-search-2";
import { getAllDebts } from "@/main";

interface Props {
  payment?: Payment;
  onSave: (payment: Payment) => Promise<void>;
  onCancel: () => void;
}

const PaymentForm: React.FC<Props> = ({ payment, onSave, onCancel }) => {
  const [errors, setErrors] = useState<
    {
      field: string;
      message: string;
    }[]
  >([]);
  const [formData, setFormData] = useState<Payment>(
    payment || {
      payment_number: "",
      customer_id: 0,
      invoice_id: undefined,
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      notes: "",
    }
  );

  const generatePaymentNumber = () => {
    const timestamp = Date.now();
    setFormData((prev) => ({
      ...prev,
      payment_number: `PAY-${timestamp}`,
    }));
  };

  useEffect(() => {
    if (payment) {
      setFormData(payment);
    } else {
      generatePaymentNumber();
    }
  }, [payment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.customer_id == 0) {
      setErrors([{ field: "customer_id", message: "الرجاء اختيار عميل" }]);
      return;
    }
    await onSave(formData);
    setFormData({
      payment_number: "",
      customer_id: 0,
      invoice_id: undefined,
      amount: 0,
      date: formData.date,
      notes: "",
    });
    generatePaymentNumber();
    setSearchTerm("");
    // focus on customer input
    document.getElementById("customer_id")?.focus();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const value =
      e.target.type === "number" ? parseFloat(e.target.value) : e.target.value;

    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const loadCustomers = async (searchQuery?: string) => {
    const data = await getAllDebts(searchQuery, true);
    return data;
  };
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            رقم الدفعة *
          </label>
          <input
            type="text"
            name="payment_number"
            value={formData.payment_number}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            العميل *
          </label>
          <InputSearch2
            idValue={formData.customer_id}
            onValueChange={(value) => {
              setFormData({ ...formData, customer_id: value });
            }}
            loadOptions={loadCustomers}
            className="input-field"
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="ابحث عن عميل..."
            type="text"
            required
            autoFocus={payment ? false : true}
            id="customer_id"
          />
          {errors.find((err) => err.field === "customer_id") && (
            <p className="text-danger text-sm mt-1">
              {errors.find((err) => err.field === "customer_id")?.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            التاريخ *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الفاتورة (اختياري)
          </label>
          <select
            name="invoiceId"
            value={formData.invoiceId || ""}
            onChange={handleChange}
            className="input-field"
            disabled={formData.customerId === 0}
          >
            <option value="">دفعة عامة</option>
            {filteredInvoices.map(
              (invoice) =>
                (invoice?.remainingAmount || 0) > 0 && (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} - المتبقي:{" "}
                    {(invoice.remainingAmount || 0).toFixed(2)}
                  </option>
                )
            )}
          </select>
        </div> */}

        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المبلغ *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount || ""}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ملاحظات
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="input-field"
        />
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          حفظ الدفعة
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">
          إلغاء
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;

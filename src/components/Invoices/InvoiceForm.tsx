import React, { useState, useEffect } from "react";
import { Invoice, InvoiceItem } from "../../types";
import InputSearch from "../ui/input-search";
import InputSearch2 from "../ui/input-search-2";
import { getAllCustomers, getInvoiceItems, getProductsGrouped } from "@/main";

interface Props {
  invoice: Invoice | null;
  onSave: (invoice: Invoice, items: InvoiceItem[]) => Promise<void>;
  onCancel: () => void;
}

const InvoiceForm: React.FC<Props> = ({ invoice, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    {
      field: string;
      message: string;
    }[]
  >([]);
  const [formData, setFormData] = useState<Invoice>({
    invoice_number: "",
    customer_id: 0,
    date: new Date().toISOString().split("T")[0],
    total: 0,
    status: "unpaid",
    paid_amount: 0,
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { product_name: "", unit_price: 0, quantity: 1, total: 0, invoice_id: 0 },
  ]);

  const [showPaidAmount, setShowPaidAmount] = useState(false);

  useEffect(() => {
    setShowPaidAmount(formData.status === "partial" && !invoice);
  }, [formData.status]);

  useEffect(() => {
    if (invoice) {
      setFormData(invoice);
      loadItems(invoice.id!);
    } else {
      generateInvoiceNumber();
    }
  }, [invoice]);

  const loadItems = async (invoice_id: number) => {
    const data = await getInvoiceItems(invoice_id);
    if (data.length > 0) {
      setItems(data);
    }
  };

  const loadProducts = async (searchQuery?: string) => {
    const data = await getProductsGrouped(searchQuery);
    return data;
  };
  const loadCustomers = async (searchQuery?: string) => {
    const data = await getAllCustomers(searchQuery);
    return data;
  };

  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    setFormData((prev) => ({
      ...prev,
      invoice_number: `INV-${timestamp}`,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (formData.customer_id == 0) {
      setErrors([{ field: "customer_id", message: "الرجاء اختيار عميل" }]);
      setLoading(false);
      return;
    }
    const total = items.reduce((sum, item) => sum + item.total, 0);

    await onSave(
      {
        ...formData,
        total,
      },
      items
    );
    setLoading(false);
    setFormData({
      invoice_number: "",
      customer_id: 0,
      date: formData.date,
      total: 0,
      status: "unpaid",
      paid_amount: 0,
    });
    generateInvoiceNumber();
    setItems([
      { product_name: "", unit_price: 0, quantity: 1, total: 0, invoice_id: 0 },
    ]);
    setSearchTerm("");
    // focus on customer input
    document.getElementById("customer_id")?.focus();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.type === "number" ? parseFloat(e.target.value) : e.target.value;

    const newFormData = {
      ...formData,
      [e.target.name]: value,
    };

    // إذا كانت الحالة paid، تعيين المبلغ المدفوع للإجمالي
    if (e.target.name === "status" && value === "paid") {
      const total = items.reduce((sum, item) => sum + item.total, 0);
      newFormData.paid_amount = total;
    }
    // إذا كانت الحالة unpaid، تعيين المبلغ المدفوع لصفر
    if (e.target.name === "status" && value === "unpaid") {
      newFormData.paid_amount = 0;
    }

    setFormData(newFormData);
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: any
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // حساب الإجمالي التلقائي
    if (field === "unit_price" || field === "quantity") {
      newItems[index].total =
        newItems[index].unit_price * newItems[index].quantity;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { product_name: "", unit_price: 0, quantity: 1, total: 0, invoice_id: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const total = items.reduce((sum, item) => sum + item.total, 0);

  const [searchTerm, setSearchTerm] = useState("");
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            رقم الفاتورة *
          </label>
          <input
            type="text"
            name="invoice_number"
            value={formData.invoice_number}
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
            autoFocus={invoice ? false : true}
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
      </div>

      {/* حالة الفاتورة والمبلغ المدفوع */}
      {!invoice && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={showPaidAmount ? "md:col-span-1" : "md:col-span-full"}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              حالة الفاتورة *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="unpaid">غير مدفوعة</option>
              <option value="partial">دفع جزئي</option>
              <option value="paid">مدفوعة</option>
            </select>
          </div>

          {showPaidAmount && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المبلغ المدفوع *
              </label>
              <input
                type="number"
                name="paid_amount"
                value={formData.paid_amount || 0}
                onChange={handleChange}
                required={showPaidAmount}
                min="0"
                max={total}
                step="0.01"
                className="input-field"
                placeholder="أدخل المبلغ المدفوع"
              />
              <p className="text-xs text-gray-500 mt-1">
                من أصل {total.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* بنود الفاتورة */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">بنود الفاتورة</h3>
          <button
            type="button"
            onClick={addItem}
            className="btn-secondary text-sm"
          >
            إضافة بند
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded"
            >
              <div className="md:col-span-2">
                <InputSearch
                  searchTerm={item.product_name}
                  setSearchTerm={(value) =>
                    handleItemChange(index, "product_name", value)
                  }
                  placeholder="اسم المنتج/الخدمة"
                  type="text"
                  className="input-field"
                  loadOptions={loadProducts}
                />
              </div>

              <div>
                <input
                  type="number"
                  placeholder="سعر الوحدة"
                  value={item.unit_price || ""}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "unit_price",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  required
                  min="0"
                  step="0.01"
                  className="input-field"
                />
              </div>

              <div>
                <input
                  type="number"
                  placeholder="الكمية"
                  value={item.quantity || ""}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "quantity",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  required
                  min="0"
                  step="0.01"
                  className="input-field"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="الإجمالي"
                  value={item.total}
                  readOnly
                  className="input-field bg-gray-200"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-danger hover:text-red-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* الإجمالي */}
      <div className="bg-primary/10 p-4 rounded">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">الإجمالي الكلي:</span>
          <span className="text-2xl font-bold text-primary">
            {total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "جاري الحفظ..." : "حفظ الفاتورة"}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">
          إلغاء
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;

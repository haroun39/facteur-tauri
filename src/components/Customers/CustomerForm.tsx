import React, { useState, useEffect } from "react";
import { Customer } from "../../types";

interface Props {
  customer: Customer | null;
  onSave: (customer: Omit<Customer, "id" | "createdAt">) => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<Props> = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Customer, "id" | "createdAt">>({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    }
  }, [customer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          اسم العميل *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          رقم الهاتف *
        </label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          العنوان
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="input-field"
        />
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
          حفظ
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">
          إلغاء
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;

import React, { useEffect, useState } from "react";
import { Invoice, InvoiceItem } from "../../../../types";
import { getInvoiceItems } from "@/main";
import { PDFViewer } from "@react-pdf/renderer";
import InvoicePDF from "./InvoicePDF";

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

const InvoicePrint: React.FC<Props> = ({ invoice, onClose }) => {
  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    const loadItems = async () => {
      if (invoice.id) {
        const data = await getInvoiceItems(invoice.id);
        setItems(data);
      }
    };
    loadItems();
  }, [invoice.id]);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 print:bg-white print:block print:p-0">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh]  overflow-auto print:max-w-none print:max-h-none print:overflow-visible print:rounded-none">
        <div>
          {/* أزرار التحكم */}
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center print:hidden">
            <h2 className="text-xl font-bold">طباعة الفاتورة</h2>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-outline">
                إغلاق
              </button>
            </div>
          </div>
        </div>
        {items.length > 0 && (
          <PDFViewer
            width={"100%"}
            style={{ height: "calc(90vh - 5rem)", border: "none" }}
          >
            <InvoicePDF invoice={invoice} items={items} />
          </PDFViewer>
        )}
      </div>
    </div>
  );
};

export default InvoicePrint;

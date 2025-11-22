import { Invoice } from "../../../../types";
import { PDFViewer } from "@react-pdf/renderer";
import InvoicePDF from "./InvoicePDF";

interface Props {
  data: {
    invoices: Invoice[];
    total: number;
  };
  onClose: () => void;
}

const InvoicesPrint: React.FC<Props> = ({ data, onClose }) => {

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
        {data.invoices.length > 0 && (
          <PDFViewer
            width={"100%"}
            style={{ height: "calc(90vh - 5rem)", border: "none" }}
          >
            <InvoicePDF data={data}/>
          </PDFViewer>
        )}
      </div>
    </div>
  );
};

export default InvoicesPrint;

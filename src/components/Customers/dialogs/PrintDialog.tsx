import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTransactions } from "@/main";
import { Customer, TransactionsReport } from "@/types";
import { Printer } from "lucide-react";
import React, { useState } from "react";
import InvoicePDF from "./InvoicePDF";
import { PDFViewer } from "@react-pdf/renderer";
import { cn } from "@/lib/utils";
type Props = {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  item: Customer;
};
function PrintDialog(props: Props) {
  const [transactions, setTransactions] = useState<TransactionsReport | null>(
    null
  );
  const [formData, setFormData] = useState<{
    from: string;
    to: string;
  }>({
    from: "",
    to: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePrint = async () => {
    // Implement print logic here, possibly invoking a backend command
    const data = await getTransactions(
      props.item.id!,
      formData.from,
      formData.to || undefined
    );
    setTransactions(data);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        onOpenChange={props.onOpenChange}
        className={cn("max-w-lg", transactions && "max-w-4xl")}
      >
        <DialogTitle>
          <h2 className="text-lg font-bold mb-4">طباعة معلومات العميل</h2>
        </DialogTitle>
        {!transactions ? (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                من تاريخ *
              </label>
              <input
                type="date"
                name="from"
                value={formData.from}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                إلى تاريخ *
              </label>
              <input
                type="date"
                name="to"
                value={formData.to}
                onChange={handleChange}
                required
                min={formData.from}
                className="input-field"
              />
            </div>
          </div>
        ) : (
          <PDFViewer
            width={"100%"}
            style={{ height: "calc(90vh - 5rem)", border: "none" }}
            key={Math.random()}
          >
            <InvoicePDF
              data={transactions}
              customer={props.item}
              formDate={formData.from}
              toDate={formData.to}
            />
          </PDFViewer>
        )}
        <DialogFooter className="flex items-center gap-2">
          {!transactions && (
            <button
              className="btn-primary"
              id="modal-print-btn"
              onClick={handlePrint}
            >
              طباعة
              <Printer className="inline-block w-4 h-4 ms-2" />
            </button>
          )}
          <button
            className="btn-outline"
            id="modal-cancel-btn"
            onClick={() => props.onOpenChange(false)}
          >
            إلغاء
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PrintDialog;

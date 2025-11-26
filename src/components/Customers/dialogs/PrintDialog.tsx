import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTransactions } from "@/main";
import { Customer } from "@/types";
import { Printer } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { openPath } from "@tauri-apps/plugin-opener";
import { Spinner } from "@/components/ui/spinner";
type Props = {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  item: Customer;
};
function PrintDialog(props: Props) {
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    // Implement print logic here, possibly invoking a backend command
    const data = await getTransactions(
      props.item.id!,
      props.item.name!,
      props.item.phone!,
      props.item.address || "",
      formData.from,
      formData.to || undefined
    );
    await openPath(data);
    props.onOpenChange(false);
    setLoading(false);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        onOpenChange={props.onOpenChange}
        className={cn("max-w-lg")}
      >
        <DialogTitle>
          <h2 className="text-lg font-bold mb-4">طباعة معلومات العميل</h2>
        </DialogTitle>
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
        <DialogFooter className="flex items-center gap-2">
          <button
            className="btn-primary"
            id="modal-print-btn"
            onClick={handlePrint}
            disabled={loading}
          >
            طباعة
            {loading ? (
              <Spinner className="w-4 h-4 " />
            ) : (
              <Printer className="w-4 h-4 " />
            )}
          </button>
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

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { getInvoices } from "@/main";
import { cn } from "@/lib/utils";
import { Printer } from "lucide-react";
import { openPath } from "@tauri-apps/plugin-opener";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
};
const InvoicesPrint: React.FC<Props> = (props) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    from: string;
    to: string;
    customer_id: number;
  }>({
    from: "",
    to: "",
    customer_id: 0,
  });
  // const [searchTerm, setSearchTerm] = useState("");

  // const loadCustomers = async (searchQuery?: string) => {
  //   const data = await getAllCustomers(searchQuery);
  //   return data;
  // };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePrint = async () => {
    setLoading(true);
    // Implement print logic here, possibly invoking a backend command
    const data = await getInvoices(formData.from, formData.to || undefined);
    // فتح الملف مع البرنامج الافتراضي (ويمكن من هناك طباعته)
    // const path =
    //   "C:/Users/haroun_dev/AppData/Roaming/com.haroundev.facteur/invoices/invoices_report.pdf";
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
          <h2 className="text-lg font-bold mb-4">طباعة الفواتير</h2>
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
          {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                العميل *
              </label>
              <InputSearch3
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
                id="customer_id"
              />
            </div> */}
        </div>
        <DialogFooter className="flex items-center gap-2">
          <button
            className="btn-primary flex items-center gap-3"
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
};

export default InvoicesPrint;

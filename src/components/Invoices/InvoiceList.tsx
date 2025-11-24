import React, { useState } from "react";
import { Invoice } from "../../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
// @ts-ignore: SVG module missing types
import emptyData from "../../assets/emptyData-light.svg";
import Pagination from "../global/Pagination";
import InvoicePrint from "./prints/invoice/InvoicePrint";
import { Pencil, PrinterIcon, Trash } from "lucide-react";
interface Props {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: number) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  notMore: boolean;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  totalInvoices: number;
  onPrint: () => void;
}

const InvoiceList: React.FC<Props> = ({
  invoices,
  onEdit,
  onDelete,
  currentPage,
  setCurrentPage,
  notMore,
  pageSize,
  setPageSize,
  totalInvoices,
  onPrint,
}) => {
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">قائمة الفواتير</h2>
          <button
            onClick={onPrint}
            className="text-secondary hover:text-green-700 bg-gray-100 p-2 px-3 rounded-md font-bold"
          >
            طباعة الفواتير
            <PrinterIcon className="inline-block w-4 h-4 ms-1" />
          </button>
        </div>
        <div className="text-gray-600">
          مجموع الفواتير: {totalInvoices.toFixed(2)}
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col justify-center items-center gap-5">
          <img src={emptyData} alt="No data" className="w-20 h-20 " />
          <p className="text-gray-500 text-center">لا توجد فواتير</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader className="bg-gray-50">
              <TableHead>رقم الفاتورة</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الإجمالي</TableHead>
              {/* <TableHead >
                    المدفوع
                  </TableHead>
                  <TableHead >
                    الحالة
                  </TableHead> */}
              <TableHead className="w-10">إجراءات</TableHead>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-gray-50">
                  <TableCell className="text-sm font-medium text-gray-900">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {invoice.customer_name}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {invoice.date}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 font-semibold">
                    {invoice.total.toFixed(2)}
                  </TableCell>
                  {/* <TableCell className="text-sm text-gray-500">
                      {invoice.paidAmount?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {getStatusBadge(invoice.status)}
                    </TableCell> */}
                  <TableCell className="text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(invoice)}
                        className="text-primary hover:text-blue-700 bg-gray-100 p-2 px-3 rounded-md"
                      >
                        تعديل
                        <Pencil
                          className="inline-block w-4 h-4 ms-1"
                          size={16}
                        />
                      </button>
                      <button
                        onClick={() => invoice.id && onDelete(invoice.id)}
                        className="text-danger hover:text-red-700 bg-gray-100 p-2 px-3 rounded-md"
                      >
                        حذف
                        <Trash
                          className="inline-block w-4 h-4 ms-1"
                          size={16}
                        />
                      </button>
                      <button
                        onClick={() => setPrintInvoice(invoice)}
                        className="text-secondary hover:text-green-700 bg-gray-100 p-2 px-3 rounded-md"
                      >
                        طباعة
                        <PrinterIcon
                          className="inline-block w-4 h-4 ms-1"
                          size={16}
                        />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* pagination */}
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            notMore={notMore}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        </>
      )}

      {/* نافذة الطباعة */}
      {printInvoice && (
        <InvoicePrint
          invoice={printInvoice}
          onClose={() => setPrintInvoice(null)}
        />
      )}
    </div>
  );
};

export default InvoiceList;

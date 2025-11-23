import React from "react";
import { Payment } from "../../types";
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
interface Props {
  payments: Payment[];
  onEdit: (payment: Payment) => void;
  onDelete: (id: number) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  notMore: boolean;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  sumAmount: number;
}

const PaymentList: React.FC<Props> = ({
  payments,
  onEdit,
  onDelete,
  currentPage,
  setCurrentPage,
  notMore,
  pageSize,
  setPageSize,
  sumAmount,
}) => {
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">سجل المدفوعات</h2>
        <div className="text-gray-600">
          مجموع الدفعات: {sumAmount.toFixed(2)}
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col justify-center items-center gap-5">
          <img src={emptyData} alt="No data" className="w-20 h-20 " />
          <p className="text-gray-500 text-center">لا توجد مدفوعات</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader className="bg-gray-50">
              <TableHead>رقم الدفعة</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>الفاتورة</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>ملاحظات</TableHead>
              <TableHead className="w-10">إجراءات</TableHead>
            </TableHeader>
            <TableBody className="">
              {payments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-gray-50">
                  <TableCell className="text-sm font-medium text-gray-900">
                    {payment?.payment_number}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {payment.customer_name}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {payment.invoice_number || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 font-semibold">
                    {payment.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {payment.date}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-500">
                    {payment.notes}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    <button
                      onClick={() => onEdit(payment)}
                      className="text-primary hover:text-blue-700 ml-3 bg-gray-100 p-2 px-3 rounded-md"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => payment.id && onDelete(payment.id)}
                      className="text-danger hover:text-red-700 bg-gray-100 p-2 px-3 rounded-md"
                    >
                      حذف
                    </button>
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
    </div>
  );
};

export default PaymentList;

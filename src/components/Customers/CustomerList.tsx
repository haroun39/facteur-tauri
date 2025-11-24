import React from "react";
import { Customer } from "../../types";
import Pagination from "../global/Pagination";
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
import { Pencil, PrinterIcon, Trash } from "lucide-react";
interface Props {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  notMore: boolean;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  onPrint: (customer: Customer) => void;
}

const CustomerList: React.FC<Props> = ({
  customers,
  onEdit,
  onDelete,
  currentPage,
  setCurrentPage,
  notMore,
  pageSize,
  setPageSize,
  onPrint,
}) => {
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">قائمة العملاء</h2>

      {customers.length === 0 ? (
        <div className="flex flex-col justify-center items-center gap-5">
          <img src={emptyData} alt="No data" className="w-20 h-20 " />
          <p className="text-gray-500 text-center">لا يوجد عملاء</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader className="bg-gray-50">
              <TableHead>الاسم</TableHead>
              <TableHead>رقم الهاتف</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>ملاحظات</TableHead>
              <TableHead className="w-10">إجراءات</TableHead>
            </TableHeader>
            <TableBody className="">
              {customers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50">
                  <TableCell className="text-sm font-medium text-gray-900">
                    {customer.name}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {customer.phone}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {customer.address}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {customer.notes}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(customer)}
                        className="text-primary hover:text-blue-700 bg-gray-100 p-2 px-3 rounded-md"
                      >
                        تعديل
                        <Pencil
                          className="inline-block w-4 h-4 ms-1"
                          size={16}
                        />
                      </button>
                      <button
                        onClick={() => customer.id && onDelete(customer.id)}
                        className="text-danger hover:text-red-700 bg-gray-100 p-2 px-3 rounded-md"
                      >
                        حذف
                        <Trash
                          className="inline-block w-4 h-4 ms-1"
                          size={16}
                        />
                      </button>
                      <button
                        onClick={() => onPrint(customer)}
                        className="text-secondary hover:text-green-700 bg-gray-100 p-2 px-3 rounded-md"
                      >
                        طباعة المعاملات
                        <PrinterIcon className="inline-block w-4 h-4 ms-1" />
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
    </div>
  );
};

export default CustomerList;

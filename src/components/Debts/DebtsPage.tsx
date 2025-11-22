import React, { useState, useEffect } from "react";
import { Customer } from "../../types";
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
import { getAllDebts } from "@/main";

declare global {
  interface Window {
    electronAPI: any;
  }
}

const DebtsPage: React.FC = () => {
  const [debts, setDebts] = useState<Customer[]>([]);

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    const data = await getAllDebts();

    setDebts(data);
  };

  const totalDebts = debts.reduce(
    (sum, debt) => sum + (debt?.total_debt || 0),
    0
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">الديون المستحقة</h1>

      {/* ملخص الديون */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card bg-danger/10 border-r-4 border-danger">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            إجمالي الديون
          </h3>
          <p className="text-3xl font-bold text-danger">
            {totalDebts.toFixed(2)}
          </p>
        </div>

        <div className="card bg-warning/10 border-r-4 border-warning">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            عدد العملاء المدينين
          </h3>
          <p className="text-3xl font-bold text-warning">{debts.length}</p>
        </div>

        <div className="card bg-primary/10 border-r-4 border-primary">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            متوسط الدين
          </h3>
          <p className="text-3xl font-bold text-primary">
            {debts.length > 0 ? (totalDebts / debts.length).toFixed(2) : "0.00"}
          </p>
        </div>
      </div>

      {/* قائمة الديون */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">تفاصيل الديون</h2>

        {debts.length === 0 ? (
          <div className="flex flex-col justify-center items-center gap-5">
            <img src={emptyData} alt="No data" className="w-20 h-20 " />
            <p className="text-gray-500 text-center">لا توجد ديون مستحقة</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50">
              <TableHead>العميل</TableHead>
              <TableHead>رقم الهاتف</TableHead>
              <TableHead>إجمالي الدين</TableHead>
              <TableHead>النسبة من الإجمالي</TableHead>
            </TableHeader>
            <TableBody>
              {debts.map((debt) => (
                <TableRow key={debt.id} className="hover:bg-gray-50">
                  <TableCell className="text-sm font-medium text-gray-900">
                    {debt.name}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {debt.phone || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-danger font-bold">
                    {(debt?.total_debt || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-danger h-2 rounded-full "
                          style={{
                            width: `${
                              ((debt?.total_debt || 0) / totalDebts) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="font-medium">
                        {(((debt?.total_debt || 0) / totalDebts) * 100).toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default DebtsPage;

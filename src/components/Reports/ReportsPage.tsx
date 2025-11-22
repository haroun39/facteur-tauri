import React, { useState, useEffect } from "react";
import { ReportSummary, Invoice } from "../../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { getAllInvoices, getReportSummary } from "@/main";
declare global {
  interface Window {
    electronAPI: any;
  }
}

const ReportsPage: React.FC = () => {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const summaryData = await getReportSummary();
    const { data: invoicesData } = await getAllInvoices(undefined, 1, 10);

    setSummary(summaryData);
    setInvoices(invoicesData);
  };

  if (!summary) {
    return <div className="p-6">جاري التحميل...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        التقارير والإحصائيات
      </h1>

      {/* ملخص عام */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card bg-primary/10 border-r-4 border-primary">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            إجمالي الفواتير
          </h3>
          <p className="text-3xl font-bold text-primary">{invoices.length}</p>
        </div>

        <div className="card bg-warning/10 border-r-4 border-warning">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            مجموع الفواتير
          </h3>
          <p className="text-3xl font-bold text-warning">
            {summary.total_invoices.toFixed(2)}
          </p>
        </div>

        <div className="card bg-secondary/10 border-r-4 border-secondary">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            المدفوعات المستلمة
          </h3>
          <p className="text-3xl font-bold text-secondary">
            {summary.total_payments.toFixed(2)}
          </p>
        </div>

        <div className="card bg-danger/10 border-r-4 border-danger">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            الديون المستحقة
          </h3>
          <p className="text-3xl font-bold text-danger">
            {summary.total_debts.toFixed(2)}
          </p>
        </div>
      </div>

      {/* تقرير الفواتير حسب الحالة */}
      <div className="grid grid-cols-1  gap-6 mb-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">ملخص مالي</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">إجمالي قيمة الفواتير</span>
              <span className="text-lg font-bold">
                {summary.total_invoices.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-medium">المدفوع</span>
              <span className="text-lg font-bold text-green-600">
                {summary.total_payments.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-red-50 rounded">
              <span className="font-medium">المتبقي</span>
              <span className="text-lg font-bold text-red-600">
                {summary.total_debts.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-primary/10 rounded">
              <span className="font-medium">نسبة التحصيل</span>
              <span className="text-lg font-bold text-primary">
                {invoices.reduce((sum, inv) => sum + inv.total, 0) > 0
                  ? (
                      (summary.total_payments / summary.total_invoices) *
                      100
                    ).toFixed(1)
                  : "0"}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* آخر الفواتير */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">آخر 10 فواتير</h2>
        <Table>
          <TableHeader className="bg-gray-50">
            <TableHead>رقم الفاتورة</TableHead>
            <TableHead>العميل</TableHead>
            <TableHead>المبلغ</TableHead>
            {/* <TableHead >
                  الحالة
                </TableHead> */}
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id} className="hover:bg-gray-50">
                <TableCell className="text-sm">
                  {invoice.invoice_number}
                </TableCell>
                <TableCell className="text-sm">
                  {invoice.customer_name}
                </TableCell>
                <TableCell className="text-sm font-semibold">
                  {invoice.total.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReportsPage;

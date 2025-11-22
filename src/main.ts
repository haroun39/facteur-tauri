import { invoke } from "@tauri-apps/api/core";
import {
  Customer,
  Invoice,
  InvoiceItem,
  Payment,
  Product,
  ReportSummary,
  TransactionsReport,
} from "./types";

// ================== CUSTOMERS ==================
export const getAllCustomers = async (
  searchQuery?: string,
  page?: number,
  pageSize?: number
): Promise<Customer[]> => {
  return await invoke("get_all_customers", { searchQuery, page, pageSize });
};

export const getCustomerById = async (id: number): Promise<Customer> => {
  return await invoke("get_customer_by_id", { id });
};

export const createCustomer = async (customer: any): Promise<Customer> => {
  return await invoke("create_customer", customer);
};

export const updateCustomer = async (id: number, customer: any) => {
  return await invoke("update_customer", { id, ...customer });
};

export const deleteCustomer = async (id: number) => {
  return await invoke("delete_customer", { id });
};

// ================== INVOICES ==================
export const getAllInvoices = async (
  searchQuery?: string,
  page?: number,
  pageSize?: number
): Promise<{ data: Invoice[]; total: number }> => {
  return await invoke("get_all_invoices", { searchQuery, page, pageSize });
};

export const getInvoiceById = async (id: number): Promise<Invoice> => {
  return await invoke("get_invoice_by_id", { id });
};

export const getInvoicesByCustomerId = async (
  customerId: number
): Promise<Invoice[]> => {
  return await invoke("get_invoices_by_customer_id", { customerId });
};

export const createInvoice = async (invoice: any): Promise<number> => {
  return await invoke("create_invoice", { invoice });
};

export const updateInvoice = async (id: number, invoice: any) => {
  return await invoke("update_invoice", { id, ...invoice });
};

export const deleteInvoice = async (id: number) => {
  return await invoke("delete_invoice", { id });
};

// ================== INVOICE ITEMS ==================

export const getInvoiceItems = async (
  invoice_id: number
): Promise<InvoiceItem[]> => {
  return await invoke("get_invoice_items", { invoiceId: invoice_id });
};

export const createInvoiceItem = async (item: any): Promise<InvoiceItem> => {
  return await invoke("create_invoice_item", { item });
};

export const deleteByInvoiceId = async (invoice_id: number) => {
  return await invoke("delete_invoice_items", { invoiceId: invoice_id });
};

// ================== PRODUCTS ==================

export const getProductsGrouped = async (
  searchQuery?: string
): Promise<Product[]> => {
  return await invoke("get_products_grouped", { searchQuery });
};

// ================== PAYMENTS ==================
export const getAllPayments = async (
  searchQuery?: string,
  page?: number,
  pageSize?: number
): Promise<{ data: Payment[]; sum_amount: number }> => {
  return await invoke("get_all_payments", {
    search: searchQuery,
    page,
    pageSize,
  });
};

// export const getPaymentsByCustomerId = async (customerId: number) => {
//   return await invoke("payments:get_by_customer_id", { customerId });
// };

// export const getPaymentsByInvoiceId = async (invoiceId: number) => {
//   return await invoke("payments:get_by_invoice_id", { invoiceId });
// };

export const createPayment = async (payment: any): Promise<Payment> => {
  return await invoke("create_payment", { payment });
};

export const updatePayment = async (id: number, payment: any) => {
  return await invoke("update_payment", { id, ...payment });
};

export const deletePayment = async (id: number) => {
  return await invoke("delete_payment", { id });
};

// ================== DEBTS ==================
export const getAllDebts = async (
  searchQuery?: string,
  haveZero?: boolean
): Promise<Customer[]> => {
  return await invoke("get_all_debts", { searchQuery, haveZero });
};

export const getCustomerDebt = async (customerId: number) => {
  return await invoke("get_customer_debt", { customerId });
};

export const getTransactions = async (
  customerId: number,
  fromDate: string,
  toDate?: string
): Promise<TransactionsReport> => {
  return await invoke("get_transactions", { customerId, fromDate, toDate });
};

// ================== REPORTS ==================
export const getReportSummary = async (): Promise<ReportSummary> => {
  return await invoke("get_report_summary");
};

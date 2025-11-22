// تعريفات الأنواع للعميل
export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  created_at?: string;
  total_debt?: number;
  total_payments?: number;
  total_invoices?: number;
}

// تعريفات الأنواع للفاتورة
export interface Invoice {
  id?: number;
  invoice_number: string;
  customer_id: number;
  customer_name?: string;
  customer_phone?: string;
  date: string;
  total: number;
  status?: "paid" | "unpaid" | "partial";
  paid_amount?: number;
  remaining_amount?: number; // المتبقي
  created_at?: string;
}

// تعريفات الأنواع لبنود الفاتورة
export interface InvoiceItem {
  id?: number;
  invoice_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  total: number;
}

export interface Product {
  id: number;
  name: string;
  unit_price?: number;
  created_at?: string;
}

// تعريفات الأنواع للمدفوعات
export interface Payment {
  id?: number;
  customer_id: number;
  customer_name?: string;
  invoice_id?: number;
  invoice_number?: string;
  amount: number;
  date: string;
  notes?: string;
  created_at?: string;
}

// تعريفات الأنواع للديون
export interface Debt {
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  total_debt: number;
}

// تعريفات الأنواع للديون حسب العميل
export interface CustomerDebt {
  id: number;
  name: string;
  phone: string;
  total_debt: number;
  total_payments: number;
  total_invoices: number;
}

// تعريفات للتقارير
export interface ReportSummary {
  total_invoices: number;
  total_payments: number;
  total_debts: number;
  customer_count: number;
}

// تعريفات الأنواع للمعاملات (الفواتير والمدفوعات)
export interface Transaction {
  record_id: number;
  transaction_type: "invoice" | "payment";
  reference?: string;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  date: string;
  amount: number;
  created_at: string;
}

export interface TransactionsReport {
  data: Transaction[];        // جميع المعاملات (فواتير ومدفوعات)
  total_invoices: number;     // مجموع الفواتير في الفترة
  total_payments: number;     // مجموع المدفوعات في الفترة
  remaining_total: number;    // المتبقي (الفواتير - المدفوعات)
}
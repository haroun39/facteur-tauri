use serde::{Deserialize, Serialize};

//
// ==================== Customer ====================
//
#[derive(Serialize, Deserialize, Debug)]
pub struct Customer {
    pub id: Option<i32>,
    pub name: String,
    pub phone: String,
    pub address: String,
    pub notes: Option<String>,
    pub created_at: Option<String>,
}

//
// ==================== Invoice ====================
//
#[derive(Serialize, Deserialize, Debug)]
pub struct Invoice {
    pub id: Option<i32>,
    pub invoice_number: String,
    pub customer_id: i32,
    pub customer_name: Option<String>,
    pub date: String,
    pub total: f64,
    pub status: Option<String>, // "paid" | "unpaid" | "partial"
    pub paid_amount: Option<f64>,
    pub remaining_amount: Option<f64>,
    pub created_at: Option<String>,
}

//
// ==================== Invoice With Customer ====================
//
#[derive(Serialize, Deserialize, Debug)]
pub struct InvoiceWithCustomer {
    pub id: Option<i32>,
    pub invoice_number: String,
    pub customer_id: i32,
    pub customer_name: Option<String>,
    pub customer_phone: Option<String>,
    pub date: String,
    pub total: f64,
    pub status: Option<String>,
    pub paid_amount: Option<f64>,
    pub remaining_amount: Option<f64>,
    pub created_at: Option<String>,
}

//
// ==================== Invoices Response ====================
//
#[derive(Serialize, Deserialize, Debug)]
pub struct InvoicesResponse {
    pub data: Vec<InvoiceWithCustomer>,
    pub total: f64,
}

//
// ==================== Invoice Item ====================
//
#[derive(Serialize, Deserialize, Debug)]
pub struct InvoiceItem {
    pub id: Option<i32>,
    pub invoice_id: i32,
    pub product_name: String,
    pub unit_price: f64,
    pub quantity: f64,
    pub total: f64,
}

//
// ==================== Product ====================
//
#[derive(Serialize, Deserialize, Debug)]
pub struct Product {
    pub id: Option<i32>,
    pub name: String,
    pub unit_price: Option<f64>,
    pub created_at: Option<String>,
}

//
// ==================== Payment ====================
//
#[derive(Serialize, Deserialize, Debug)]
pub struct Payment {
    pub id: Option<i32>,
    pub customer_id: i32,
    pub customer_name: Option<String>,
    pub invoice_id: Option<i32>,
    pub invoice_number: Option<String>,
    pub amount: f64,
    pub date: String,
    pub notes: Option<String>,
    pub created_at: Option<String>,
}

//
// ==================== Debt ====================
//
#[derive(Serialize, Deserialize, Debug)]
pub struct Debt {
    pub customer_id: i32,
    pub customer_name: String,
    pub customer_phone: String,
    pub total_debt: f64,
}

//
// ==================== Customer Debt ====================
//
#[derive(Serialize, Deserialize, Debug)]
pub struct CustomerDebt {
    pub id: i32,
    pub name: String,
    pub phone: String,
    pub total_debt: f64,
    pub total_payments: f64,
    pub total_invoices: f64,
}

//
// ==================== Report Summary ====================
//
#[derive(Serialize, Deserialize, Debug)]
pub struct ReportSummary {
    pub total_invoices: i32,
    pub total_payments: f64,
    pub total_debts: f64,
    pub customer_count: i32,
}

//
// ==================== Transaction ====================
//
#[derive(Serialize, Deserialize, Debug)]
pub struct Transaction {
    pub record_id: i32,
    pub transaction_type: String,  // "invoice" | "payment"
    pub reference: Option<String>, // invoice_number for invoices, None for payments
    pub customer_id: i32,
    pub customer_name: String,
    pub customer_phone: String,
    pub date: String,
    pub amount: f64,
    pub created_at: String,
}

//
// ==================== Transactions Response ====================
//
#[derive(Serialize, Deserialize, Debug)]
pub struct TransactionsResponse {
    pub data: Vec<Transaction>,
    pub total_invoices: f64,
    pub total_payments: f64,
    pub remaining_total: f64,
}

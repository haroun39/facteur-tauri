pub mod commands;
pub mod db;
pub mod models;
pub use commands::*;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_all_customers,
            get_customer_by_id,
            create_customer,
            update_customer,
            delete_customer,
            // invoices
            get_all_invoices,
            get_invoice_by_id,
            get_invoices_by_customer_id,
            get_invoice_items,
            get_products_grouped,
            create_invoice,
            create_invoice_item,
            delete_invoice_items,
            update_invoice,
            delete_invoice,
            get_invoices,
            // payments
            get_all_payments,
            create_payment,
            update_payment,
            delete_payment,
            // debts
            get_all_debts,
            get_customer_debt,
            get_report_summary,
            get_transactions,
            generate_invoices_pdf,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

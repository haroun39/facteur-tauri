use crate::db::get_db;
use crate::models::{CustomerDebt, ReportSummary, Transaction, TransactionsResponse};
use rusqlite::Result;

#[tauri::command]
pub fn get_all_debts(
    have_zero: Option<bool>,
    search_query: Option<String>,
) -> Result<Vec<CustomerDebt>, String> {
    let conn = get_db().map_err(|e| e.to_string())?;
    let mut where_clauses: Vec<String> = vec![];

    // Filter zero debts if needed
    if have_zero.unwrap_or(false) == false {
        where_clauses.push(
            "(IFNULL(inv.total_invoices, 0) - IFNULL(pay.total_payments, 0)) <> 0".to_string(),
        );
    }

    // Search by name, phone, notes
    let has_search = search_query.is_some();
    if has_search {
        where_clauses.push("(c.name LIKE ?1 OR c.phone LIKE ?2 OR c.notes LIKE ?3)".to_string());
    }

    let where_sql = if !where_clauses.is_empty() {
        format!("WHERE {}", where_clauses.join(" AND "))
    } else {
        "".to_string()
    };

    let sql = format!(
        r#"
        SELECT
            c.id,
            c.name,
            c.phone,
            IFNULL(inv.total_invoices, 0) AS total_invoices,
            IFNULL(pay.total_payments, 0) AS total_payments,
            (IFNULL(inv.total_invoices, 0) - IFNULL(pay.total_payments, 0)) AS total_debt
        FROM customers c
        LEFT JOIN (
            SELECT customer_id, SUM(total) AS total_invoices
            FROM invoices
            GROUP BY customer_id
        ) AS inv ON inv.customer_id = c.id
        LEFT JOIN (
            SELECT customer_id, SUM(amount) AS total_payments
            FROM payments
            GROUP BY customer_id
        ) AS pay ON pay.customer_id = c.id
        {}
        ORDER BY total_debt DESC
        "#,
        where_sql
    );

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;

    let debts: Vec<CustomerDebt> = if let Some(search) = search_query {
        let s = format!("%{}%", search);
        let rows = stmt
            .query_map(rusqlite::params![s.clone(), s.clone(), s], |row| {
                Ok(CustomerDebt {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    phone: row.get(2)?,
                    total_invoices: row.get(3)?,
                    total_payments: row.get(4)?,
                    total_debt: row.get(5)?,
                })
            })
            .map_err(|e| e.to_string())?;
        rows.filter_map(|x| x.ok()).collect()
    } else {
        let rows = stmt
            .query_map([], |row| {
                Ok(CustomerDebt {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    phone: row.get(2)?,
                    total_invoices: row.get(3)?,
                    total_payments: row.get(4)?,
                    total_debt: row.get(5)?,
                })
            })
            .map_err(|e| e.to_string())?;
        rows.filter_map(|x| x.ok()).collect()
    };

    Ok(debts)
}

#[tauri::command]
pub fn get_customer_debt(customer_id: i32) -> Result<f64, String> {
    let conn = get_db().map_err(|e| e.to_string())?;

    let sql = r#"
        SELECT 
            SUM(CASE 
                WHEN status = 'unpaid' THEN total
                WHEN status = 'partial' THEN total - COALESCE(paid_amount, 0)
                ELSE 0
            END) AS debt
        FROM invoices
        WHERE customer_id = ?
    "#;

    let debt: f64 = conn
        .query_row(sql, [customer_id], |row| row.get(0))
        .unwrap_or(0.0);

    Ok(debt)
}

#[tauri::command]
pub fn get_report_summary() -> Result<ReportSummary, String> {
    let conn = get_db().map_err(|e| e.to_string())?;

    let total_invoices: f64 = conn
        .query_row("SELECT SUM(total) FROM invoices", [], |row| row.get(0))
        .unwrap_or(0.0);

    let total_payments: f64 = conn
        .query_row("SELECT SUM(amount) FROM payments", [], |row| row.get(0))
        .unwrap_or(0.0);

    let total_debts = total_invoices - total_payments;

    let customer_count: i32 = conn
        .query_row("SELECT COUNT(*) FROM customers", [], |row| row.get(0))
        .unwrap_or(0);

    Ok(ReportSummary {
        total_invoices: total_invoices as i32,
        total_payments: total_payments,
        total_debts: total_debts,
        customer_count: customer_count,
    })
}

#[tauri::command]
pub fn get_transactions(
    customer_id: i32,
    from_date: String,
    to_date: Option<String>,
) -> Result<TransactionsResponse, String> {
    let conn = get_db().map_err(|e| e.to_string())?;

    let end_date = to_date.clone().unwrap_or_else(|| "9999-12-31".to_string());

    let date_condition_invoice = if to_date.is_some() {
        "AND i.date BETWEEN ?2 AND ?3"
    } else {
        "AND i.date >= ?2"
    };

    let date_condition_payment = if to_date.is_some() {
        "AND p.date BETWEEN ?2 AND ?3"
    } else {
        "AND p.date >= ?2"
    };

    // Get transactions
    let sql = format!(
        r#"
        SELECT 
            i.id AS record_id,
            'invoice' AS type,
            i.invoice_number AS reference,
            i.customer_id,
            c.name AS customer_name,
            c.phone AS customer_phone,
            i.date,
            i.total AS amount,
            i.created_at
        FROM invoices i
        JOIN customers c ON i.customer_id = c.id
        WHERE i.customer_id = ?1
          {}

        UNION ALL

        SELECT
            p.id AS record_id,
            'payment' AS type,
            NULL AS reference,
            p.customer_id,
            c.name AS customer_name,
            c.phone AS customer_phone,
            p.date,
            p.amount,
            p.created_at
        FROM payments p
        JOIN customers c ON p.customer_id = c.id
        WHERE p.customer_id = ?1
          {}

        ORDER BY date ASC
        "#,
        date_condition_invoice, date_condition_payment
    );

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;

    let transactions: Vec<Transaction> = if to_date.is_some() {
        let rows = stmt
            .query_map(rusqlite::params![customer_id, &from_date, &end_date], |row| {
                Ok(Transaction {
                    record_id: row.get(0)?,
                    transaction_type: row.get(1)?,
                    reference: row.get(2)?,
                    customer_id: row.get(3)?,
                    customer_name: row.get(4)?,
                    customer_phone: row.get(5)?,
                    date: row.get(6)?,
                    amount: row.get(7)?,
                    created_at: row.get(8)?,
                })
            })
            .map_err(|e| e.to_string())?;
        rows.filter_map(|x| x.ok()).collect()
    } else {
        let rows = stmt
            .query_map(rusqlite::params![customer_id, &from_date], |row| {
                Ok(Transaction {
                    record_id: row.get(0)?,
                    transaction_type: row.get(1)?,
                    reference: row.get(2)?,
                    customer_id: row.get(3)?,
                    customer_name: row.get(4)?,
                    customer_phone: row.get(5)?,
                    date: row.get(6)?,
                    amount: row.get(7)?,
                    created_at: row.get(8)?,
                })
            })
            .map_err(|e| e.to_string())?;
        rows.filter_map(|x| x.ok()).collect()
    };

    // Get summary
    let summary_sql = if to_date.is_some() {
        r#"
        SELECT
            IFNULL((SELECT SUM(total) FROM invoices WHERE customer_id = ?1 AND date BETWEEN ?2 AND ?3), 0) AS total_invoices,
            IFNULL((SELECT SUM(amount) FROM payments WHERE customer_id = ?1 AND date BETWEEN ?2 AND ?3), 0) AS total_payments
        "#
    } else {
        r#"
        SELECT
            IFNULL((SELECT SUM(total) FROM invoices WHERE customer_id = ?1 AND date >= ?2), 0) AS total_invoices,
            IFNULL((SELECT SUM(amount) FROM payments WHERE customer_id = ?1 AND date >= ?2), 0) AS total_payments
        "#
    };

    let (total_invoices, total_payments): (f64, f64) = if to_date.is_some() {
        conn.query_row(
            summary_sql,
            rusqlite::params![customer_id, &from_date, &end_date],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .unwrap_or((0.0, 0.0))
    } else {
        conn.query_row(
            summary_sql,
            rusqlite::params![customer_id, &from_date],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .unwrap_or((0.0, 0.0))
    };

    let remaining_total = total_invoices - total_payments;

    Ok(TransactionsResponse {
        data: transactions,
        total_invoices,
        total_payments,
        remaining_total,
    })
}

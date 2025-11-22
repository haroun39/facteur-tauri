use crate::db::get_db;
use crate::models::Payment;
use rusqlite::{params, Result};
use serde::Serialize;
// ===================== MODELS =====================

#[derive(Serialize)]
pub struct PaymentsResult {
    pub data: Vec<Payment>,
    pub sum_amount: f64,
}

// ===================== GET ALL PAYMENTS =====================

#[tauri::command]
pub fn get_all_payments(
    search: Option<String>,
    page: Option<i64>,
    page_size: Option<i64>,
) -> Result<PaymentsResult, String> {
    let db = get_db().map_err(|e| e.to_string())?;

    let mut where_sql = String::new();
    let mut params_vec: Vec<String> = vec![];

    if let Some(q) = search {
        let like = format!("%{}%", q);
        where_sql = "WHERE c.name LIKE ?1 OR i.invoice_number LIKE ?1 OR p.date LIKE ?1".into();
        params_vec.push(like);
    }

    // SUM
    let sum_sql = format!(
        "
        SELECT SUM(p.amount)
        FROM payments p
        LEFT JOIN customers c ON p.customer_id = c.id
        LEFT JOIN invoices i ON p.invoice_id = i.id
        {}
    ",
        where_sql
    );

    let sum_amount: f64 = if params_vec.is_empty() {
        db.prepare(&sum_sql)
            .map_err(|e| e.to_string())?
            .query_row([], |row| row.get(0))
            .unwrap_or(0.0)
    } else {
        db.prepare(&sum_sql)
            .map_err(|e| e.to_string())?
            .query_row(params![&params_vec[0]], |row| row.get(0))
            .unwrap_or(0.0)
    };

    // PAGINATION
    let offset = (page.unwrap_or(1) - 1) * page_size.unwrap_or(10);
    let limit = page_size.unwrap_or(10);

    let sql = format!(
        "
        SELECT 
          p.id, p.customer_id, p.invoice_id, p.amount, p.date, p.notes, p.created_at,
          c.name AS customer_name,
          i.invoice_number
        FROM payments p
        LEFT JOIN customers c ON p.customer_id = c.id
        LEFT JOIN invoices i ON p.invoice_id = i.id
        {}
        ORDER BY p.created_at DESC
        LIMIT {} OFFSET {}
    ",
        where_sql, limit, offset
    );

    let mut stmt = db.prepare(&sql).map_err(|e| e.to_string())?;

    let rows = if params_vec.is_empty() {
        stmt.query_map([], |r| {
            Ok(Payment {
                id: r.get(0)?,
                customer_id: r.get(1)?,
                invoice_id: r.get(2)?,
                amount: r.get(3)?,
                date: r.get(4)?,
                notes: r.get(5)?,
                created_at: r.get(6)?,
                customer_name: r.get(7)?,
                invoice_number: r.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|x| x.ok())
        .collect::<Vec<_>>()
    } else {
        stmt.query_map(params![&params_vec[0]], |r| {
            Ok(Payment {
                id: r.get(0)?,
                customer_id: r.get(1)?,
                invoice_id: r.get(2)?,
                amount: r.get(3)?,
                date: r.get(4)?,
                notes: r.get(5)?,
                created_at: r.get(6)?,
                customer_name: r.get(7)?,
                invoice_number: r.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|x| x.ok())
        .collect::<Vec<_>>()
    };

    Ok(PaymentsResult {
        data: rows,
        sum_amount: sum_amount,
    })
}

// ===================== CREATE PAYMENT =====================

#[tauri::command]
pub fn create_payment(payment: Payment) -> Result<Payment, String> {
    let db = get_db().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    db.execute(
        "
        INSERT INTO payments (customer_id, invoice_id, amount, date, notes, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        ",
        params![
            payment.customer_id,
            payment.invoice_id,
            payment.amount,
            payment.date,
            payment.notes,
            now
        ],
    )
    .map_err(|e| e.to_string())?;

    let id = db.last_insert_rowid();

    Ok(Payment {
        id: Some(id.try_into().unwrap()),
        created_at: Some(now),
        ..payment
    })
}

// ===================== UPDATE PAYMENT =====================

#[tauri::command]
pub fn update_payment(id: i64, p: Payment) -> Result<(), String> {
    let db = get_db().map_err(|e| e.to_string())?;

    db.execute(
        "
        UPDATE payments SET
          customer_id = ?1,
          invoice_id = ?2,
          amount = ?3,
          date = ?4,
          notes = ?5
        WHERE id = ?6
        ",
        params![p.customer_id, p.invoice_id, p.amount, p.date, p.notes, id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

// ===================== DELETE PAYMENT =====================

#[tauri::command]
pub fn delete_payment(id: i64) -> Result<(), String> {
    let db = get_db().map_err(|e| e.to_string())?;
    db.execute("DELETE FROM payments WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

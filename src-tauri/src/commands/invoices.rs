use rusqlite::{params, OptionalExtension, Result};

use crate::db::get_db;
use crate::models::{Invoice, InvoiceItem, InvoiceWithCustomer, InvoicesResponse, Product};

//
// ==================== Commands ====================
//

#[tauri::command]
pub fn get_all_invoices(
    search_query: Option<String>,
    page: Option<i32>,
    page_size: Option<i32>,
) -> Result<InvoicesResponse, String> {
    let conn = get_db().map_err(|e| e.to_string())?;

    // Build WHERE clause and params
    let mut where_clause = String::new();

    if search_query.is_some() {
        where_clause =
            "WHERE i.invoice_number LIKE ?1 OR c.name LIKE ?2 OR i.date LIKE ?3".to_string();
    }

    // 1) SUM total (no LIMIT/OFFSET)
    let sum_sql = format!(
        "SELECT IFNULL(SUM(i.total), 0) as sumTotal FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id {}",
        where_clause
    );

    let sum_total: f64 = if let Some(ref s) = search_query {
        let s1 = format!("%{}%", s);
        let s2 = format!("%{}%", s);
        let s3 = format!("{}%", s);
        conn.query_row(&sum_sql, params![s1, s2, s3], |row| row.get::<_, f64>(0))
            .map_err(|e| e.to_string())?
    } else {
        conn.query_row(&sum_sql, params![], |row| row.get::<_, f64>(0))
            .map_err(|e| e.to_string())?
    };

    // 2) Paginated query
    let mut sql = format!(
        "SELECT i.id, i.invoice_number, i.customer_id, i.date, i.total, i.status, i.paid_amount, i.created_at, c.name as customer_name, c.phone as customer_phone
         FROM invoices i
         LEFT JOIN customers c ON i.customer_id = c.id
         {}
         ORDER BY i.created_at DESC",
        where_clause
    );

    let mut invoices: Vec<InvoiceWithCustomer> = Vec::new();

    // Decide pagination
    if let (Some(p), Some(size)) = (page, page_size) {
        let offset = (p - 1) * size;
        if let Some(ref s) = search_query {
            sql.push_str(" LIMIT ?4 OFFSET ?5");
            let s1 = format!("%{}%", s);
            let s2 = format!("%{}%", s);
            let s3 = format!("{}%", s);
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let rows = stmt
                .query_map(params![s1, s2, s3, size, offset], |row| {
                    Ok(InvoiceWithCustomer {
                        id: row.get(0)?,
                        invoice_number: row.get(1)?,
                        customer_id: row.get(2)?,
                        customer_name: row.get(8)?,
                        customer_phone: row.get(9)?,
                        date: row.get(3)?,
                        total: row.get(4)?,
                        status: row.get::<_, Option<String>>(5)?,
                        paid_amount: row.get::<_, Option<f64>>(6)?,
                        remaining_amount: None,
                        created_at: row.get::<_, Option<String>>(7)?,
                    })
                })
                .map_err(|e| e.to_string())?;

            for r in rows {
                if let Ok(inv) = r {
                    invoices.push(inv);
                }
            }
        } else {
            sql.push_str(" LIMIT ?1 OFFSET ?2");
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let rows = stmt
                .query_map(params![size, offset], |row| {
                    Ok(InvoiceWithCustomer {
                        id: row.get(0)?,
                        invoice_number: row.get(1)?,
                        customer_id: row.get(2)?,
                        customer_name: row.get(8)?,
                        customer_phone: row.get(9)?,
                        date: row.get(3)?,
                        total: row.get(4)?,
                        status: row.get::<_, Option<String>>(5)?,
                        paid_amount: row.get::<_, Option<f64>>(6)?,
                        remaining_amount: None,
                        created_at: row.get::<_, Option<String>>(7)?,
                    })
                })
                .map_err(|e| e.to_string())?;

            for r in rows {
                if let Ok(inv) = r {
                    invoices.push(inv);
                }
            }
        }
    } else {
        // no pagination
        if let Some(ref s) = search_query {
            let s1 = format!("%{}%", s);
            let s2 = format!("%{}%", s);
            let s3 = format!("{}%", s);
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let rows = stmt
                .query_map(params![s1, s2, s3], |row| {
                    Ok(InvoiceWithCustomer {
                        id: row.get(0)?,
                        invoice_number: row.get(1)?,
                        customer_id: row.get(2)?,
                        customer_name: row.get(8)?,
                        customer_phone: row.get(9)?,
                        date: row.get(3)?,
                        total: row.get(4)?,
                        status: row.get::<_, Option<String>>(5)?,
                        paid_amount: row.get::<_, Option<f64>>(6)?,
                        remaining_amount: None,
                        created_at: row.get::<_, Option<String>>(7)?,
                    })
                })
                .map_err(|e| e.to_string())?;

            for r in rows {
                if let Ok(inv) = r {
                    invoices.push(inv);
                }
            }
        } else {
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let rows = stmt
                .query_map([], |row| {
                    Ok(InvoiceWithCustomer {
                        id: row.get(0)?,
                        invoice_number: row.get(1)?,
                        customer_id: row.get(2)?,
                        customer_name: row.get(8)?,
                        customer_phone: row.get(9)?,
                        date: row.get(3)?,
                        total: row.get(4)?,
                        status: row.get::<_, Option<String>>(5)?,
                        paid_amount: row.get::<_, Option<f64>>(6)?,
                        remaining_amount: None,
                        created_at: row.get::<_, Option<String>>(7)?,
                    })
                })
                .map_err(|e| e.to_string())?;

            for r in rows {
                if let Ok(inv) = r {
                    invoices.push(inv);
                }
            }
        }
    }

    // compute remainingAmount for each invoice using paidAmount
    let invoices = invoices
        .into_iter()
        .map(|mut inv| {
            let paid = inv.paid_amount.unwrap_or(0.0);
            inv.remaining_amount = Some(inv.total - paid);
            inv
        })
        .collect();

    Ok(InvoicesResponse {
        data: invoices,
        total: sum_total,
    })
}

#[tauri::command]
pub fn get_invoice_by_id(id: i32) -> Result<Option<Invoice>, String> {
    let conn = get_db().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, invoice_number, customer_id, date, total, status, paid_amount, created_at FROM invoices WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let res = stmt
        .query_row(params![id], |row| {
            Ok(Invoice {
                id: row.get(0)?,
                invoice_number: row.get(1)?,
                customer_id: row.get(2)?,
                customer_name: None,
                date: row.get(3)?,
                total: row.get(4)?,
                status: row.get::<_, Option<String>>(5)?,
                paid_amount: row.get::<_, Option<f64>>(6)?,
                remaining_amount: None,
                created_at: row.get::<_, Option<String>>(7)?,
            })
        })
        .optional()
        .map_err(|e| e.to_string())?;

    Ok(res)
}

#[tauri::command]
pub fn get_invoices_by_customer_id(customer_id: i32) -> Result<Vec<Invoice>, String> {
    let conn = get_db().map_err(|e| e.to_string())?;

    let sql = r#"
    SELECT
      i.id,
      i.invoice_number,
      i.date,
      i.total,
      IFNULL(p.paid, 0) AS paid_amount,
      (i.total - IFNULL(p.paid, 0)) AS remaining_amount,
      i.customer_id,
      i.status,
      i.paid_amount,
      i.created_at
    FROM invoices i
    LEFT JOIN (
      SELECT invoice_id, SUM(amount) AS paid
      FROM payments
      WHERE invoice_id IS NOT NULL
      GROUP BY invoice_id
    ) p ON p.invoice_id = i.id
    WHERE i.customer_id = ?
    ORDER BY i.date DESC;
    "#;

    let mut stmt = conn.prepare(sql).map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(params![customer_id], |row| {
            Ok(Invoice {
                id: row.get(0)?,
                invoice_number: row.get(1)?,
                customer_id: row.get::<_, Option<i32>>(6)?.unwrap_or(customer_id),
                customer_name: None,
                date: row.get(2)?,
                total: row.get(3)?,
                status: row.get::<_, Option<String>>(7)?,
                paid_amount: row.get::<_, Option<f64>>(4)?,
                remaining_amount: row.get::<_, Option<f64>>(5)?,
                created_at: row.get::<_, Option<String>>(9)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut vec = Vec::new();
    for r in rows {
        if let Ok(item) = r {
            vec.push(item);
        }
    }
    Ok(vec)
}

#[tauri::command]
pub fn get_invoice_items(invoiceId: i32) -> Result<Vec<InvoiceItem>, String> {
    let conn = get_db().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, invoice_id, product_name, unit_price, quantity, total FROM invoice_items WHERE invoice_id = ?")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(params![invoiceId], |row| {
            Ok(InvoiceItem {
                id: row.get(0)?,
                invoice_id: row.get(1)?,
                product_name: row.get(2)?,
                unit_price: row.get(3)?,
                quantity: row.get(4)?,
                total: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut vec = Vec::new();
    for r in rows {
        if let Ok(item) = r {
            vec.push(item);
        }
    }
    Ok(vec)
}

#[tauri::command]
pub fn get_products_grouped(search_query: Option<String>) -> Result<Vec<Product>, String> {
    let conn = get_db().map_err(|e| e.to_string())?;

    let mut sql = "SELECT MIN(id) AS id, product_name AS name FROM invoice_items".to_string();

    if let Some(ref s) = search_query {
        sql.push_str(" WHERE product_name LIKE ?1");
        sql.push_str(" GROUP BY product_name ORDER BY name");
        let pattern = format!("%{}%", s);
        let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map(params![pattern], |row| {
                Ok(Product {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    unit_price: None,
                    created_at: None,
                })
            })
            .map_err(|e| e.to_string())?;

        let mut vec = Vec::new();
        for r in rows {
            if let Ok(item) = r {
                vec.push(item);
            }
        }
        return Ok(vec);
    } else {
        sql.push_str(" GROUP BY product_name ORDER BY name");
        let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| {
                Ok(Product {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    unit_price: None,
                    created_at: None,
                })
            })
            .map_err(|e| e.to_string())?;

        let mut vec = Vec::new();
        for r in rows {
            if let Ok(item) = r {
                vec.push(item);
            }
        }
        return Ok(vec);
    }
}

#[tauri::command]
pub fn create_invoice(invoice: Invoice) -> Result<i32, String> {
    let conn = get_db().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO invoices (invoice_number, customer_id, date, total, status, paid_amount) VALUES (?, ?, ?, ?, ?, ?)",
        params![
            invoice.invoice_number,
            invoice.customer_id,
            invoice.date,
            invoice.total,
            invoice.status.unwrap_or("unpaid".to_string()),
            invoice.paid_amount.unwrap_or(0.0)
        ],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid() as i32;
    Ok(id)
}

#[tauri::command]
pub fn create_invoice_item(item: InvoiceItem) -> Result<InvoiceItem, String> {
    let conn = get_db().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO invoice_items (invoice_id, product_name, unit_price, quantity, total) VALUES (?, ?, ?, ?, ?)",
        params![item.invoice_id, item.product_name, item.unit_price, item.quantity, item.total],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid() as i32;
    Ok(InvoiceItem {
        id: Some(id),
        invoice_id: item.invoice_id,
        product_name: item.product_name,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total: item.total,
    })
}

#[tauri::command]
pub fn delete_invoice_items(invoiceId: i32) -> Result<(), String> {
    let conn = get_db().map_err(|e| e.to_string())?;
    conn.execute(
        "DELETE FROM invoice_items WHERE invoice_id = ?",
        params![invoiceId],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn update_invoice(
    id: i32,
    invoice_number: Option<String>,
    customer_id: Option<i32>,
    date: Option<String>,
    total: Option<f64>,
    status: Option<String>,
    paid_amount: Option<f64>,
) -> Result<(), String> {
    let conn = get_db().map_err(|e| e.to_string())?;

    let mut fields: Vec<String> = vec![];
    let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![];

    if let Some(v) = invoice_number {
        fields.push("invoice_number = ?".to_string());
        params_vec.push(Box::new(v));
    }
    if let Some(v) = customer_id {
        fields.push("customer_id = ?".to_string());
        params_vec.push(Box::new(v));
    }
    if let Some(v) = date {
        fields.push("date = ?".to_string());
        params_vec.push(Box::new(v));
    }
    if let Some(v) = total {
        fields.push("total = ?".to_string());
        params_vec.push(Box::new(v));
    }
    if let Some(v) = status {
        fields.push("status = ?".to_string());
        params_vec.push(Box::new(v));
    }
    if let Some(v) = paid_amount {
        fields.push("paid_amount = ?".to_string());
        params_vec.push(Box::new(v));
    }

    if fields.is_empty() {
        return Ok(());
    }

    let sql = format!("UPDATE invoices SET {} WHERE id = ?", fields.join(", "));
    // append id param
    params_vec.push(Box::new(id));

    // convert to slice of &dyn ToSql
    let params_refs: Vec<&dyn rusqlite::ToSql> = params_vec
        .iter()
        .map(|b| &**b as &dyn rusqlite::ToSql)
        .collect();

    conn.execute(&sql, params_refs.as_slice())
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_invoice(id: i32) -> Result<(), String> {
    let conn = get_db().map_err(|e| e.to_string())?;

    // Delete invoice items first due to foreign key constraint
    conn.execute(
        "DELETE FROM invoice_items WHERE invoice_id = ?",
        params![id],
    )
    .map_err(|e| e.to_string())?;

    // Then delete the invoice
    conn.execute("DELETE FROM invoices WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

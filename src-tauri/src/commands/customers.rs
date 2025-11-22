use crate::db::get_db;
use rusqlite::{params, Result, OptionalExtension};
use crate::models::{Customer};


#[tauri::command]
pub fn get_all_customers(
    search_query: Option<String>,
    page: Option<i32>,
    page_size: Option<i32>,
) -> Result<Vec<Customer>, String> {
    let conn = get_db().map_err(|e| e.to_string())?;

    let mut sql = "SELECT id, name, phone, address, notes, createdAt FROM customers".to_string();

    let customers = if let Some(search) = search_query {
        let s = format!("%{}%", search);
        sql += " WHERE name LIKE ?1 OR phone LIKE ?2 OR address LIKE ?3 OR notes LIKE ?4";
        sql += " ORDER BY createdAt DESC";

        if let (Some(page), Some(size)) = (page, page_size) {
            sql += " LIMIT ?5 OFFSET ?6";
            let offset = (page - 1) * size;
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let rows = stmt
                .query_map(params![s.clone(), s.clone(), s.clone(), s, size, offset], |row| {
                    Ok(Customer {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        phone: row.get(2)?,
                        address: row.get(3)?,
                        notes: row.get(4)?,
                        created_at: row.get(5)?,
                    })
                })
                .map_err(|e| e.to_string())?;
            rows.filter_map(|x| x.ok()).collect()
        } else {
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let rows = stmt
                .query_map(params![s.clone(), s.clone(), s.clone(), s], |row| {
                    Ok(Customer {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        phone: row.get(2)?,
                        address: row.get(3)?,
                        notes: row.get(4)?,
                        created_at: row.get(5)?,
                    })
                })
                .map_err(|e| e.to_string())?;
            rows.filter_map(|x| x.ok()).collect()
        }
    } else {
        sql += " ORDER BY createdAt DESC";

        if let (Some(page), Some(size)) = (page, page_size) {
            sql += " LIMIT ?1 OFFSET ?2";
            let offset = (page - 1) * size;
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let rows = stmt
                .query_map(params![size, offset], |row| {
                    Ok(Customer {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        phone: row.get(2)?,
                        address: row.get(3)?,
                        notes: row.get(4)?,
                        created_at: row.get(5)?,
                    })
                })
                .map_err(|e| e.to_string())?;
            rows.filter_map(|x| x.ok()).collect()
        } else {
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let rows = stmt
                .query_map([], |row| {
                    Ok(Customer {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        phone: row.get(2)?,
                        address: row.get(3)?,
                        notes: row.get(4)?,
                        created_at: row.get(5)?,
                    })
                })
                .map_err(|e| e.to_string())?;
            rows.filter_map(|x| x.ok()).collect()
        }
    };

    Ok(customers)
}

#[tauri::command]
pub fn get_customer_by_id(id: i32) -> Result<Option<Customer>, String> {
    let conn = get_db().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, name, phone, address, notes, createdAt FROM customers WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let result = stmt
        .query_row([id], |row| {
            Ok(Customer {
                id: row.get(0)?,
                name: row.get(1)?,
                phone: row.get(2)?,
                address: row.get(3)?,
                notes: row.get(4)?,
                created_at: row.get(5)?,
            })
        })
        .optional()
        .map_err(|e| e.to_string())?;

    Ok(result)
}

#[tauri::command]
pub fn create_customer(
    name: String,
    phone: String,
    address: String,
    notes: Option<String>,
) -> Result<Customer, String> {
    let conn = get_db().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO customers (name, phone, address, notes) VALUES (?, ?, ?, ?)",
        params![name, phone, address, notes],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid() as i32;

    Ok(Customer {
        id: Some(id),
        name,
        phone,
        address,
        notes,
        created_at: Some(chrono::Utc::now().to_rfc3339()),
    })
}

#[tauri::command]
pub fn update_customer(
    id: i32,
    name: Option<String>,
    phone: Option<String>,
    address: Option<String>,
    notes: Option<String>,
) -> Result<(), String> {
    let conn = get_db().map_err(|e| e.to_string())?;

    let mut fields = vec![];
    let mut updates = vec![];

    if let Some(v) = name {
        fields.push("name = ?");
        updates.push(v);
    }
    if let Some(v) = phone {
        fields.push("phone = ?");
        updates.push(v);
    }
    if let Some(v) = address {
        fields.push("address = ?");
        updates.push(v);
    }
    if let Some(v) = notes {
        fields.push("notes = ?");
        updates.push(v);
    }

    if fields.is_empty() {
        return Ok(());
    }

    let sql = format!("UPDATE customers SET {} WHERE id = ?", fields.join(", "));

    // Convert to references for rusqlite
    let params_refs: Vec<&dyn rusqlite::ToSql> = updates.iter().map(|x| x as &dyn rusqlite::ToSql).collect();
    let mut all_params = params_refs;
    all_params.push(&id);

    conn.execute(&sql, all_params.as_slice())
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_customer(id: i32) -> Result<(), String> {
    let conn = get_db().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM customers WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

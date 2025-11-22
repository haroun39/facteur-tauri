use rusqlite::{Connection, Result};
use std::path::PathBuf;

fn get_db_path() -> PathBuf {
    // Use a data directory outside src-tauri to avoid triggering rebuilds
    let data_dir = if cfg!(debug_assertions) {
        // In development, use a directory outside src-tauri
        PathBuf::from("..").join("data")
    } else {
        // In production, use system app data directory
        dirs::data_local_dir()
            .map(|p| p.join("tauri-app"))
            .unwrap_or_else(|| PathBuf::from("data"))
    };

    // Create directory if it doesn't exist
    std::fs::create_dir_all(&data_dir).ok();

    data_dir.join("app.db")
}

pub fn get_db() -> Result<Connection> {
    let db_path = get_db_path();
    let conn = Connection::open(db_path)?;

    // Run migrations
    conn.execute_batch(include_str!("migrations/init.sql"))?;

    Ok(conn)
}

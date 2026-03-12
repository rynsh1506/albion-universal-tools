use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RecipeMaterial {
    pub id: String,
    pub name: String,
    pub qty: i32,
    pub is_returnable: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DbItem {
    pub display_name: String,
    pub id: String,
    pub tier: i32,
    pub item_value: f64,
    pub out_qty: i32,
    pub recipe: Vec<RecipeMaterial>,
}

pub fn get_db_path(handle: &AppHandle) -> PathBuf {
    let mut path = handle.path().app_data_dir().expect("Gagal dapet data dir");
    std::fs::create_dir_all(&path).expect("Gagal bikin folder data dir");
    path.push("albion_data.db");
    path
}

pub fn initialize_db(handle: &AppHandle) -> Result<()> {
    let conn = Connection::open(get_db_path(handle))?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS items (
            display_name TEXT PRIMARY KEY,
            id TEXT,
            tier INTEGER,
            item_value REAL,
            out_qty INTEGER,
            recipe_json TEXT
        )",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_name ON items(display_name)",
        [],
    )?;
    Ok(())
}

pub fn save_items_to_db(handle: &AppHandle, items: Vec<DbItem>) -> Result<()> {
    let mut conn = Connection::open(get_db_path(handle))?;
    let tx = conn.transaction()?;

    tx.execute("DELETE FROM items", [])?;

    let mut stmt = tx.prepare("INSERT INTO items (display_name, id, tier, item_value, out_qty, recipe_json) VALUES (?, ?, ?, ?, ?, ?)")?;

    for item in items {
        let recipe_str = serde_json::to_string(&item.recipe).unwrap_or_else(|_| "[]".to_string());
        stmt.execute(params![
            item.display_name,
            item.id,
            item.tier,
            item.item_value,
            item.out_qty,
            recipe_str
        ])?;
    }
    drop(stmt);
    tx.commit()?;
    Ok(())
}

pub fn search_items_db(
    handle: &AppHandle,
    query: &str,
    tier: &str,
    enchant: &str,
) -> Result<Vec<DbItem>> {
    let conn = Connection::open(get_db_path(handle))?;

    let mut sql = String::from(
        "SELECT display_name, id, tier, item_value, out_qty, recipe_json FROM items WHERE 1=1",
    );
    let mut params_vec: Vec<String> = Vec::new();

    if !query.trim().is_empty() {
        sql.push_str(" AND display_name LIKE ?");
        params_vec.push(format!("%{}%", query));
    }

    if !tier.trim().is_empty() && tier != "All" {
        sql.push_str(&format!(" AND tier = {}", tier.replace("T", "")));
    }

    if !enchant.trim().is_empty() && enchant != "All" {
        let e_num = enchant.replace(".", "");
        if e_num == "0" {
            sql.push_str(" AND id NOT LIKE '%@%' AND id NOT LIKE '%_LEVEL%'");
        } else {
            sql.push_str(" AND (id LIKE ? OR id LIKE ?)");
            params_vec.push(format!("%@{}%", e_num));
            params_vec.push(format!("%_LEVEL{}%", e_num));
        }
    }

    sql.push_str(" ORDER BY display_name ASC LIMIT 150");

    let mut stmt = conn.prepare(&sql)?;

    let iter_params: Vec<&dyn rusqlite::ToSql> = params_vec
        .iter()
        .map(|s| s as &dyn rusqlite::ToSql)
        .collect();

    let item_iter = stmt.query_map(&*iter_params, |row| {
        let recipe_str: String = row.get(5)?;
        let recipe: Vec<RecipeMaterial> = serde_json::from_str(&recipe_str).unwrap_or_default();

        Ok(DbItem {
            display_name: row.get(0)?,
            id: row.get(1)?,
            tier: row.get(2)?,
            item_value: row.get(3)?,
            out_qty: row.get(4)?,
            recipe,
        })
    })?;

    let mut results = Vec::new();
    for item in item_iter {
        results.push(item?);
    }

    Ok(results)
}

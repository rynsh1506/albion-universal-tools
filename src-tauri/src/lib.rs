// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod api;
mod db;
mod logic;
mod models;

use db::{initialize_db, search_items_db, DbItem};

use crate::models::{CraftingRequest, CraftingResponse};

#[tauri::command]
fn calculate_crafting(request: CraftingRequest) -> Result<CraftingResponse, String> {
    let hasil = logic::calculate(request);
    Ok(hasil)
}

#[tauri::command]
fn search_items(
    handle: tauri::AppHandle,
    query: String,
    tier: String,
    enchant: String,
) -> Result<Vec<DbItem>, String> {
    search_items_db(&handle, &query, &tier, &enchant).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_image_dir_path(handle: tauri::AppHandle) -> String {
    let path = api::get_img_dir(&handle);
    path.to_string_lossy().to_string()
}

#[tauri::command]
async fn sync_database(window: tauri::Window, handle: tauri::AppHandle) -> Result<String, String> {
    api::download_and_build_db(window, handle).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle();
            // Inisialisasi DB sekarang jalan di Android juga
            if let Err(e) = initialize_db(handle) {
                eprintln!("Gagal inisialisasi DB: {}", e);
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            search_items,
            sync_database,
            get_image_dir_path,
            calculate_crafting,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

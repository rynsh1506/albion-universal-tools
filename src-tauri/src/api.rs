use crate::db::{save_items_to_db, DbItem, RecipeMaterial};
use futures::stream::{self, StreamExt};
use serde_json::Value;
use std::collections::HashMap;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter, Manager, Window};
use tokio::fs;
use tokio::io::AsyncWriteExt;

fn clean_albion_name(text: &str) -> String {
    let prefixes = [
        "Beginner's ",
        "Novice's ",
        "Journeyman's ",
        "Adept's ",
        "Adept ",
        "Expert's ",
        "Master's ",
        "Grandmaster's ",
        "Elder's ",
    ];
    let mut cleaned = text.to_string();
    for p in prefixes {
        if cleaned.starts_with(p) {
            cleaned = cleaned.replacen(p, "", 1);
            break;
        }
    }
    cleaned
}

fn extract_iv(val: &Value, id_to_iv: &mut HashMap<String, f64>) {
    match val {
        Value::Object(map) => {
            let uid = map
                .get("@uniquename")
                .or_else(|| map.get("uniquename"))
                .and_then(|v| v.as_str());
            let iv = map
                .get("@itemvalue")
                .or_else(|| map.get("itemvalue"))
                .and_then(|v| {
                    if let Some(n) = v.as_f64() {
                        Some(n)
                    } else if let Some(s) = v.as_str() {
                        s.parse::<f64>().ok()
                    } else {
                        None
                    }
                });

            if let (Some(u), Some(i)) = (uid, iv) {
                id_to_iv.insert(u.to_string(), i);
            }
            for v in map.values() {
                extract_iv(v, id_to_iv);
            }
        }
        Value::Array(arr) => {
            for v in arr {
                extract_iv(v, id_to_iv);
            }
        }
        _ => {}
    }
}

fn find_items(val: &Value, list: &mut Vec<Value>) {
    match val {
        Value::Object(map) => {
            if let Some(uid) = map.get("@uniquename").and_then(|v| v.as_str()) {
                list.push(val.clone());
                if let Some(enchants) = map.get("enchantments").and_then(|e| e.get("enchantment")) {
                    let enchants_arr = if enchants.is_array() {
                        enchants.as_array().unwrap().clone()
                    } else {
                        vec![enchants.clone()]
                    };

                    for e in enchants_arr {
                        if let Some(lvl) = e.get("@enchantmentlevel").and_then(|l| l.as_str()) {
                            let mut ench_item = map.clone();
                            ench_item.insert(
                                "@uniquename".to_string(),
                                Value::String(format!("{}@{}", uid, lvl)),
                            );
                            ench_item.insert(
                                "_internal_enchant_level".to_string(),
                                Value::String(lvl.to_string()),
                            );
                            list.push(Value::Object(ench_item));
                        }
                    }
                }
            }
            for v in map.values() {
                find_items(v, list);
            }
        }
        Value::Array(arr) => {
            for v in arr {
                find_items(v, list);
            }
        }
        _ => {}
    }
}

pub fn get_img_dir(handle: &tauri::AppHandle) -> PathBuf {
    let mut path = handle
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| PathBuf::from("./data"));

    path.push("item_images");
    path
}

pub async fn download_and_build_db(window: Window, handle: AppHandle) -> Result<String, String> {
    let url_names =
        "https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.json";
    let url_items =
        "https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/items.json";

    let _ = window.emit("sync-progress", 2.0);

    let (resp_names, resp_items) = tokio::join!(reqwest::get(url_names), reqwest::get(url_items));
    let names_json: Value = resp_names
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;
    let items_json: Value = resp_items
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;

    let _ = window.emit("sync-progress", 10.0);

    let mut id_to_name = HashMap::new();
    if let Value::Array(arr) = names_json {
        for i in arr {
            if let (Some(uid), Some(en_name)) = (
                i.get("UniqueName").and_then(|v| v.as_str()),
                i.get("LocalizedNames")
                    .and_then(|l| l.get("EN-US"))
                    .and_then(|n| n.as_str()),
            ) {
                id_to_name.insert(uid.to_string(), en_name.to_string());
            }
        }
    }

    let mut id_to_iv = HashMap::new();
    extract_iv(&items_json, &mut id_to_iv);

    let mut raw_items_list = Vec::new();
    find_items(&items_json, &mut raw_items_list);

    let total_items = raw_items_list.len();
    let mut db_map: HashMap<String, DbItem> = HashMap::new();

    for (i, item) in raw_items_list.iter().enumerate() {
        if i % 500 == 0 {
            let progress = 10.0 + (i as f32 / total_items as f32) * 30.0;
            let _ = window.emit("sync-progress", progress);
        }

        if let Value::Object(map) = item {
            let uid = match map.get("@uniquename").and_then(|v| v.as_str()) {
                Some(u) => u,
                None => continue,
            };

            let base_uid = uid
                .split('@')
                .next()
                .unwrap()
                .split("_LEVEL")
                .next()
                .unwrap();

            let base_name_raw = id_to_name
                .get(uid)
                .or_else(|| id_to_name.get(base_uid))
                .map(|s| s.as_str())
                .unwrap_or(uid);

            if base_name_raw.contains("Token")
                || base_name_raw.contains("Journal")
                || base_name_raw.contains("Trash")
            {
                continue;
            }

            let base_name = clean_albion_name(base_name_raw);
            let current_tier = uid.split('_').next().unwrap_or("4").replace('T', "");

            let mut enchant_val = map
                .get("_internal_enchant_level")
                .and_then(|v| v.as_str())
                .unwrap_or("0")
                .to_string();
            if enchant_val == "0" {
                if uid.contains("@") {
                    enchant_val = uid.split("@").nth(1).unwrap_or("0").to_string();
                } else if uid.contains("_LEVEL") {
                    enchant_val = uid.split("_LEVEL").nth(1).unwrap_or("0").to_string();
                }
            }

            let display_name = format!("{} [{}.{}]", base_name, current_tier, enchant_val);

            let reqs = map.get("craftingrequirements");
            let req = if let Some(r_arr) = reqs.and_then(|v| v.as_array()) {
                r_arr.first()
            } else {
                reqs
            };

            let mut mats = Vec::new();
            let mut dynamic_item_value = 0.0;
            let mut out_qty_val = 1;

            if let Some(Value::Object(req_map)) = req {
                out_qty_val = req_map
                    .get("@amountcrafted")
                    .or_else(|| req_map.get("@amount"))
                    .and_then(|v| {
                        if let Some(n) = v.as_i64() {
                            Some(n as i32)
                        } else if let Some(s) = v.as_str() {
                            s.parse::<i32>().ok()
                        } else {
                            None
                        }
                    })
                    .unwrap_or(1);

                if let Some(craft_res) = req_map.get("craftresource") {
                    let res_arr = if craft_res.is_array() {
                        craft_res.as_array().unwrap().clone()
                    } else {
                        vec![craft_res.clone()]
                    };

                    for res in res_arr {
                        if let Some(r_uid) = res.get("@uniquename").and_then(|v| v.as_str()) {
                            let r_qty = res
                                .get("@count")
                                .and_then(|v| {
                                    if let Some(n) = v.as_i64() {
                                        Some(n as i32)
                                    } else if let Some(s) = v.as_str() {
                                        s.parse::<i32>().ok()
                                    } else {
                                        None
                                    }
                                })
                                .unwrap_or(1);

                            let r_base = r_uid
                                .split('@')
                                .next()
                                .unwrap()
                                .split("_LEVEL")
                                .next()
                                .unwrap();
                            let r_tier = r_uid.split('_').next().unwrap_or("4").replace('T', "");

                            let mut r_ench = "0".to_string();
                            if r_uid.contains("@") {
                                r_ench = r_uid.split("@").nth(1).unwrap_or("0").to_string();
                            } else if r_uid.contains("_LEVEL") {
                                r_ench = r_uid.split("_LEVEL").nth(1).unwrap_or("0").to_string();
                            } else if r_tier == current_tier {
                                r_ench = enchant_val.clone();
                            }

                            let r_iv_base = *id_to_iv.get(r_base).unwrap_or(&0.0);
                            let r_ench_num = r_ench.parse::<u32>().unwrap_or(0);
                            let r_iv = r_iv_base * (2_i32.pow(r_ench_num) as f64);

                            dynamic_item_value += r_iv * (r_qty as f64);

                            let r_raw_name = id_to_name
                                .get(r_uid)
                                .or_else(|| id_to_name.get(r_base))
                                .map(|s| s.as_str())
                                .unwrap_or(r_uid);
                            let r_raw_name_clean = clean_albion_name(r_raw_name);
                            let r_display_name =
                                format!("{} [{}.{}]", r_raw_name_clean, r_tier, r_ench);

                            let mat_img_id = if r_ench != "0" {
                                format!("{}@{}", r_base, r_ench)
                            } else {
                                r_base.to_string()
                            };

                            let mut is_returnable = true;
                            if res.get("@maxreturnamount").and_then(|v| v.as_str()) == Some("0") {
                                is_returnable = false;
                            }

                            let uid_upper = r_uid.to_uppercase();
                            if [
                                "_RUNE",
                                "_SOUL",
                                "_RELIC",
                                "_SHARD",
                                "ARTIFACT_",
                                "_MOUNT_",
                                "FARM_",
                            ]
                            .iter()
                            .any(|&kw| uid_upper.contains(kw))
                            {
                                is_returnable = false;
                            }

                            mats.push(RecipeMaterial {
                                id: mat_img_id,
                                name: r_display_name,
                                qty: r_qty,
                                is_returnable,
                            });
                        }
                    }
                }
            }

            let mut item_val = 0.0;
            if let Some(raw_iv) = map.get("@itemvalue").or_else(|| map.get("itemvalue")) {
                if let Some(n) = raw_iv.as_f64() {
                    item_val = n;
                } else if let Some(s) = raw_iv.as_str() {
                    item_val = s.parse::<f64>().unwrap_or(0.0);
                }
            }

            if item_val == 0.0 {
                let base_iv = *id_to_iv.get(base_uid).unwrap_or(&0.0);
                let ench_num = enchant_val.parse::<u32>().unwrap_or(0);
                if ench_num > 0 {
                    item_val = base_iv * (2_i32.pow(ench_num) as f64);
                } else {
                    item_val = base_iv;
                }
            }

            if item_val == 0.0 {
                item_val = dynamic_item_value;
            }

            let tier_int = current_tier.parse::<i32>().unwrap_or(4);

            if let Some(existing) = db_map.get_mut(&display_name) {
                if mats.is_empty() && !existing.recipe.is_empty() {
                    mats = existing.recipe.clone();
                }
                if item_val == 0.0 && existing.item_value > 0.0 {
                    item_val = existing.item_value;
                }
                if out_qty_val == 1 && existing.out_qty > 1 {
                    out_qty_val = existing.out_qty;
                }
            }

            db_map.insert(
                display_name.clone(),
                DbItem {
                    display_name,
                    id: uid.to_string(),
                    tier: tier_int,
                    item_value: item_val,
                    out_qty: out_qty_val,
                    recipe: mats,
                },
            );
        }
    }

    let img_dir = get_img_dir(&handle);
    fs::create_dir_all(&img_dir)
        .await
        .map_err(|e| e.to_string())?;

    let mut unique_ids: Vec<String> = db_map.values().map(|i| i.id.clone()).collect();
    unique_ids.sort();
    unique_ids.dedup();

    let client = reqwest::Client::new();
    let total_imgs = unique_ids.len();
    let mut current_img_idx = 0;

    let _ = window.emit("sync-progress", 40.0);

    let mut fetches = stream::iter(unique_ids)
        .map(|id| {
            let client = &client;
            let path = img_dir.join(format!("{}.png", id));
            async move {
                if path.exists() {
                    return Ok(());
                }
                let url = format!("https://render.albiononline.com/v1/item/{}.png", id);
                let resp = client.get(url).send().await?;
                if resp.status().is_success() {
                    let bytes = resp.bytes().await?;
                    let mut file = fs::File::create(path).await?;
                    file.write_all(&bytes).await?;
                }
                Ok::<(), Box<dyn std::error::Error + Send + Sync>>(())
            }
        })
        .buffer_unordered(50);

    while fetches.next().await.is_some() {
        current_img_idx += 1;
        if current_img_idx % 100 == 0 {
            let progress = 40.0 + (current_img_idx as f32 / total_imgs as f32) * 55.0;
            let _ = window.emit("sync-progress", progress);
        }
    }

    let db_vec: Vec<DbItem> = db_map.into_values().collect();
    save_items_to_db(&handle, db_vec).map_err(|e| e.to_string())?;

    let _ = window.emit("sync-progress", 100.0);
    Ok("Sync Successfully.".to_string())
}

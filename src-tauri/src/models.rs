use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MaterialInput {
    pub name: String,
    pub qty: f64,
    pub price: f64,
    pub is_return: bool,
    pub qty_from_stock: f64,
    pub market_stock: f64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CraftingRequest {
    pub item_name: String,
    pub materials_list: Vec<MaterialInput>,
    pub target_actual_craft: i32,
    pub output_qty_per_craft: i32,
    pub sell_price: f64,
    pub item_value: f64,
    pub station_fee: f64,
    pub rrr_percentage: f64,
    pub is_premium: bool,
    pub sell_method: String,
    pub use_focus: bool,
    pub focus_cost: f64,
    pub focus_pool: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MaterialResult {
    pub name: String,
    pub qty_to_buy: f64,
    pub stock: f64,
    pub market_stock: f64,
    pub cost: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CraftingResponse {
    pub name: String,
    pub real_profit: f64,
    pub margin: f64,
    pub total_produced: i32,

    pub net_production_cost: f64,
    pub total_revenue: f64,
    pub gross_revenue: f64,
    pub market_fee_deduction: f64,
    pub cost_per_item: f64,
    pub profit_per_item: f64,
    pub total_material_cost: f64,
    pub total_tax_cost: f64,

    pub buy_list: Vec<MaterialResult>,
    pub use_focus: bool,
    pub is_focus_insufficient: bool,
    pub focus_limited_qty: i32,
    pub is_market_insufficient: bool,
    pub market_limited_qty: i32,

    pub focus_cost_per_item: f64,
    pub silver_per_focus: f64,

    pub error: Option<String>,
}

use crate::models::{CraftingRequest, CraftingResponse, MaterialResult};

pub fn calculate(req: CraftingRequest) -> CraftingResponse {
    let rrr = req.rrr_percentage / 100.0;

    let mut is_market_insufficient = false;
    let mut material_limited_qty = req.target_actual_craft;

    for mat in &req.materials_list {
        let net_needed_per_item = if mat.is_return {
            mat.qty * (1.0 - rrr)
        } else {
            mat.qty
        };

        if net_needed_per_item <= 0.0 {
            continue;
        }

        let qty_to_buy_target =
            ((req.target_actual_craft as f64) * net_needed_per_item - mat.qty_from_stock).max(0.0);

        if mat.market_stock > 0.0 && qty_to_buy_target > mat.market_stock {
            is_market_insufficient = true;
            let total_physical_available = mat.qty_from_stock + mat.market_stock;
            let possible_with_this_mat =
                (total_physical_available / net_needed_per_item).floor() as i32;

            if possible_with_this_mat < material_limited_qty {
                material_limited_qty = possible_with_this_mat;
            }
        }
    }

    let mut is_focus_insufficient = false;
    let mut focus_limited_qty = req.target_actual_craft;
    if req.use_focus && req.focus_cost > 0.0 {
        focus_limited_qty = (req.focus_pool / req.focus_cost).floor() as i32;
        if req.target_actual_craft > focus_limited_qty {
            is_focus_insufficient = true;
        }
    }

    let mut final_qty = req.target_actual_craft;
    final_qty = final_qty.min(material_limited_qty);
    if req.use_focus {
        final_qty = final_qty.min(focus_limited_qty);
    }

    if final_qty < 0 {
        final_qty = 0;
    }

    let mut total_material_cost = 0.0;
    let mut buy_list = Vec::new();

    for mat in &req.materials_list {
        let net_needed_per_item = if mat.is_return {
            mat.qty * (1.0 - rrr)
        } else {
            mat.qty
        };

        let total_needed_final = (final_qty as f64) * net_needed_per_item;

        let qty_to_buy = (total_needed_final - mat.qty_from_stock).max(0.0);
        let cost_to_buy = qty_to_buy * mat.price;

        total_material_cost += total_needed_final * mat.price;

        buy_list.push(MaterialResult {
            name: mat.name.clone(),
            qty_to_buy: qty_to_buy.ceil(),
            stock: mat.qty_from_stock,
            market_stock: mat.market_stock,
            cost: cost_to_buy.round(),
        });
    }

    let tax_per_craft = req.item_value * 0.1125 * (req.station_fee / 100.0);
    let total_tax_cost = (final_qty as f64) * tax_per_craft;

    let total_produced = final_qty * req.output_qty_per_craft;
    let gross_revenue = (total_produced as f64) * req.sell_price;

    let mut fee_rate = if req.is_premium { 0.04 } else { 0.08 };
    if req.sell_method.to_lowercase() == "order" {
        fee_rate += 0.025;
    }

    let market_fee_deduction = gross_revenue * fee_rate;
    let total_revenue = gross_revenue - market_fee_deduction;

    let net_production_cost = total_material_cost + total_tax_cost;
    let real_profit = total_revenue - net_production_cost;

    let margin = if total_revenue > 0.0 {
        (real_profit / total_revenue) * 100.0
    } else {
        0.0
    };

    let silver_per_focus = if req.use_focus && final_qty > 0 {
        let focus_used = (final_qty as f64) * req.focus_cost;
        if focus_used > 0.0 {
            real_profit / focus_used
        } else {
            0.0
        }
    } else {
        0.0
    };

    CraftingResponse {
        name: req.item_name,
        real_profit: real_profit.round(),
        margin: (margin * 100.0).round() / 100.0,
        total_produced,
        net_production_cost: net_production_cost.round(),
        total_revenue: total_revenue.round(),
        gross_revenue: gross_revenue.round(),
        market_fee_deduction: market_fee_deduction.round(),
        cost_per_item: if total_produced > 0 {
            (net_production_cost / total_produced as f64).round()
        } else {
            0.0
        },
        profit_per_item: if total_produced > 0 {
            (real_profit / total_produced as f64).round()
        } else {
            0.0
        },
        total_material_cost: total_material_cost.round(),
        total_tax_cost: total_tax_cost.round(),
        buy_list,
        use_focus: req.use_focus,
        is_focus_insufficient,
        focus_limited_qty,
        focus_cost_per_item: req.focus_cost,
        silver_per_focus: silver_per_focus.round(),
        is_market_insufficient,
        market_limited_qty: material_limited_qty,
        error: None,
    }
}

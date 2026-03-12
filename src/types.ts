// --- KONTRAK INPUT KE RUST ---

export interface MaterialInput {
  name: string;
  qty: number;
  price: number;
  isReturn: boolean;
  qtyFromStock: number;
  marketStock: number;
}

export interface CraftingRequest {
  itemName: string;
  materialsList: MaterialInput[];
  targetActualCraft: number;
  outputQtyPerCraft: number;
  sellPrice: number;
  itemValue: number;
  stationFee: number;
  rrrPercentage: number;
  isPremium: boolean;
  useFocus: boolean;
  focusCost: number;
  focusPool: number;
  sellMethod: string;
}

export interface BuyListItem {
  name: string;
  qty_to_buy: number;
  qty_from_stock: number;
  price: number;
  cash_out: number;
  is_return: boolean;
  qty_per_craft: number;
  leftover: number;
}

export interface SuggestedPrices {
  m5: number;
  m10: number;
  m20: number;
}

export interface CraftingResponse {
  name: string;
  actual_craft: number;
  total_produced: number;
  buy_list: BuyListItem[];
  total_material_cost: number;
  tax_used: number;
  total_tax_cost: number;
  net_production_cost: number;
  cost_per_item: number;
  gross_revenue: number;
  market_fee_deduction: number;
  total_revenue: number;
  real_profit: number;
  profit_per_item: number;
  margin: number;
  is_profitable: boolean;
  suggested: SuggestedPrices;
  error: string | null;
}

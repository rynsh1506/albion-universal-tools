import { create } from "zustand";

export interface Material {
  id: string;
  name: string;
  qty: number;
  isReturn: boolean;
  price: number | string;
  qtyFromStock: number | string;
  marketStock: number | string;
}

interface CraftingStore {
  // --- Form State ---
  targetItem: string;
  targetItemId: string;
  itemValue: number;
  outputQty: number;
  targetCraft: number;
  itemPrice: number | string;
  materials: Material[];

  // --- Strategy State ---
  basic: number;
  local: number;
  daily: number;
  stationFee: number;
  useFocus: boolean;
  focusCost: number | string;
  focusBank: number | string;

  marketStatus: string;
  isPremium: boolean;
  isSalvage: boolean;
  activeView: string;

  searchQuery: string;
  tierFilter: string;
  enchantFilter: string;
  searchResults: any[];
  searchPage: number;

  setTargetItem: (val: string) => void;
  setTargetItemId: (val: string) => void;
  setItemValue: (val: number) => void;
  setOutputQty: (val: number) => void;
  setTargetCraft: (val: number) => void;
  setItemPrice: (val: number | string) => void;
  setMaterials: (materials: Material[]) => void;
  updateMaterial: (id: string, field: keyof Material, value: any) => void;

  setBasic: (val: number) => void;
  setLocal: (val: number) => void;
  setDaily: (val: number) => void;
  setStationFee: (val: number) => void;
  setUseFocus: (val: boolean) => void;
  setFocusCost: (val: number | string) => void;
  setFocusBank: (val: number | string) => void;

  setMarketStatus: (val: string) => void;
  setIsPremium: (val: boolean) => void;
  setIsSalvage: (val: boolean) => void;
  setActiveView: (view: string) => void;

  setSearchQuery: (val: string) => void;
  setTierFilter: (val: string) => void;
  setEnchantFilter: (val: string) => void;
  setSearchResults: (val: any[]) => void;
  setSearchPage: (val: number) => void;

  getRRR: () => number;
  selectItem: (item: any) => void;
  clearCrafting: () => void;
}

export const useCraftingStore = create<CraftingStore>()((set, get) => ({
  targetItem: "",
  targetItemId: "",
  itemValue: 0,
  outputQty: 1,
  targetCraft: 1,
  itemPrice: 0,
  materials: [],

  basic: 0,
  local: 0,
  daily: 0,
  stationFee: 0,
  useFocus: false,
  focusCost: 0,
  focusBank: 30000,

  marketStatus: "Order",
  isPremium: true,
  isSalvage: false,
  activeView: "crafting",

  searchQuery: "",
  tierFilter: "All",
  enchantFilter: "All",
  searchResults: [],
  searchPage: 1,

  setTargetItem: (val) => set({ targetItem: val }),
  setTargetItemId: (val) => set({ targetItemId: val }),
  setItemValue: (val) => set({ itemValue: val }),
  setOutputQty: (val) => set({ outputQty: val }),
  setTargetCraft: (val) => set({ targetCraft: val }),
  setItemPrice: (val) => set({ itemPrice: val }),
  setMaterials: (materials) => set({ materials }),

  setBasic: (val) => set({ basic: val }),
  setLocal: (val) => set({ local: val }),
  setDaily: (val) => set({ daily: val }),
  setStationFee: (val) => set({ stationFee: val }),
  setUseFocus: (val) => set({ useFocus: val }),
  setFocusCost: (val) => set({ focusCost: val }),
  setFocusBank: (val) => set({ focusBank: val }),

  setMarketStatus: (val) => set({ marketStatus: val }),
  setIsPremium: (val) => set({ isPremium: val }),
  setIsSalvage: (val) =>
    set({
      isSalvage: val,
      activeView: val ? "salvage" : "crafting",
    }),
  setActiveView: (view) => set({ activeView: view }),

  setSearchQuery: (val) => set({ searchQuery: val }),
  setTierFilter: (val) => set({ tierFilter: val }),
  setEnchantFilter: (val) => set({ enchantFilter: val }),
  setSearchResults: (val) => set({ searchResults: val }),
  setSearchPage: (val) => set({ searchPage: val }),

  updateMaterial: (id, field, value) =>
    set((state: any) => ({
      materials: state.materials.map((mat: any) =>
        mat.id === id ? { ...mat, [field]: value } : mat,
      ),
    })),

  getRRR: () => {
    const s = get();
    const focusBonus = s.useFocus ? 59 : 0;
    const totalBonus =
      Number(s.basic) + Number(s.local) + Number(s.daily) + focusBonus;
    return totalBonus > 0 ? (totalBonus / (100 + totalBonus)) * 100 : 0;
  },

  selectItem: (item: any) =>
    set({
      targetItem: item.display_name,
      targetItemId: item.id || item.unique_name || "",
      itemValue: item.item_value,
      outputQty: item.out_qty,
      materials: (item.recipe || []).map((mat: any) => ({
        id:
          mat.id || mat.unique_name || Math.random().toString(36).substr(2, 9),
        name: mat.name || mat.display_name,
        qty: mat.qty,
        isReturn: mat.is_returnable,
        price: 0,
        qtyFromStock: 0,
        marketStock: 0,
      })),
      targetCraft: 1,
      itemPrice: 0,
    }),

  clearCrafting: () =>
    set({
      targetItem: "",
      targetItemId: "",
      itemValue: 0,
      outputQty: 1,
      targetCraft: 999,
      itemPrice: 0,
      materials: [],
      useFocus: false,
      focusCost: 0,
      searchQuery: "",
      searchResults: [],
    }),
}));

import { useState, useEffect } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import {
  Package,
  Coins,
  XCircle,
  CheckCircle2,
  Eye,
  Calculator,
  CircleDollarSign,
} from "lucide-react";
import { useCraftingStore, Material } from "../store/useCraftingStore";
import { blockInvalidCharInt, cleanIntString } from "../utils/inputHelpers";

export default function MaterialCard({
  mat,
  onOpenCalc,
  imageDirPath,
}: {
  mat: Material;
  onOpenCalc?: () => void;
  imageDirPath?: string;
}) {
  const updateMaterial = useCraftingStore((state) => state.updateMaterial);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [mat.id]);

  const getImgUrl = (itemId: string) =>
    imageDirPath && itemId
      ? convertFileSrc(`${imageDirPath}/${itemId}.webp`)
      : "";

  const localImageUrl = getImgUrl(mat.id);

  const LiveTooltip = ({
    value,
    label,
    customText,
  }: {
    value?: any;
    label?: string;
    customText?: string;
  }) => {
    if (customText) {
      return (
        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-primary text-primary-content px-3 py-1.5 rounded-lg text-[10px] font-black shadow-sm opacity-0 invisible pointer-events-none group-hover/input:opacity-100 group-hover/input:visible transition-opacity duration-100 z-100 flex items-center gap-2 border border-white/20 whitespace-nowrap">
          <Eye size={12} />
          {customText}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45 border-b border-r border-white/20"></div>
        </div>
      );
    }

    if (!value && value !== 0 && value !== "0") return null;

    return (
      <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-primary text-primary-content px-3 py-1.5 rounded-lg text-[10px] font-black shadow-sm opacity-0 invisible pointer-events-none group-hover/input:opacity-100 group-hover/input:visible transition-opacity duration-100 z-100 flex items-center gap-2 border border-white/20 whitespace-nowrap">
        <Eye size={12} />
        {Number(value).toLocaleString("en-US")} {label}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45 border-b border-r border-white/20"></div>
      </div>
    );
  };

  return (
    <div className="bg-base-content/5 border border-base-content/10 rounded-2xl p-5 mb-4 hover:border-primary/30 hover:bg-base-content/10 transition-colors duration-100 shadow-sm group relative isolate overflow-visible">
      <div className="flex items-center gap-3 mb-5 group/name relative">
        <div className="bg-base-content/5 w-10 h-10 rounded-lg flex items-center justify-center shadow-inner group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors duration-100 overflow-hidden shrink-0">
          {imageError || !localImageUrl ? (
            <Package
              size={18}
              className="text-primary opacity-50 stroke-[2px]"
            />
          ) : (
            <img
              src={localImageUrl}
              alt={mat.name}
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          )}
        </div>

        <div className="flex-1 min-w-0 relative group/title">
          <h4 className="text-sm font-black text-base-content uppercase tracking-wider truncate cursor-help flex items-center gap-2">
            {mat.name}
          </h4>

          <div className="absolute bottom-full left-0 mb-2 bg-base-content text-base-100 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest shadow-sm opacity-0 invisible pointer-events-none group-hover/title:opacity-100 group-hover/title:visible transition-opacity duration-100 z-110 border border-base-content/10 whitespace-nowrap flex flex-col items-center">
            <span>{mat.name}</span>
            <div className="absolute -bottom-1 left-4 w-2 h-2 bg-base-content rotate-45 border-b border-r border-base-content/10"></div>
          </div>
        </div>
      </div>

      <div className="mb-5 group/input relative">
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-[9px] font-black opacity-50 uppercase tracking-wider flex items-center gap-1.5">
            <Coins size={10} className="text-warning" /> Buy Price (Silver)
          </label>

          <button
            onClick={(e) => {
              e.preventDefault();
              onOpenCalc?.();
            }}
            className="text-[9px] font-black uppercase text-info opacity-60 hover:opacity-100 flex items-center gap-1 transition-colors active:scale-95 bg-info/10 px-2 py-0.5 rounded-md hover:bg-info/20"
          >
            <Calculator size={10} /> Avg Price
          </button>
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warning/50 select-none">
            <CircleDollarSign size={14} strokeWidth={2.5} />
          </span>
          <input
            type="text"
            inputMode="numeric"
            className="w-full bg-base-content/5 border border-base-content/10 rounded-xl py-2.5 pr-4 pl-10 text-sm font-black outline-none focus:border-warning/50 focus:bg-warning/5 transition-colors duration-100 text-warning placeholder:opacity-30"
            placeholder="0"
            value={mat.price === 0 ? "" : mat.price}
            onKeyDown={blockInvalidCharInt}
            onChange={(e) => {
              const cleaned = cleanIntString(e.target.value);
              updateMaterial(mat.id, "price", Number(cleaned) || 0);
            }}
          />
          <LiveTooltip value={mat.price} label="Silver" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 items-end border-t border-base-content/5 pt-4">
        <div className="group/input relative flex flex-col items-center">
          <label className="text-[8px] font-black opacity-40 mb-1.5 uppercase tracking-wider text-center w-full">
            Qty
          </label>
          <div className="w-full h-9 bg-base-content/5 border border-base-content/5 rounded-xl flex items-center justify-center text-xs font-black opacity-50 cursor-not-allowed shadow-inner">
            {mat.qty}
          </div>
          <LiveTooltip value={mat.qty} label="Items" />
        </div>

        <div className="group/input relative flex flex-col items-center">
          <label className="text-[8px] font-black opacity-50 mb-1.5 uppercase tracking-wider text-success text-center w-full">
            Bag
          </label>
          <input
            type="text"
            inputMode="numeric"
            className="w-full h-9 bg-base-content/5 border border-base-content/10 rounded-xl px-1 text-xs text-center font-black text-success outline-none focus:border-success/50 focus:bg-success/10 transition-colors duration-100 shadow-inner placeholder:opacity-30"
            placeholder="0"
            value={mat.qtyFromStock === 0 ? "" : mat.qtyFromStock}
            onKeyDown={blockInvalidCharInt}
            onChange={(e) => {
              const cleaned = cleanIntString(e.target.value);
              updateMaterial(mat.id, "qtyFromStock", Number(cleaned) || 0);
            }}
          />
          <LiveTooltip value={mat.qtyFromStock} label="In Bag" />
        </div>

        <div className="group/input relative flex flex-col items-center">
          <label className="text-[8px] font-black opacity-50 mb-1.5 uppercase tracking-wider text-info text-center w-full">
            Mkt
          </label>
          <input
            type="text"
            inputMode="numeric"
            className="w-full h-9 bg-base-content/5 border border-base-content/10 rounded-xl px-1 text-xs font-black text-info text-center outline-none focus:border-info/50 focus:bg-info/10 transition-colors duration-100 shadow-inner placeholder:opacity-30"
            placeholder="∞"
            value={mat.marketStock === 0 ? "" : mat.marketStock}
            onKeyDown={blockInvalidCharInt}
            onChange={(e) => {
              const cleaned = cleanIntString(e.target.value);
              updateMaterial(mat.id, "marketStock", Number(cleaned) || 0);
            }}
          />
          <LiveTooltip value={mat.marketStock} label="Market" />
        </div>

        <div className="group/input relative flex flex-col items-center">
          <label className="text-[8px] font-black opacity-40 mb-1.5 uppercase tracking-wider text-center w-full">
            Ret
          </label>
          <div
            className={`w-full h-9 border rounded-xl flex items-center justify-center transition-colors duration-100 shadow-sm ${
              mat.isReturn
                ? "bg-success/10 border-success/30 text-success"
                : "bg-base-content/5 border-base-content/10 text-base-content/30"
            }`}
          >
            {mat.isReturn ? (
              <CheckCircle2 size={16} strokeWidth={2.5} />
            ) : (
              <XCircle size={16} />
            )}
          </div>
          <LiveTooltip customText={mat.isReturn ? "Refund" : "No Refund"} />
        </div>
      </div>
    </div>
  );
}

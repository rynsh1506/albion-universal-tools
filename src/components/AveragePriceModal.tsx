import { useState, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Trash2,
  Calculator,
  Check,
  Package,
  ShoppingCart,
} from "lucide-react";
import { useCraftingStore } from "../store/useCraftingStore";
import { blockInvalidCharInt, cleanIntString } from "../utils/inputHelpers";

export default function AveragePriceModal({
  matId,
  onClose,
  data,
}: {
  matId: string;
  onClose: () => void;
  data: any;
}) {
  const { materials, updateMaterial } = useCraftingStore();
  const material = materials?.find((m) => m.id === matId);
  const modalRef = useRef<HTMLDivElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const calculatedMat = data?.buyList?.find(
    (m: any) => m.id === matId || m.name === material?.name,
  );
  const toBuy = calculatedMat ? Number(calculatedMat.qtyToBuy) : 0;

  const [rows, setRows] = useState([
    { id: Date.now().toString(), qty: "", price: "" },
  ]);

  let totalQty = 0;
  let totalCost = 0;
  rows.forEach((r) => {
    const q = Number(r.qty) || 0;
    const p = Number(r.price) || 0;
    totalQty += q;
    totalCost += q * p;
  });

  const avgPrice = totalQty > 0 ? Math.ceil(totalCost / totalQty) : 0;

  const addRow = () => {
    setRows([...rows, { id: Date.now().toString(), qty: "", price: "" }]);
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter((r) => r.id !== id));
    }
  };

  const updateRow = (id: string, field: "qty" | "price", value: string) => {
    const cleaned = cleanIntString(value);
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: cleaned } : r)));
  };

  const handleApply = () => {
    if (avgPrice > 0) {
      updateMaterial(matId, "price", avgPrice);
      updateMaterial(matId, "marketStock", totalQty);
    }
    onClose();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!material) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-0 md:p-4 isolate">
      <div
        className="absolute inset-0 bg-base-300/98 md:bg-base-300/95"
        onClick={onClose}
      />

      <div
        ref={modalRef}
        className="relative w-full h-full md:h-auto md:max-w-md bg-base-200 md:border border-base-content/10 rounded-none md:rounded-4xl shadow-2xl flex flex-col max-h-full md:max-h-[85vh] overflow-hidden isolate"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 md:px-7 md:py-6 border-b border-base-content/5 flex justify-between items-center shrink-0 bg-base-200 z-20">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 md:p-3 rounded-xl border border-primary/20 text-primary shadow-inner shrink-0">
              <Calculator className="size={18} md:size={20} strokeWidth={2.5}" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs md:text-sm font-black uppercase tracking-widest text-base-content leading-none">
                Avg Price Calc
              </h2>
              <div className="text-[9px] md:text-[11px] font-bold opacity-60 mt-1.5 flex items-center gap-1.5 text-primary truncate">
                <Package size={10} className="shrink-0" />{" "}
                <span className="truncate">{material.name}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-error transition-colors rounded-xl"
          >
            <X size={20} />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="p-5 md:p-7 overflow-y-auto custom-scrollbar space-y-3 md:space-y-4 flex-1 bg-base-100/50"
          onTouchStart={() => {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
        >
          <div className="flex px-1 gap-3">
            <div className="flex-1 text-[8px] md:text-[9px] font-black opacity-40 uppercase tracking-widest pl-2">
              Quantity
            </div>
            <div className="flex-1 text-[8px] md:text-[9px] font-black opacity-40 uppercase tracking-widest pl-2 text-warning">
              Price (Silver)
            </div>
            <div className="w-8"></div>
          </div>

          {rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-2 md:gap-3 group/row"
            >
              <div className="flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={row.qty}
                  onKeyDown={(e) => {
                    blockInvalidCharInt(e as any);
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                  enterKeyHint="done"
                  onChange={(e) => updateRow(row.id, "qty", e.target.value)}
                  className="w-full bg-base-content/5 border border-base-content/10 rounded-xl md:rounded-2xl py-2.5 md:py-3 px-3 md:px-4 text-xs md:text-sm font-black outline-none focus:border-primary/50 focus:bg-primary/5 transition-colors shadow-inner"
                />
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={row.price}
                  onKeyDown={(e) => {
                    blockInvalidCharInt(e as any);
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                  enterKeyHint="done"
                  onChange={(e) => updateRow(row.id, "price", e.target.value)}
                  className="w-full bg-base-content/5 border border-base-content/10 rounded-xl md:rounded-2xl py-2.5 md:py-3 px-3 md:px-4 text-xs md:text-sm font-black outline-none focus:border-warning/50 focus:bg-warning/5 text-warning transition-colors shadow-inner"
                />
              </div>

              <button
                onClick={() => removeRow(row.id)}
                disabled={rows.length === 1}
                className="btn btn-ghost btn-xs md:btn-sm btn-square text-error/30 hover:text-error hover:bg-error/10 disabled:opacity-0 rounded-xl transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 md:p-7 bg-base-200 border-t border-base-content/5 shrink-0 z-20 pb-8 md:pb-7 flex flex-col">
          <button
            onClick={addRow}
            className="w-full py-2.5 md:py-3 mb-4 md:mb-5 rounded-xl md:rounded-2xl border border-dashed border-base-content/20 text-base-content/50 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 outline-none shrink-0"
          >
            <Plus size={14} strokeWidth={2.5} /> Add Purchase Row
          </button>

          <div className="flex justify-between items-center mb-4 md:mb-5 px-1">
            <div className="text-center md:text-left">
              <p className="text-[8px] md:text-[9px] font-black uppercase opacity-40 mb-1 tracking-widest flex items-center gap-1 justify-center md:justify-start">
                <ShoppingCart size={10} /> TO BUY
              </p>
              <p className="text-xs md:text-sm font-black text-error">
                {toBuy.toLocaleString()}
              </p>
            </div>
            <div className="w-px h-6 md:h-8 bg-base-content/10"></div>
            <div className="text-center">
              <p className="text-[8px] md:text-[9px] font-black uppercase opacity-40 mb-1 tracking-widest">
                GOT
              </p>
              <p
                className={`text-xs md:text-sm font-black ${totalQty >= toBuy ? "text-success" : "text-base-content"}`}
              >
                {totalQty.toLocaleString()}
              </p>
            </div>
            <div className="w-px h-6 md:h-8 bg-base-content/10"></div>
            <div className="text-center md:text-right">
              <p className="text-[8px] md:text-[9px] font-black uppercase opacity-40 mb-1 tracking-widest">
                TOTAL COST
              </p>
              <p className="text-xs md:text-sm font-black text-error truncate max-w-20 md:max-w-none">
                {totalCost.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 bg-info/10 border border-info/20 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col justify-center shadow-inner relative overflow-hidden">
              <span className="text-[8px] md:text-[9px] font-black uppercase text-info opacity-70 tracking-widest mb-0.5 md:mb-1">
                Average Price
              </span>
              <span className="text-lg md:text-xl font-black text-info leading-none tracking-tight">
                {avgPrice.toLocaleString()}{" "}
                <span className="text-[10px] opacity-50 ml-1">/ unit</span>
              </span>
            </div>

            <button
              onClick={handleApply}
              disabled={avgPrice <= 0}
              className="h-14 md:h-18.5 md:px-8 rounded-xl md:rounded-2xl bg-primary text-primary-content font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-colors active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
            >
              <Check size={20} strokeWidth={3} />
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

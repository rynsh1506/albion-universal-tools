import { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, Calculator, Check, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCraftingStore } from "../store/useCraftingStore";
import { blockInvalidCharInt, cleanIntString } from "../utils/inputHelpers";

export default function AveragePriceModal({
  matId,
  onClose,
}: {
  matId: string;
  onClose: () => void;
}) {
  const { materials, updateMaterial } = useCraftingStore();
  const material = materials?.find((m) => m.id === matId);
  const modalRef = useRef<HTMLDivElement>(null);

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
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 isolate">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-base-300/90 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md bg-base-100 border border-base-content/10 rounded-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] isolate"
      >
        {/* Glow Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/10 blur-[50px] -z-10 rounded-full pointer-events-none"></div>

        {/* HEADER */}
        <div className="px-7 py-6 border-b border-base-content/5 flex justify-between items-start shrink-0 relative z-10">
          <div className="flex gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 text-primary shadow-inner">
              <Calculator size={20} strokeWidth={2.5} />
            </div>
            <div className="pt-1">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-base-content leading-none">
                Avg Price Calc
              </h2>
              <div className="text-[11px] font-bold opacity-60 mt-2 flex items-center gap-1.5 text-primary">
                <Package size={12} /> {material.name}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-error hover:bg-error/10 transition-all rounded-xl"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY - SCROLLABLE LIST */}
        <div className="p-7 overflow-y-auto custom-scrollbar space-y-4 flex-1 relative z-10">
          {/* Header Row (Labels) */}
          <div className="flex px-1 gap-3">
            <div className="flex-1 text-[9px] font-black opacity-40 uppercase tracking-widest pl-2">
              Quantity
            </div>
            <div className="flex-1 text-[9px] font-black opacity-40 uppercase tracking-widest pl-2 text-warning">
              Unit Price (Silver)
            </div>
            <div className="w-8"></div>
          </div>

          <AnimatePresence initial={false}>
            {rows.map((row) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 group/row"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={row.qty}
                    onKeyDown={blockInvalidCharInt}
                    onChange={(e) => updateRow(row.id, "qty", e.target.value)}
                    className="w-full bg-base-content/5 border border-base-content/10 rounded-2xl py-3 px-4 text-sm font-black outline-none focus:border-primary/50 focus:bg-primary/5 transition-all placeholder:opacity-20 shadow-inner"
                  />
                </div>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={row.price}
                    onKeyDown={blockInvalidCharInt}
                    onChange={(e) => updateRow(row.id, "price", e.target.value)}
                    className="w-full bg-base-content/5 border border-base-content/10 rounded-2xl py-3 px-4 text-sm font-black outline-none focus:border-warning/50 focus:bg-warning/5 text-warning transition-all placeholder:opacity-20 shadow-inner"
                  />
                </div>

                <button
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                  className="btn btn-ghost btn-sm btn-square text-error/30 hover:text-error hover:bg-error/10 disabled:opacity-10 disabled:bg-transparent rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            onClick={addRow}
            className="w-full py-3.5 rounded-2xl border border-dashed border-base-content/20 text-base-content/50 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-4 outline-none"
          >
            <Plus size={14} strokeWidth={2.5} /> Add Purchase Row
          </button>
        </div>

        <div className="p-7 bg-base-200/80 border-t border-base-content/5 shrink-0 relative z-10 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-5 px-1">
            <div>
              <p className="text-[9px] font-black uppercase opacity-40 mb-1 tracking-widest">
                Total Items
              </p>
              <p className="text-sm font-black text-base-content">
                {totalQty.toLocaleString("en-US")}
              </p>
            </div>
            <div className="w-px h-8 bg-base-content/10"></div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase opacity-40 mb-1 tracking-widest">
                Total Cost
              </p>
              <p className="text-sm font-black text-error">
                {totalCost.toLocaleString("en-US")} Silver
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-info/10 border border-info/20 rounded-2xl p-4 flex flex-col justify-center shadow-inner relative overflow-hidden group/avg">
              <div className="absolute top-0 right-0 w-16 h-16 bg-info/20 blur-xl rounded-full -mr-8 -mt-8 pointer-events-none"></div>
              <span className="text-[9px] font-black uppercase text-info opacity-70 tracking-widest mb-1">
                Average Price
              </span>
              <span className="text-xl font-black text-info leading-none tracking-tight">
                {avgPrice.toLocaleString("en-US")}{" "}
                <span className="text-[10px] opacity-50 ml-1">/ unit</span>
              </span>
            </div>

            <button
              onClick={handleApply}
              disabled={avgPrice <= 0}
              className="h-18.5 px-8 rounded-2xl bg-primary text-primary-content font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(var(--p),0.4)] transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex flex-col items-center justify-center gap-1"
            >
              <Check size={20} strokeWidth={3} />
              Apply
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

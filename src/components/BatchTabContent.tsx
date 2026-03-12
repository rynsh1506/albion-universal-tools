import { useEffect, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import {
  ShoppingCart,
  Crown,
  Target,
  Search,
  Layers,
  Tag,
  Coins,
  Activity,
  Eye,
  Info,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
import { useCraftingStore } from "../store/useCraftingStore";
import { blockInvalidCharInt, cleanIntString } from "../utils/inputHelpers";

export const BatchTabContent = ({
  openSearchModal,
  imageDirPath,
}: {
  openSearchModal: () => void;
  imageDirPath: string;
}) => {
  const s = useCraftingStore();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [s.targetItem]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearchModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSearchModal]);

  const updateNumericValue = (val: string, setter: (n: number) => void) => {
    const cleaned = cleanIntString(val);
    setter(Number(cleaned) || 0);
  };

  const LiveTooltip = ({ value, label }: { value: any; label: string }) => {
    if (!value && value !== 0 && value !== "0") return null;
    return (
      <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-primary/90 text-primary-content px-3 py-1.5 rounded-lg text-[10px] font-black shadow-lg pointer-events-none z-100 flex items-center gap-2 border border-white/20 whitespace-nowrap opacity-0 scale-95 translate-y-2 group-hover/input:opacity-100 group-hover/input:scale-100 group-hover/input:translate-y-0 transition-all duration-200 ease-out origin-bottom">
        <Eye size={12} />
        {Number(value).toLocaleString("en-US")} {label}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/90 rotate-45 border-b border-r border-white/20"></div>
      </div>
    );
  };

  const InfoTooltip = ({ text }: { text: string }) => (
    <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-base-content/95 text-base-100 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-lg pointer-events-none z-100 border border-base-content/10 whitespace-nowrap flex flex-col items-center opacity-0 scale-95 translate-y-2 group-hover/info:opacity-100 group-hover/info:scale-100 group-hover/info:translate-y-0 transition-all duration-200 ease-out origin-bottom">
      <span>{text}</span>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-base-content/95 rotate-45 border-b border-r border-base-content/10"></div>
    </div>
  );

  const isTargetSelected =
    s.targetItem &&
    s.targetItem !== "---" &&
    s.targetItem !== "Select Item..." &&
    s.targetItem !== "";

  const targetId = (s as any).targetItemId || s.targetItem;
  const getImgUrl = (itemId: string) =>
    imageDirPath && itemId
      ? convertFileSrc(`${imageDirPath}/${itemId}.png`)
      : "";

  return (
    <div className="space-y-8 text-base-content isolate pt-2">
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-primary uppercase flex items-center gap-2 tracking-[0.2em] opacity-80">
          <Target size={12} strokeWidth={2.5} /> Production Target
        </h3>

        <div className="relative">
          <label className="text-[9px] font-black opacity-50 mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <Search size={10} /> Target Item
          </label>

          <div
            onClick={openSearchModal}
            className="w-full bg-base-content/5 border border-base-content/10 hover:border-primary/50 hover:bg-primary/5 rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer transition-all duration-300 group/search shadow-inner mb-3"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="opacity-40 group-hover/search:text-primary group-hover/search:opacity-100 transition-colors shrink-0">
                <Search size={14} strokeWidth={2.5} />
              </span>
              <span className="text-sm font-black opacity-50 group-hover/search:text-primary group-hover/search:opacity-100 transition-colors select-none">
                Search item...
              </span>
            </div>
            <div className="flex gap-1 shrink-0 ml-2">
              <kbd className="kbd kbd-sm bg-base-content/10 border-none opacity-50 text-[10px] font-black">
                ⌘
              </kbd>
              <kbd className="kbd kbd-sm bg-base-content/10 border-none opacity-50 text-[10px] font-black">
                K
              </kbd>
            </div>
          </div>

          <div
            className={`relative group/targetCard rounded-xl p-3 flex items-center gap-3 transition-all duration-500 border ${
              isTargetSelected
                ? "bg-base-content/5 border-primary/20 shadow-sm"
                : "bg-base-content/2 border-base-content/5 border-dashed opacity-40"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-base-content/5 border border-base-content/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              {isTargetSelected && !imageError ? (
                <img
                  src={getImgUrl(targetId)}
                  alt={s.targetItem}
                  className="w-[120%] h-[120%] object-contain scale-[1.3] drop-shadow-md"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Package
                  size={18}
                  className={`${isTargetSelected ? "text-primary opacity-50" : "opacity-20"} stroke-[2px]`}
                />
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span
                className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${isTargetSelected ? "text-primary opacity-80" : "opacity-30"}`}
              >
                {isTargetSelected ? "Selected Target" : "Waiting Selection"}
              </span>
              <h4
                className={`text-sm font-black uppercase tracking-wider truncate w-full block ${isTargetSelected ? "text-base-content drop-shadow-sm" : "text-base-content/20"}`}
              >
                {isTargetSelected ? s.targetItem : "---"}
              </h4>
            </div>

            {isTargetSelected && (
              <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-base-content/95 backdrop-blur-sm text-base-100 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest shadow-2xl opacity-0 pointer-events-none group-hover/targetCard:opacity-100 transition-all z-100 border border-base-content/10 whitespace-nowrap flex flex-col items-center">
                <span>{s.targetItem}</span>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-base-content/95 rotate-45"></div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="relative group/input">
            <label className="text-[9px] font-black opacity-50 mb-1.5 uppercase tracking-wider block">
              Target Quantity
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              className="w-full bg-base-content/5 border border-base-content/10 rounded-xl py-2.5 px-4 text-sm font-black outline-none focus:border-primary/50 focus:bg-primary/5 transition-all transform-gpu placeholder:opacity-30"
              value={s.targetCraft === 0 ? "" : s.targetCraft}
              onKeyDown={blockInvalidCharInt}
              onChange={(e) =>
                updateNumericValue(e.target.value, s.setTargetCraft)
              }
            />
            <LiveTooltip value={s.targetCraft} label="Units" />
          </div>
          <div>
            <label className="text-[9px] font-black opacity-50 mb-1.5 uppercase tracking-wider block">
              Output per Craft
            </label>
            <div className="w-full bg-base-content/2 border border-base-content/5 rounded-xl py-2.5 px-4 text-sm font-black opacity-40 cursor-not-allowed flex items-center gap-2 shadow-inner">
              <Layers size={14} /> {s.outputQty || 1}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Market & Fees Section */}
      <div className="space-y-4 pt-4 border-t border-base-content/5">
        <h3 className="text-[10px] font-black text-primary uppercase flex items-center gap-2 tracking-[0.2em] opacity-80">
          <Tag size={12} strokeWidth={2.5} /> Market & Fees
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative group/input">
            <label className="text-[9px] font-black opacity-50 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Coins size={10} className="text-success" /> Unit Price
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              className="w-full bg-base-content/5 border border-base-content/10 rounded-xl py-2.5 px-4 text-sm font-black outline-none focus:border-success/50 focus:bg-success/5 transition-all text-success transform-gpu placeholder:opacity-30"
              value={s.itemPrice === 0 ? "" : s.itemPrice}
              onKeyDown={blockInvalidCharInt}
              onChange={(e) =>
                updateNumericValue(e.target.value, s.setItemPrice)
              }
            />
            <LiveTooltip value={s.itemPrice} label="Silver" />
          </div>
          <div className="relative group/input">
            <label className="text-[9px] font-black opacity-50 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={10} className="text-info" /> Item Value
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              className="w-full bg-base-content/5 border border-base-content/10 rounded-xl py-2.5 px-4 text-sm font-black outline-none focus:border-info/50 focus:bg-info/5 transition-all text-info transform-gpu placeholder:opacity-30"
              value={s.itemValue === 0 ? "" : s.itemValue}
              onKeyDown={blockInvalidCharInt}
              onChange={(e) =>
                updateNumericValue(e.target.value, s.setItemValue)
              }
            />
            <LiveTooltip value={s.itemValue} label="Value" />
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-base-content/5">
        <h3 className="text-[10px] font-black text-primary uppercase flex items-center gap-2 tracking-[0.2em] opacity-80">
          <ShoppingCart size={12} strokeWidth={2.5} /> Market Status
        </h3>
        <div className="relative group/info">
          <div className="relative flex bg-base-content/5 rounded-xl p-1.5 border border-base-content/10 select-none shadow-inner">
            {["Direct", "Order"].map((status) => {
              const isActive = s.marketStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => s.setMarketStatus(status)}
                  className={`relative flex-1 text-[10px] font-black uppercase py-2 outline-none rounded-lg transition-colors duration-300 z-10 ${
                    isActive
                      ? "text-primary-content drop-shadow-sm"
                      : "opacity-40 hover:opacity-100 hover:bg-base-content/5 text-base-content"
                  }`}
                >
                  <span className="relative z-20">{status}</span>
                  {isActive && (
                    <motion.div
                      layoutId="marketStatusSlider"
                      className="absolute inset-0 bg-primary rounded-lg shadow-md z-0"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <InfoTooltip
            text={
              s.marketStatus === "Direct" ? "Setup Fee: 0%" : "Setup Fee: 2.5%"
            }
          />
        </div>

        <div className="mt-4 w-max relative group/info">
          <label className="flex items-center gap-3 cursor-pointer bg-base-content/5 hover:bg-base-content/10 border border-base-content/10 pr-4 pl-3 py-2 rounded-xl transition-colors">
            <input
              type="checkbox"
              className="toggle toggle-warning toggle-sm outline-none shadow-inner"
              checked={!!s.isPremium}
              onChange={(e) => s.setIsPremium(e.target.checked)}
            />
            <div className="flex items-center gap-1.5">
              <Crown
                size={14}
                className={
                  s.isPremium
                    ? "text-warning fill-warning/20 drop-shadow-[0_0_5px_rgba(var(--wa),0.5)]"
                    : "opacity-30"
                }
              />
              <span className="text-[10px] font-black uppercase opacity-60 transition-opacity flex items-center gap-1">
                Premium Bonus <Info size={12} className="opacity-50" />
              </span>
            </div>
          </label>
          <InfoTooltip
            text={s.isPremium ? "Market Tax: 4%" : "Market Tax: 8%"}
          />
        </div>
      </div>
    </div>
  );
};

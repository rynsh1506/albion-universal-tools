import { Percent, Factory, Zap, Database, Eye } from "lucide-react";
import { useCraftingStore } from "../store/useCraftingStore";
import {
  blockInvalidCharFloat,
  blockInvalidCharInt,
  cleanFloatString,
  cleanIntString,
  handleFloatBlurHelper,
} from "../utils/inputHelpers";

export const StrategyTabContent = ({ rrr }: { rrr: number }) => {
  const s = useCraftingStore();

  const displayRrr = isNaN(rrr)
    ? "0.00"
    : (Math.floor(rrr * 100) / 100).toFixed(2);

  const handleFocusBankInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cleanVal = cleanIntString(e.target.value);
    if (cleanVal === "") {
      s.setFocusBank(0);
      return;
    }
    let numVal = Number(cleanVal);
    if (numVal > 30000) numVal = 30000;

    s.setFocusBank(numVal);
  };

  const LiveTooltip = ({ value, label }: { value: any; label: string }) => {
    if (
      value === "" ||
      value === undefined ||
      value === null ||
      isNaN(Number(value))
    )
      return null;
    return (
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-primary-content px-3 py-1.5 rounded-lg text-[10px] font-black shadow-sm opacity-0 invisible pointer-events-none group-hover/input:opacity-100 group-hover/input:visible transition-opacity duration-100 z-100 flex items-center gap-2 border border-white/20 whitespace-nowrap overflow-hidden">
        <Eye size={12} /> {Number(value).toLocaleString("en-US")} {label}
      </div>
    );
  };

  return (
    <div className="space-y-6 text-base-content isolate">
      <div>
        <h3 className="text-[10px] font-black text-primary uppercase flex items-center gap-2 tracking-[0.2em] opacity-80 select-none mb-4">
          <Percent size={12} strokeWidth={2.5} /> RRR Modifiers
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Basic", val: s.basic, set: s.setBasic },
            { label: "Local", val: s.local, set: s.setLocal },
            { label: "Daily", val: s.daily, set: s.setDaily },
          ].map((item) => (
            <div key={item.label} className="group/input relative">
              <label className="text-[9px] font-black opacity-50 mb-1.5 uppercase tracking-wider block">
                {item.label}
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                className="w-full bg-base-content/5 border border-base-content/10 rounded-xl py-2 px-3 text-sm font-black outline-none focus:border-primary/50 focus:bg-primary/5 transition-colors duration-100 placeholder:opacity-30"
                value={item.val}
                onKeyDown={blockInvalidCharFloat}
                onChange={(e) => {
                  const cleaned = cleanFloatString(e.target.value);
                  item.set(Number(cleaned) || 0);
                }}
                onBlur={(e) => {
                  const cleaned = cleanFloatString(e.target.value);
                  item.set(Number(handleFloatBlurHelper(cleaned)) || 0);
                }}
              />
              <LiveTooltip value={item.val} label="Points" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-black text-primary uppercase flex items-center gap-2 tracking-[0.2em] opacity-80 select-none mb-4">
          <Factory size={12} strokeWidth={2.5} /> Fee & Efficiency
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="group/input relative">
            <label className="text-[9px] font-black opacity-50 mb-1.5 uppercase tracking-wider block">
              Station Fee
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              className="w-full bg-base-content/5 border border-base-content/10 rounded-xl py-2.5 px-4 text-sm font-black outline-none focus:border-primary/50 focus:bg-primary/5 transition-colors duration-100 placeholder:opacity-30"
              value={s.stationFee}
              onKeyDown={blockInvalidCharInt}
              onChange={(e) => {
                const cleaned = cleanIntString(e.target.value);
                s.setStationFee(Number(cleaned) || 0);
              }}
            />
            <LiveTooltip value={s.stationFee} label="Silver/100" />
          </div>
          <div className="group/input relative">
            <label className="text-[9px] font-black opacity-50 mb-1.5 uppercase tracking-wider block">
              Total RRR (%)
            </label>
            <div className="w-full bg-base-content/5 border border-base-content/10 rounded-xl py-2.5 px-4 text-sm text-primary font-black flex items-center cursor-help">
              {displayRrr}%
            </div>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-primary-content px-3 py-1.5 rounded-lg text-[10px] font-black opacity-0 invisible group-hover/input:opacity-100 group-hover/input:visible transition-opacity duration-100 z-100 border border-white/20 whitespace-nowrap shadow-sm">
              <Eye size={12} className="inline mr-2" />
              {displayRrr} %
            </div>
          </div>
        </div>

        <label className="w-full flex items-center justify-between cursor-pointer bg-base-content/5 hover:bg-base-content/10 border border-base-content/10 px-4 py-3 rounded-xl transition-colors duration-100 group">
          <span className="text-[10px] font-black uppercase opacity-70 flex items-center gap-2">
            <Zap
              size={14}
              className={
                s.useFocus ? "text-warning fill-warning/20" : "opacity-30"
              }
            />{" "}
            Use Focus?
          </span>
          <input
            type="checkbox"
            className="toggle toggle-warning toggle-sm"
            checked={!!s.useFocus}
            onChange={(e) => s.setUseFocus(e.target.checked)}
          />
        </label>

        {s.useFocus && (
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="group/input relative">
              <label className="text-[9px] font-black opacity-50 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={10} className="text-warning fill-warning" /> Focus
                Cost
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                className="w-full bg-warning/5 border border-warning/20 rounded-xl py-2.5 px-4 text-sm text-warning font-black outline-none focus:border-warning/50 transition-colors duration-100 placeholder:opacity-30"
                value={s.focusCost}
                onKeyDown={blockInvalidCharInt}
                onChange={(e) => s.setFocusCost(cleanIntString(e.target.value))}
              />
              <LiveTooltip value={s.focusCost} label="Focus/Item" />
            </div>
            <div className="group/input relative">
              <label className="text-[9px] font-black opacity-50 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Database size={10} className="text-success" /> Focus Bank
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                className="w-full bg-success/5 border border-success/30 rounded-xl py-2.5 px-4 text-sm text-success font-black outline-none focus:border-success/70 transition-colors duration-100 placeholder:opacity-30"
                value={s.focusBank}
                onKeyDown={blockInvalidCharInt}
                onChange={handleFocusBankInput}
              />
              <LiveTooltip value={s.focusBank} label="Points" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

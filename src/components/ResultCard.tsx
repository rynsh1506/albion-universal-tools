import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Copy,
  CheckCircle2,
  Info,
  AlertOctagon,
  Zap,
  Target,
  ShieldCheck,
  PackageSearch,
  Slash,
} from "lucide-react";

export default function ResultCard({ data }: any) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const totalProduced = data.totalProduced || 0;
  const isProfit = data.realProfit >= 0;

  const materialShortage = !!data.isMarketInsufficient;
  const focusShortage = !!data.isFocusInsufficient;

  const isWaiting =
    !data.name ||
    data.name === "---" ||
    data.name === "Select Item..." ||
    data.name === "";
  const isNonCraftable =
    !isWaiting && (!data.buyList || data.buyList.length === 0);
  const isDefaultStyle = isWaiting || isNonCraftable;

  const netProdCost = data.netProductionCost || 0;
  const breakEvenPrice =
    totalProduced > 0 ? Math.ceil(netProdCost / totalProduced) : 0;
  const recommendedPrice = Math.ceil(breakEvenPrice * 1.15);

  // --- PERBAIKAN: Kalkulasi dinamis untuk Cost / Item dan Profit / Item ---
  const costPerItem =
    data.costPerItem ||
    (totalProduced > 0 ? Math.ceil(netProdCost / totalProduced) : 0);
  const profitPerItem =
    data.profitPerItem ||
    (totalProduced > 0
      ? Math.floor((data.realProfit || 0) / totalProduced)
      : 0);

  const handleCopyReport = () => {
    if (isDefaultStyle) return;
    const reportText =
      `📊 ALBION CRAFTING REPORT: ${data.name}\n📦 Output: ${totalProduced.toLocaleString()} Units\n💰 Real Profit: ${data.realProfit.toLocaleString()} Silver\n📈 Net Margin: ${data.margin}%\n🛡️ Break-even: ${breakEvenPrice.toLocaleString()} Silver/Unit\n🚀 Recommended: ${recommendedPrice.toLocaleString()} Silver/Unit`.trim();
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SultanTooltip = ({
    title,
    tip,
  }: {
    title: string;
    tip: React.ReactNode;
  }) => (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3
                    bg-base-100/95 backdrop-blur-xl text-base-content p-4 rounded-2xl 
                    shadow-xl border border-base-content/10
                    opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible 
                    translate-y-1 group-hover/tip:translate-y-0 
                    transition-all duration-200 z-9999 w-max min-w-60 
                    origin-bottom pointer-events-none"
    >
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-base-100/95 rotate-45 border-b border-r border-base-content/10"></div>
      <p className="text-[10px] font-black uppercase text-primary mb-2 border-b border-base-content/10 pb-1.5 tracking-widest">
        {title}
      </p>
      <div className="text-[10px] font-bold opacity-90 leading-relaxed">
        {tip}
      </div>
    </div>
  );

  return (
    <div
      ref={cardRef}
      className="w-full relative space-y-6 select-none outline-none"
    >
      <div
        className={`relative z-10 px-7 py-5 flex justify-between items-center rounded-[1.75rem] border border-base-content/10 backdrop-blur-md transition-all duration-500 shadow-sm ${isDefaultStyle ? "bg-base-content/5" : isProfit ? "bg-success/10 border-success/20" : "bg-error/10 border-error/20"}`}
      >
        <div className="absolute inset-0 rounded-[1.75rem] overflow-hidden pointer-events-none">
          <div
            className={`absolute top-0 left-0 w-1.5 h-full ${isDefaultStyle ? "bg-base-content/20" : isProfit ? "bg-success" : "bg-error"}`}
          ></div>
        </div>

        <div className="flex items-center gap-6 z-10">
          <div
            className={`p-4 rounded-2xl shadow-sm transition-all duration-500 backdrop-blur-xl border border-white/5 ${
              isDefaultStyle
                ? "bg-base-content/10 text-base-content/50"
                : isProfit
                  ? "bg-success/20 text-success"
                  : "bg-error/20 text-error"
            }`}
          >
            {isNonCraftable ? (
              <Slash size={26} />
            ) : isDefaultStyle ? (
              <PackageSearch size={26} />
            ) : isProfit ? (
              <TrendingUp size={26} />
            ) : (
              <TrendingDown size={26} />
            )}
          </div>
          <div className={isDefaultStyle ? "opacity-40" : ""}>
            <h2 className="text-base font-black uppercase tracking-[0.15em] flex items-center gap-3">
              {isWaiting ? "---" : data.name}
              <span
                className={`font-black text-[10px] tracking-widest px-2.5 py-1 rounded-lg transition-all ${
                  isDefaultStyle
                    ? "bg-base-content/10 opacity-40"
                    : focusShortage && data.useFocus
                      ? "bg-warning text-warning-content"
                      : materialShortage
                        ? "bg-error text-error-content"
                        : "bg-base-content/10 opacity-40"
                }`}
              >
                {focusShortage && data.useFocus
                  ? "FOCUS LIMIT"
                  : materialShortage
                    ? "MATERIAL LIMIT"
                    : "OUT"}
                : {totalProduced.toLocaleString()}
              </span>
            </h2>
            <div className="flex gap-5 items-center mt-1">
              <span
                className={`text-2xl font-black tracking-tight transition-colors duration-500 ${!isDefaultStyle && (isProfit ? "text-success" : "text-error")}`}
              >
                {isProfit && !isDefaultStyle ? "+" : ""}
                {data.realProfit ? data.realProfit.toLocaleString() : "0"}{" "}
                <span className="text-xs opacity-50 uppercase tracking-widest ml-1">
                  Silver
                </span>
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-base-content/20"></div>
              <span className="text-base font-black tracking-wider text-info">
                MARGIN: {data.margin ? data.margin : "0"}%
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleCopyReport}
          disabled={isDefaultStyle}
          className="btn btn-ghost btn-square opacity-40 hover:opacity-100 transition-all text-base-content rounded-xl border-none shadow-none"
        >
          {copied ? (
            <CheckCircle2 size={20} className="text-success" />
          ) : (
            <Copy size={20} />
          )}
        </button>
      </div>

      <div className="z-0 flex flex-col gap-3">
        <AnimatePresence>
          {materialShortage && !isNonCraftable && (
            <motion.div
              key="warning-market"
              initial={{ height: 0, opacity: 0, y: -10, overflow: "hidden" }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{
                height: 0,
                opacity: 0,
                y: -10,
                transition: { duration: 0.2 },
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="bg-error/10 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 border border-error/20 shadow-sm">
                <AlertOctagon size={20} className="text-error" />
                <span className="text-[11px] font-black uppercase tracking-widest text-base-content">
                  Material limited to{" "}
                  <span className="text-error font-bold">
                    {data.marketLimitedQty}
                  </span>{" "}
                  crafts
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {focusShortage && !isNonCraftable && (
            <motion.div
              key="warning-focus"
              initial={{ height: 0, opacity: 0, y: -10, overflow: "hidden" }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{
                height: 0,
                opacity: 0,
                y: -10,
                transition: { duration: 0.2 },
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="bg-warning/10 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 border border-warning/20 shadow-sm">
                <AlertTriangle size={20} className="text-warning" />
                <span className="text-[11px] font-black uppercase tracking-widest text-base-content">
                  Focus points limited to{" "}
                  <span className="text-warning font-bold">
                    {data.focusLimitedQty}
                  </span>{" "}
                  crafts
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-4 gap-4 relative z-20">
        {[
          {
            label: "Net Margin",
            val: `${data.margin || 0}%`,
            color: "text-info",
            tip: "Total profit percentage after all fees",
          },
          {
            // --- PERBAIKAN: Menggunakan variabel profitPerItem yang sudah dikalkulasi ---
            label: "Profit / Item",
            val: `${profitPerItem.toLocaleString()} S`,
            color: isProfit ? "text-success" : "text-error",
            tip: "Net profit earned per single output item",
          },
          {
            // --- PERBAIKAN: Menggunakan variabel costPerItem yang sudah dikalkulasi ---
            label: "Cost / Item",
            val: `${costPerItem.toLocaleString()} S`,
            color: "text-warning",
            tip: "Production cost to make one output item",
          },
          {
            label: "Market Tax",
            val: `-${(data.marketFeeDeduction || 0).toLocaleString()} S`,
            color: "text-error",
            tip: "Total market setup and sales tax",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-base-200/40 backdrop-blur-md p-5 rounded-2xl border border-base-content/5 relative group/tip cursor-help hover:border-base-content/10 transition-all shadow-sm"
          >
            <div className={isDefaultStyle ? "opacity-30" : ""}>
              <p className="text-[10px] font-black uppercase opacity-40 mb-2 flex items-center gap-2">
                {stat.label} <Info size={11} />
              </p>
              <p className={`text-lg font-black tracking-tight ${stat.color}`}>
                {stat.val}
              </p>
            </div>
            <SultanTooltip title={stat.label} tip={stat.tip} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 relative z-30">
        {[
          {
            icon: <ShieldCheck size={18} />,
            label: "Break-even",
            val: breakEvenPrice || 0,
            color: "success",
            tip: "Minimum price to sell without loss",
          },
          {
            icon: <Target size={18} />,
            label: "Recommended",
            val: recommendedPrice || 0,
            color: "info",
            tip: "Target price for healthy 15% profit",
          },
          {
            icon: <Zap size={18} />,
            label: "Efficiency",
            val: data.silverPerFocus || 0,
            color: "warning",
            tip: "Silver earned per 1 focus spent",
          },
        ].map((box, i) => (
          <div
            key={i}
            className="bg-base-200/40 backdrop-blur-md p-6 rounded-2xl border border-base-content/5 relative group/tip cursor-help shadow-sm hover:border-base-content/10 transition-all"
          >
            <div className={isDefaultStyle ? "opacity-30" : ""}>
              <div className={`flex items-center gap-2 mb-3 text-${box.color}`}>
                <div className={`text-${box.color}`}>{box.icon}</div>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {box.label}
                </span>
              </div>
              <p
                className={`text-2xl font-black tracking-tighter text-${box.color}`}
              >
                {box.val.toLocaleString()}{" "}
                <span className="text-[10px] opacity-50 font-bold ml-1">
                  S/U
                </span>
              </p>
            </div>
            <SultanTooltip title={box.label} tip={box.tip} />
          </div>
        ))}
      </div>

      <div className="relative z-0 border border-base-content/10 rounded-3xl bg-base-200/20 backdrop-blur-sm overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left border-collapse border-none">
          <thead className="bg-base-content/5 text-[10px] font-black uppercase opacity-40 tracking-[0.2em] border-b border-base-content/5">
            <tr>
              <th className="px-6 py-4 border-none font-black">Item Name</th>
              <th className="px-6 py-4 text-right border-none font-black">
                To Buy
              </th>
              <th className="px-6 py-4 text-right border-none font-black">
                In Bag
              </th>
              <th className="px-6 py-4 text-right border-none font-black">
                Mkt Stk
              </th>
              <th className="px-6 py-4 text-right border-none font-black">
                Cost
              </th>
            </tr>
          </thead>
          <tbody className="font-bold border-none">
            {isDefaultStyle ? (
              <tr className="border-none">
                <td
                  colSpan={5}
                  className={`px-6 py-10 text-center border-none ${isNonCraftable ? "bg-error/5 text-error animate-pulse" : "text-base-content/20"}`}
                >
                  {isNonCraftable
                    ? "ITEM IS NON-CRAFTABLE (NO RECIPE)"
                    : "AWAITING ITEM SELECTION..."}
                </td>
              </tr>
            ) : (
              data.buyList.map((m: any) => (
                <tr
                  key={m.name}
                  className="border-b border-base-content/5 last:border-none hover:bg-base-content/5 transition-all"
                >
                  <td className="px-6 py-4 text-info font-black truncate max-w-56 border-none">
                    {m.name}
                  </td>
                  <td className="px-6 py-4 text-right text-error border-none">
                    {m.qtyToBuy.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-success border-none">
                    {m.stock.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right opacity-30 italic font-medium border-none">
                    {m.marketStock > 0 ? m.marketStock.toLocaleString() : "∞"}
                  </td>
                  <td className="px-6 py-4 text-right text-warning border-none">
                    {m.cost.toLocaleString()} S
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-8 relative z-40">
        <div className="relative group/tip">
          <div className="p-6 bg-base-content/5 backdrop-blur-md rounded-3xl border border-base-content/5 flex justify-between items-center shadow-sm hover:bg-base-content/10 transition-all cursor-help">
            <span
              className={`text-[10px] font-black uppercase opacity-60 tracking-[0.15em] ${isDefaultStyle ? "opacity-20" : ""}`}
            >
              Total Production Cost
            </span>
            <span
              className={`text-xl font-black tracking-tighter ${isDefaultStyle ? "opacity-20" : "text-warning"}`}
            >
              {(data.netProductionCost || 0).toLocaleString()}{" "}
              <span className="text-xs opacity-50 ml-1 font-bold">Silver</span>
            </span>
          </div>
          <SultanTooltip
            title="Cost Breakdown"
            tip={
              <div className="space-y-1.5 min-w-45">
                <div className="flex justify-between">
                  <span>Materials:</span>
                  <span className="text-warning font-black">
                    {(data.totalMaterialCost || 0).toLocaleString()} S
                  </span>
                </div>
                <div className="flex justify-between border-t border-base-content/10 pt-1">
                  <span>Station Fee:</span>
                  <span className="text-warning font-black">
                    {(data.totalTaxCost || 0).toLocaleString()} S
                  </span>
                </div>
              </div>
            }
          />
        </div>

        <div className="relative group/tip">
          <div className="p-6 bg-base-content/5 backdrop-blur-md rounded-3xl border border-base-content/5 flex justify-between items-center shadow-sm hover:bg-base-content/10 transition-all cursor-help">
            <span
              className={`text-[10px] font-black uppercase opacity-60 tracking-[0.15em] ${isDefaultStyle ? "opacity-20" : ""}`}
            >
              Net Revenue After Tax
            </span>
            <span
              className={`text-xl font-black tracking-tighter ${isDefaultStyle ? "opacity-20" : "text-info"}`}
            >
              {(data.totalRevenue || 0).toLocaleString()}{" "}
              <span className="text-xs opacity-50 ml-1 font-bold">Silver</span>
            </span>
          </div>
          <SultanTooltip
            title="Revenue Breakdown"
            tip={
              <div className="space-y-1.5 min-w-45">
                <div className="flex justify-between">
                  <span>Gross Sales:</span>
                  <span className="text-info font-black">
                    {(data.grossRevenue || 0).toLocaleString()} S
                  </span>
                </div>
                <div className="flex justify-between border-t border-base-content/10 pt-1">
                  <span>Market Tax:</span>
                  <span className="text-error font-black">
                    -{(data.marketFeeDeduction || 0).toLocaleString()} S
                  </span>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}

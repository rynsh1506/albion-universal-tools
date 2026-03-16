import { useRef, useState } from "react";
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
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-base-200 text-base-content p-4 rounded-2xl shadow-xl border border-base-content/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-100 z-9999 w-max min-w-60 origin-bottom pointer-events-none lg:block hidden">
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-base-200 rotate-45 border-b border-r border-base-content/10"></div>
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
        className={`relative z-10 px-4 py-4 md:px-7 md:py-5 flex flex-col md:flex-row md:justify-between md:items-center rounded-[1.75rem] border border-base-content/10 shadow-sm gap-4 ${isDefaultStyle ? "bg-base-content/5" : isProfit ? "bg-success/10 border-success/20" : "bg-error/10 border-error/20"}`}
      >
        <div className="absolute inset-0 rounded-[1.75rem] overflow-hidden pointer-events-none">
          <div
            className={`absolute top-0 left-0 w-1.5 h-full ${isDefaultStyle ? "bg-base-content/20" : isProfit ? "bg-success" : "bg-error"}`}
          ></div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 z-10 overflow-hidden">
          <div
            className={`p-3 md:p-4 rounded-2xl shadow-sm border border-white/5 shrink-0 ${isDefaultStyle ? "bg-base-content/10 text-base-content/50" : isProfit ? "bg-success/20 text-success" : "bg-error/20 text-error"}`}
          >
            {isNonCraftable ? (
              <Slash size={24} />
            ) : isDefaultStyle ? (
              <PackageSearch size={24} />
            ) : isProfit ? (
              <TrendingUp size={24} />
            ) : (
              <TrendingDown size={24} />
            )}
          </div>

          <div
            className={`min-w-0 flex-1 ${isDefaultStyle ? "opacity-40" : ""}`}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h2 className="text-sm md:text-base font-black uppercase tracking-widest leading-tight md:leading-none md:truncate md:max-w-62.5 lg:max-w-none pr-6 md:pr-0">
                {isWaiting ? "---" : data.name}
              </h2>
              <span
                className={`w-fit font-black text-[9px] px-2 py-0.5 rounded-lg whitespace-nowrap ${isDefaultStyle ? "bg-base-content/10 opacity-40" : focusShortage && data.useFocus ? "bg-warning text-warning-content" : materialShortage ? "bg-error text-error-content" : "bg-base-content/10 opacity-40"}`}
              >
                {focusShortage && data.useFocus
                  ? "FOCUS"
                  : materialShortage
                    ? "MAT"
                    : "OUT"}
                : {totalProduced.toLocaleString()}
              </span>
            </div>

            <div className="mt-2 md:mt-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-5">
              <span
                className={`text-xl md:text-2xl font-black tracking-tight leading-none ${!isDefaultStyle && (isProfit ? "text-success" : "text-error")}`}
              >
                {isProfit && !isDefaultStyle ? "+" : ""}
                {data.realProfit ? data.realProfit.toLocaleString() : "0"}
                <span className="text-[10px] opacity-50 uppercase ml-1.5 font-bold">
                  Silver
                </span>
              </span>
              <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-base-content/20"></div>
              <span className="text-xs md:text-base font-black tracking-wider text-info leading-none">
                MARGIN: {data.margin ? data.margin : "0"}%
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCopyReport}
          disabled={isDefaultStyle}
          className="absolute top-4 right-4 md:static btn btn-ghost btn-square opacity-40 hover:opacity-100 text-base-content rounded-xl border-none shadow-none z-20"
        >
          {copied ? (
            <CheckCircle2 size={18} className="text-success" />
          ) : (
            <Copy size={18} />
          )}
        </button>
      </div>

      <div className="z-0 flex flex-col gap-2">
        {materialShortage && !isNonCraftable && (
          <div className="bg-error/10 p-3 rounded-2xl flex items-center gap-3 border border-error/20 shadow-sm">
            <AlertOctagon size={16} className="text-error shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-normal">
              Mat limit:{" "}
              <span className="text-error font-bold">
                {data.marketLimitedQty.toLocaleString()}
              </span>{" "}
              crafts
            </span>
          </div>
        )}
        {focusShortage && !isNonCraftable && (
          <div className="bg-warning/10 p-3 rounded-2xl flex items-center gap-3 border border-warning/20 shadow-sm">
            <AlertTriangle size={16} className="text-warning shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-normal">
              Focus limit:{" "}
              <span className="text-warning font-bold">
                {data.focusLimitedQty.toLocaleString()}
              </span>{" "}
              crafts
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative z-20">
        {[
          {
            label: "Net Margin",
            val: `${data.margin || 0}%`,
            color: "text-info",
            tip: "Total profit percentage after all fees",
          },
          {
            label: "Profit / Item",
            val: `${profitPerItem.toLocaleString()} S`,
            color: isProfit ? "text-success" : "text-error",
            tip: "Net profit earned per single output item",
          },
          {
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
            className="bg-base-200/90 p-3 md:p-5 rounded-2xl border border-base-content/5 relative group cursor-help shadow-sm overflow-visible"
          >
            <div className={isDefaultStyle ? "opacity-30" : ""}>
              <p className="text-[8px] md:text-[10px] font-black uppercase opacity-40 mb-1 flex items-center gap-1.5 truncate">
                {stat.label} <Info size={10} className="md:block hidden" />
              </p>
              <p
                className={`text-xs md:text-lg font-black tracking-tight truncate ${stat.color}`}
              >
                {stat.val}
              </p>
            </div>
            <SultanTooltip title={stat.label} tip={stat.tip} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 relative z-30">
        {[
          {
            icon: <ShieldCheck size={16} />,
            label: "Break-even",
            val: breakEvenPrice || 0,
            color: "success",
            tip: "Minimum price to sell without loss",
          },
          {
            icon: <Target size={16} />,
            label: "Recommended",
            val: recommendedPrice || 0,
            color: "info",
            tip: "Target price for healthy 15% profit",
          },
          {
            icon: <Zap size={16} />,
            label: "Efficiency",
            val: data.silverPerFocus || 0,
            color: "warning",
            tip: "Silver earned per 1 focus spent",
          },
        ].map((box, i) => (
          <div
            key={i}
            className="bg-base-200/90 p-4 md:p-6 rounded-2xl border border-base-content/5 relative group cursor-help shadow-sm flex md:block items-center justify-between gap-2 overflow-visible"
          >
            <div
              className={
                isDefaultStyle
                  ? "opacity-30"
                  : "flex md:block items-center gap-2"
              }
            >
              <div
                className={`flex items-center gap-2 text-${box.color} md:mb-2`}
              >
                {box.icon}
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                  {box.label}
                </span>
              </div>
              <p
                className={`text-lg md:text-2xl font-black tracking-tighter text-${box.color}`}
              >
                {box.val.toLocaleString()}{" "}
                <span className="text-[9px] opacity-50 font-bold ml-1">
                  S/U
                </span>
              </p>
            </div>
            <SultanTooltip title={box.label} tip={box.tip} />
          </div>
        ))}
      </div>

      <div className="relative z-0 border border-base-content/10 rounded-3xl bg-base-200/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-112.5 md:min-w-full text-xs text-left border-collapse border-none">
            <thead className="bg-base-content/5 text-[9px] font-black uppercase opacity-40 tracking-widest border-b border-base-content/5">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4 font-black">Item</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right font-black">
                  Buy
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right font-black">
                  Bag
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right font-black">
                  Mkt
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right font-black">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="font-bold">
              {isWaiting ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 md:py-10 text-center opacity-20 uppercase tracking-widest text-[10px]"
                  >
                    Awaiting selection
                  </td>
                </tr>
              ) : isNonCraftable ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 md:py-10 text-center border-none bg-error/5 text-error animate-pulse uppercase tracking-widest text-[10px] font-black leading-relaxed"
                  >
                    <span className="block md:inline">
                      Item is Non-Craftable
                    </span>
                    <span className="block md:inline md:ml-1">
                      (No Recipe Found)
                    </span>
                  </td>
                </tr>
              ) : (
                data.buyList.map((m: any) => (
                  <tr
                    key={m.name}
                    className="border-b border-base-content/5 last:border-none hover:bg-base-content/5"
                  >
                    <td className="px-4 md:px-6 py-3 md:py-4 text-info font-black truncate max-w-27.5 md:max-w-none">
                      {m.name}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right text-error">
                      {m.qtyToBuy.toLocaleString()}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right text-success">
                      {m.stock.toLocaleString()}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right opacity-30">
                      {m.marketStock > 0 ? m.marketStock.toLocaleString() : "∞"}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right text-warning whitespace-nowrap">
                      {m.cost.toLocaleString()} S
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8 relative z-40">
        {[
          {
            label: "Total Production Cost",
            val: data.netProductionCost || 0,
            color: "warning",
            tip: `Materials: ${(data.totalMaterialCost || 0).toLocaleString()} S / Tax: ${(data.totalTaxCost || 0).toLocaleString()} S`,
          },
          {
            label: "Net Revenue After Tax",
            val: data.totalRevenue || 0,
            color: "info",
            tip: `Gross: ${(data.grossRevenue || 0).toLocaleString()} S / Market Tax: -${(data.marketFeeDeduction || 0).toLocaleString()} S`,
          },
        ].map((sum, i) => (
          <div
            key={i}
            className="group p-4 md:p-6 bg-base-content/5 rounded-3xl border border-base-content/5 flex items-center justify-between shadow-sm relative cursor-help overflow-visible"
          >
            <span
              className={`text-[9px] font-black uppercase opacity-60 tracking-widest max-w-25 md:max-w-none leading-tight ${isDefaultStyle ? "opacity-20" : ""}`}
            >
              {sum.label}
            </span>
            <span
              className={`text-lg md:text-xl font-black tracking-tighter whitespace-nowrap ${isDefaultStyle ? "opacity-20" : `text-${sum.color}`}`}
            >
              {sum.val.toLocaleString()}{" "}
              <span className="text-[9px] opacity-50 ml-1 font-bold">
                Silver
              </span>
            </span>
            <SultanTooltip title={sum.label} tip={sum.tip} />
          </div>
        ))}
      </div>
    </div>
  );
}

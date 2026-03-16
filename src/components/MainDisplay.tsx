import { useState } from "react";
import ResultCard from "./ResultCard";
import { Rocket } from "lucide-react";

export default function MainDisplay({ result }: any) {
  const [activeView, setActiveView] = useState("crafting");

  const defaultData = {
    name: "---",
    totalProduced: 0,
    realProfit: 0,
    margin: 0,
    netProductionCost: 0,
    totalRevenue: 0,
    marketFeeDeduction: 0,
    buyList: [],
    useFocus: false,
    silverPerFocus: 0,
    totalMaterialCost: 0,
    totalTaxCost: 0,
    grossRevenue: 0,
  };

  const displayData = result || defaultData;

  return (
    <main className="flex-1 bg-base-300 flex flex-col relative h-full overflow-hidden isolate">
      <div className="flex justify-center pt-6 pb-2 shrink-0 z-30 relative">
        <div className="relative flex bg-base-200 rounded-full p-1 border border-base-content/10 w-72 shadow-sm">
          {["crafting", "salvage", "market"].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-1.5 text-[9px] font-black uppercase rounded-full outline-none transition-colors duration-100 ${
                activeView === view
                  ? "text-primary-content bg-primary shadow-sm"
                  : "text-base-content opacity-50 hover:opacity-100 hover:bg-base-content/5"
              }`}
            >
              <span className="relative z-20">{view}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pl-5 md:pl-12 pr-2 md:pr-10 pt-4 md:pt-10 pb-10">
        {activeView === "crafting" ? (
          <ResultCard data={displayData} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Rocket size={48} />
            <p className="text-[10px] font-black mt-4 tracking-[0.3em] uppercase">
              Module Locked
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

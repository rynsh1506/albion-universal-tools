import { useState } from "react";
import ResultCard from "./ResultCard";
import { Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <main className="flex-1 bg-base-300/50 flex flex-col relative h-full overflow-hidden isolate">
      <div className="flex justify-center pt-6 pb-2 shrink-0 z-30 relative">
        <div className="relative flex bg-base-content/5 backdrop-blur-md rounded-full p-1 border border-base-content/10 w-72 shadow-lg">
          {["crafting", "salvage", "market"].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-1.5 text-[9px] font-black uppercase transition-all rounded-full ${
                activeView === view
                  ? "text-white"
                  : "text-base-content opacity-30 hover:opacity-100"
              }`}
            >
              <span className="relative z-20">{view}</span>
              {activeView === view && (
                <motion.div
                  layoutId="tabBg"
                  className="absolute inset-0 rounded-full bg-primary/90 z-0"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pt-4 pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeView === "crafting" ? (
              <ResultCard data={displayData} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <Rocket size={48} />
                <p className="text-[10px] font-black mt-4 tracking-[0.3em] uppercase">
                  Module Locked
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

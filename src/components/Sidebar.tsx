import { StrategyTabContent } from "./StrategyTabContent";
import { BatchTabContent } from "./BatchTabContent";
import MaterialCard from "./MaterialCard";
import {
  Moon,
  Sun,
  RefreshCw,
  Trash2,
  Hammer,
  Swords,
  Anvil,
  Loader2,
  ClipboardList,
  Package,
} from "lucide-react";
import { useCraftingStore } from "../store/useCraftingStore";

export const Sidebar = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  openSearchModal,
  openCalcModal,
  onClear,
  isLoading,
  onSync,
  syncProgress,
  rrr,
  imageDirPath,
}: any) => {
  const s = useCraftingStore();

  const ActionTooltip = ({
    text,
    position = "top",
  }: {
    text: string;
    position?: "top" | "bottom";
  }) => (
    <div
      className={`absolute ${position === "top" ? "-top-10" : "-bottom-10"} left-1/2 -translate-x-1/2 bg-base-content text-base-100 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide shadow-xl opacity-0 ${position === "top" ? "translate-y-2" : "-translate-y-2"} pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-opacity duration-100 z-100 border border-base-content/10 whitespace-nowrap flex flex-col items-center`}
    >
      {position === "bottom" && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-base-content rotate-45"></div>
      )}
      <span>{text}</span>
      {position === "top" && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-base-content rotate-45"></div>
      )}
    </div>
  );

  const TAB_LIST = ["Batch", "Strategy", "Recipe"];

  return (
    <aside className="w-95 h-full flex flex-col bg-base-200 border-r border-base-content/5 z-20 shrink-0 shadow-[5px_0_30px_rgba(0,0,0,0.1)]">
      <div className="p-6 pb-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 shadow-sm transition-colors group-hover:bg-primary/20">
              <Swords size={24} className="text-primary stroke-[1.5px]" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-[9px] font-black tracking-[0.25em] text-primary uppercase leading-none mb-1 opacity-80">
                Avalonian
              </h1>
              <h1 className="text-lg font-black tracking-tighter select-none text-base-content leading-none">
                TOOLS
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative group">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl bg-base-content/5 border border-base-content/10 hover:border-primary/30 hover:bg-base-content/10 active:scale-95 outline-none flex items-center justify-center"
              >
                {isDarkMode ? (
                  <Moon size={16} className="text-primary fill-primary/20" />
                ) : (
                  <Sun size={16} className="text-warning fill-warning/20" />
                )}
              </button>
              <ActionTooltip
                text={isDarkMode ? "Light Mode" : "Dark Mode"}
                position="bottom"
              />
            </div>
            <div className="relative group">
              <button
                onClick={() => s.setIsSalvage(!s.isSalvage)}
                className={`p-2 rounded-xl border active:scale-95 outline-none flex items-center justify-center ${s.isSalvage ? "bg-secondary/20 border-secondary/50 text-secondary shadow-sm" : "bg-base-content/5 border-base-content/10 text-base-content/40 hover:text-base-content/80 hover:bg-base-content/10"}`}
              >
                {s.isSalvage ? (
                  <Anvil size={16} className="fill-secondary/20" />
                ) : (
                  <Hammer size={16} />
                )}
              </button>
              <ActionTooltip
                text={s.isSalvage ? "Mode: Salvage" : "Mode: Crafting"}
                position="bottom"
              />
            </div>
          </div>
        </div>

        <div className="relative flex bg-base-content/5 rounded-xl p-1 border border-base-content/5 select-none shadow-inner">
          <div
            className="absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-primary rounded-lg shadow-sm transition-all duration-200 ease-out"
            style={{
              transform: `translateX(${TAB_LIST.indexOf(activeTab) * 100}%)`,
              left: "4px",
            }}
          />
          {TAB_LIST.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative z-10 flex-1 text-[10px] font-black uppercase py-2.5 outline-none select-none rounded-lg ${activeTab === tab ? "text-primary-content drop-shadow-sm" : "text-base-content opacity-50 hover:opacity-100 hover:bg-base-content/5"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto overflow-x-hidden px-6 pb-5 pt-2 custom-scrollbar relative">
          <div className="h-full">
            {activeTab === "Batch" && (
              <BatchTabContent
                openSearchModal={openSearchModal}
                imageDirPath={imageDirPath}
              />
            )}

            {activeTab === "Strategy" && <StrategyTabContent rrr={rrr} />}

            {activeTab === "Recipe" && (
              <div className="space-y-4 text-base-content">
                <div>
                  <h3 className="text-[10px] font-black text-primary uppercase mb-3 select-none flex items-center gap-2 tracking-widest opacity-80">
                    <ClipboardList size={12} strokeWidth={2.5} /> Material List
                    ({s.materials?.length || 0})
                  </h3>

                  <div className="space-y-1">
                    {s.materials && s.materials.length > 0 ? (
                      s.materials.map((mat: any) => (
                        <MaterialCard
                          key={mat.id}
                          mat={mat}
                          onOpenCalc={() => openCalcModal?.(mat.id)}
                          imageDirPath={imageDirPath}
                        />
                      ))
                    ) : (
                      <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-base-content/10 rounded-2xl opacity-40 select-none bg-base-content/5">
                        <Package size={28} className="mb-3 opacity-50" />
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          No Materials Yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-base-content/5 bg-base-200">
        <div className="flex gap-3">
          <div className="relative group flex-1">
            <button
              onClick={onSync}
              disabled={isLoading}
              className="relative w-full bg-base-content/5 border border-base-content/10 text-[10px] font-black uppercase py-3.5 rounded-xl hover:bg-base-content/10 outline-none active:scale-95 flex items-center justify-center gap-2 overflow-hidden"
            >
              {isLoading && (
                <div
                  className="absolute left-0 top-0 h-full bg-primary/20 z-0 transition-all duration-200"
                  style={{ width: `${syncProgress}%` }}
                />
              )}
              <div className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <Loader2 size={12} className="animate-spin text-primary" />
                ) : (
                  <RefreshCw size={12} className="opacity-70" />
                )}
                <span>
                  {isLoading
                    ? `Syncing ${Math.round(syncProgress)}%`
                    : "API Sync"}
                </span>
              </div>
            </button>
          </div>
          <div className="relative group flex-[0.5]">
            <button
              onClick={(e) => {
                e.preventDefault();
                onClear();
              }}
              className="w-full bg-error/5 border border-error/20 text-error text-[10px] font-black uppercase py-3.5 rounded-xl hover:bg-error/10 hover:border-error/40 outline-none active:scale-95 flex items-center justify-center gap-2"
            >
              <Trash2 size={12} /> Clear
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Sidebar } from "./components/Sidebar";
import MainDisplay from "./components/MainDisplay";
import { SearchModal } from "./components/SearchModal";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { useCraftingStore } from "./store/useCraftingStore";
import AveragePriceModal from "./components/AveragePriceModal";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function App() {
  const s = useCraftingStore();

  const [calcModalMatId, setCalcModalMatId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("Batch");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [imageDirPath, setImageDirPath] = useState("");

  const [isCalculating, setIsCalculating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [activeResult, setActiveResult] = useState<any>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [notification, setNotification] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotif = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    let unlisten: any;
    async function setupApp() {
      unlisten = await listen<number>("sync-progress", (e) =>
        setSyncProgress(e.payload),
      );
      try {
        const path = await invoke<string>("get_image_dir_path");
        setImageDirPath(path);
      } catch (err) {
        console.error("Failed to get image path:", err);
      }

      await getCurrentWindow().show();
    }
    setupApp();
    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  const executeCalculation = async () => {
    if (!s.targetItem || s.targetCraft <= 0 || isSyncing) return;

    setIsCalculating(true);
    try {
      const payload = {
        itemName: s.targetItem,
        materialsList: s.materials.map((m) => ({
          ...m,
          price: Number(m.price) || 0,
          qtyFromStock: Number(m.qtyFromStock) || 0,
          marketStock: Number(m.marketStock) || 0,
        })),
        targetActualCraft: Number(s.targetCraft),
        outputQtyPerCraft: Number(s.outputQty),
        sellPrice: Number(s.itemPrice),
        itemValue: Number(s.itemValue),
        stationFee: Number(s.stationFee),
        rrrPercentage: s.getRRR(),
        isPremium: s.isPremium,
        sellMethod: s.marketStatus.toLowerCase(),
        useFocus: s.useFocus,
        focusCost: Number(s.focusCost),
        focusPool: Number(s.focusBank) || 0,
      };

      const res: any = await invoke("calculate_crafting", { request: payload });
      setActiveResult(res);
    } catch (err) {
      console.error("Calculation error:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  const materialsStr = JSON.stringify(s.materials);
  const currentRRR = s.getRRR();

  useEffect(() => {
    if (!s.targetItem || s.targetItem === "---" || isSyncing) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      executeCalculation();
    }, 200);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [
    s.targetItem,
    s.targetCraft,
    s.itemPrice,
    s.itemValue,
    s.marketStatus,
    s.isPremium,
    s.useFocus,
    s.stationFee,
    s.focusCost,
    s.focusBank,
    materialsStr,
    currentRRR,
    isSyncing,
  ]);

  const handleSyncDatabase = async () => {
    if (isCalculating || isSyncing) return;

    setIsSyncing(true);
    setSyncProgress(0);
    try {
      const msg = await invoke<string>("sync_database");
      showNotif(msg, "success");
    } catch (err: any) {
      showNotif(err.toString(), "error");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      data-theme={isDarkMode ? "dark" : "light"}
      className="h-screen w-screen flex overflow-hidden font-sans bg-base-300 text-base-content transition-colors duration-300 isolate relative"
    >
      <AnimatePresence>
        {notification && (
          <div className="fixed top-0 left-0 w-full flex justify-center z-999 pointer-events-none">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 24, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className={`px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center justify-center gap-3 w-max max-w-[90vw] pointer-events-auto ${
                notification.type === "success"
                  ? "bg-success/10 border-success/30 text-success"
                  : "bg-error/10 border-error/30 text-error"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <XCircle size={18} />
              )}
              <span className="text-xs font-black uppercase tracking-widest text-center">
                {notification.msg}
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {calcModalMatId && (
          <AveragePriceModal
            matId={calcModalMatId}
            onClose={() => setCalcModalMatId(null)}
          />
        )}
      </AnimatePresence>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        openSearchModal={() => setIsSearchOpen(true)}
        onCalculate={executeCalculation}
        onClear={() => {
          s.clearCrafting();
          setActiveResult(null);
        }}
        openCalcModal={(matId: string) => setCalcModalMatId(matId)}
        isLoading={isCalculating || isSyncing}
        rrr={s.getRRR()}
        onSync={handleSyncDatabase}
        syncProgress={syncProgress}
        imageDirPath={imageDirPath}
      />

      <MainDisplay
        result={activeResult}
        onDelete={() => setActiveResult(null)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        imageDirPath={imageDirPath}
        onSelectItem={(item: any) => {
          s.selectItem(item);
          setIsSearchOpen(false);
        }}
      />
    </div>
  );
}

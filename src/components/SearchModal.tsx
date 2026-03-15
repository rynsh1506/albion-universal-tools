import { useState, useEffect, useMemo, useRef } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import {
  Search,
  X,
  Filter,
  AlertCircle,
  CornerDownLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Loader2,
  Swords,
  Shield,
  Package,
} from "lucide-react";
import { useCraftingStore } from "../store/useCraftingStore";

const CustomDropdown = ({ label, options, value, onChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-4 bg-base-content/5 border border-base-content/10 hover:border-primary/50 hover:bg-primary/5 px-5 py-3 rounded-2xl text-xs font-black text-base-content transition-colors min-w-37.5 shadow-sm active:scale-95 outline-none"
      >
        <span className="uppercase tracking-widest opacity-80">
          {value === "All" ? label : `${label}: ${value}`}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-100 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-base-200 border border-base-content/10 rounded-2xl shadow-xl z-50 overflow-hidden py-2 animate-in fade-in duration-100">
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {["All", ...options.map((o: any) => o.val)].map((optVal, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onChange(optVal);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3 text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-colors outline-none ${value === optVal ? "text-primary bg-primary/5" : "text-base-content/60"}`}
                >
                  {optVal === "All"
                    ? `All ${label}`
                    : options.find((o: any) => o.val === optVal)?.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const FallbackImage = ({ src, alt, itemName, isSelected }: any) => {
  const [imgFailed, setImgFailed] = useState(false);
  const containerClass =
    "w-16 h-16 flex items-center justify-center shrink-0 overflow-hidden";

  if (imgFailed || !src) {
    const nameLower = itemName.toLowerCase();
    const iconClass = `w-14 h-14 opacity-50 ${isSelected ? "text-primary-content" : "text-base-content"}`;
    return (
      <div className={containerClass}>
        {nameLower.includes("sword") ||
        nameLower.includes("axe") ||
        nameLower.includes("bow") ||
        nameLower.includes("staff") ? (
          <Swords className={iconClass} />
        ) : nameLower.includes("armor") ||
          nameLower.includes("helmet") ||
          nameLower.includes("shoes") ||
          nameLower.includes("shield") ? (
          <Shield className={iconClass} />
        ) : (
          <Package className={iconClass} />
        )}
      </div>
    );
  }
  return (
    <div className={containerClass}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        onError={() => setImgFailed(true)}
      />
    </div>
  );
};

export const SearchModal = ({ isOpen, onClose, imageDirPath }: any) => {
  const s = useCraftingStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const itemsPerPage = 6;
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchItems = async () => {
    setIsSearching(true);
    try {
      const res = await invoke<any[]>("search_items", {
        query: s.searchQuery,
        tier: s.tierFilter === "All" ? "" : s.tierFilter,
        enchant: s.enchantFilter === "All" ? "" : s.enchantFilter,
      });
      s.setSearchResults(res || []);
    } catch (err) {
      console.error("Search API failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    s.setSearchQuery("");
    s.setTierFilter("All");
    s.setEnchantFilter("All");
    s.setSearchPage(1);
    setSelectedIndex(0);
  };

  const getImgUrl = (itemId: string) => {
    if (!imageDirPath || !itemId) return "";
    const cleanItemId = itemId.replace(/^[\\/]+/, "");
    return convertFileSrc(`${imageDirPath}/${cleanItemId}.webp`);
  };

  useEffect(() => {
    if (!isOpen) return;
    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [s.searchQuery, s.tierFilter, s.enchantFilter, isOpen]);

  const paginatedItems = useMemo(() => {
    const start = (s.searchPage - 1) * itemsPerPage;
    return s.searchResults.slice(start, start + itemsPerPage);
  }, [s.searchResults, s.searchPage]);

  const totalPages = Math.ceil(s.searchResults.length / itemsPerPage);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => {
    s.setSearchPage(1);
    setSelectedIndex(0);
  }, [s.searchResults.length]);

  // Reset selected index and scroll to top when page changes
  useEffect(() => {
    setSelectedIndex(0);
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
  }, [s.searchPage]);

  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement === inputRef.current;
      const cursorAtEnd = inputRef.current
        ? inputRef.current.selectionStart === s.searchQuery.length
        : true;
      const cursorAtStart = inputRef.current
        ? inputRef.current.selectionStart === 0
        : true;

      if (
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !isInputFocused
      ) {
        inputRef.current?.focus();
      }

      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, paginatedItems.length - 1),
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (selectedIndex === 0) inputRef.current?.focus();
        else setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "ArrowRight") {
        if (!isInputFocused || selectedIndex > 0 || cursorAtEnd) {
          if (s.searchPage < totalPages) {
            e.preventDefault();
            s.setSearchPage(s.searchPage + 1);
          }
        }
      } else if (e.key === "ArrowLeft") {
        if (!isInputFocused || selectedIndex > 0 || cursorAtStart) {
          if (s.searchPage > 1) {
            e.preventDefault();
            s.setSearchPage(s.searchPage - 1);
          }
        }
      } else if (e.key === "Enter" && paginatedItems.length > 0) {
        e.preventDefault();
        s.selectItem(paginatedItems[selectedIndex]);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [
    isOpen,
    selectedIndex,
    paginatedItems,
    s.searchPage,
    totalPages,
    s.searchQuery,
    onClose,
    s,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-6 isolate">
      <div className="absolute inset-0 bg-base-300/95" onClick={onClose} />

      <div
        className="relative bg-base-200 w-full max-w-4xl h-[80vh] rounded-4xl border border-base-content/10 shadow-2xl overflow-hidden flex flex-col z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 pb-4 flex items-center gap-6">
          {isSearching ? (
            <Loader2 size={32} className="text-primary animate-spin" />
          ) : (
            <Search size={32} className="text-primary opacity-80" />
          )}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Albion Database..."
            className="w-full bg-transparent border-none outline-none text-3xl font-black text-base-content placeholder:opacity-10"
            value={s.searchQuery}
            onChange={(e) => s.setSearchQuery(e.target.value)}
          />
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle opacity-40 hover:opacity-100 outline-none"
          >
            <X size={28} />
          </button>
        </div>

        <div className="px-8 py-6 flex items-center justify-between relative z-20">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl text-primary">
              <Filter size={18} />
            </div>
            <div className="flex gap-3">
              <CustomDropdown
                label="Tier"
                value={s.tierFilter}
                onChange={s.setTierFilter}
                options={[1, 2, 3, 4, 5, 6, 7, 8].map((t) => ({
                  label: `Tier ${t}`,
                  val: t.toString(),
                }))}
              />
              <CustomDropdown
                label="Enchant"
                value={s.enchantFilter}
                onChange={s.setEnchantFilter}
                options={[0, 1, 2, 3, 4].map((e) => ({
                  label: `Level .${e}`,
                  val: e.toString(),
                }))}
              />
            </div>
          </div>
          <button
            onClick={handleReset}
            className="btn bg-error/10 hover:bg-error/20 text-error rounded-2xl px-6 h-12 flex items-center gap-2 text-xs font-black uppercase transition-colors shadow-sm outline-none"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        <div className="flex-1 flex flex-col bg-base-content/5 mx-8 mb-4 rounded-3xl overflow-hidden border border-base-content/5">
          <div className="px-8 py-4 border-b border-base-content/5 bg-base-200/50 flex justify-between items-center shrink-0">
            <p className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em]">
              Results: {s.searchResults.length}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                Live Database
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <div
              ref={scrollContainerRef}
              className="absolute inset-0 p-4 overflow-y-auto custom-scrollbar"
            >
              {paginatedItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {paginatedItems.map((item, index) => (
                    <div
                      key={item.id}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => {
                        s.selectItem(item);
                        onClose();
                      }}
                      className={`px-6 py-4 rounded-2xl cursor-pointer flex items-center justify-between transition-colors duration-100 ${index === selectedIndex ? "bg-primary text-primary-content shadow-md" : "hover:bg-base-content/5"}`}
                    >
                      <div className="flex items-center gap-6">
                        <FallbackImage
                          src={getImgUrl(item.id)}
                          alt={item.display_name}
                          itemName={item.display_name}
                          isSelected={index === selectedIndex}
                        />
                        <div className="flex flex-col">
                          <span className="text-lg font-black tracking-tight leading-none mb-1">
                            {item.display_name}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest ${index === selectedIndex ? "text-primary-content/70" : "text-base-content/40"}`}
                          >
                            ID: {item.id}
                          </span>
                        </div>
                      </div>
                      {index === selectedIndex && (
                        <div className="flex items-center gap-2 opacity-50">
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Select
                          </span>
                          <CornerDownLeft size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 py-20">
                  {isSearching ? (
                    <Loader2 size={64} className="animate-spin mb-4" />
                  ) : (
                    <AlertCircle size={64} className="mb-4" />
                  )}
                  <p className="text-sm font-black uppercase">
                    {isSearching ? "Loading..." : "No Items Found"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="px-8 py-3 border-t border-base-content/5 flex items-center justify-between bg-base-200/30 shrink-0">
              <button
                onClick={() => s.setSearchPage(Math.max(1, s.searchPage - 1))}
                disabled={s.searchPage === 1}
                className="btn btn-ghost btn-xs font-black uppercase disabled:opacity-10 outline-none"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <div className="bg-base-content/10 px-3 py-1 rounded-full text-[10px] font-black text-primary shadow-inner">
                {s.searchPage} / {totalPages}
              </div>
              <button
                onClick={() =>
                  s.setSearchPage(Math.min(totalPages, s.searchPage + 1))
                }
                disabled={s.searchPage === totalPages}
                className="btn btn-ghost btn-xs font-black uppercase disabled:opacity-10 outline-none"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="px-10 py-5 border-t border-base-content/5 flex justify-between items-center text-[10px] font-black uppercase opacity-20 select-none shrink-0">
          <div className="flex gap-8">
            <span>
              <kbd className="kbd kbd-xs bg-base-content/5 border-base-content/10">
                ↑↓
              </kbd>{" "}
              Navigate
            </span>
            <span>
              <kbd className="kbd kbd-xs bg-base-content/5 border-base-content/10">
                ←→
              </kbd>{" "}
              Pages
            </span>
            <span>
              <kbd className="kbd kbd-xs bg-base-content/5 border-base-content/10">
                ↵
              </kbd>{" "}
              Select
            </span>
          </div>
          <span>V2.6 Performance</span>
        </div>
      </div>
    </div>
  );
};

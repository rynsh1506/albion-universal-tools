import { useState, useEffect, useMemo, useRef } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import {
  Search,
  X,
  Filter,
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
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-between gap-2 md:gap-4 bg-base-content/5 border border-base-content/10 hover:border-primary/50 hover:bg-primary/5 px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black text-base-content transition-all min-w-20 md:min-w-37.5 shadow-sm active:scale-95 outline-none"
      >
        <span className="uppercase tracking-widest opacity-80 truncate">
          {value === "All" ? label : `${label}: ${value}`}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-100"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-[calc(100%+6px)] left-0 w-full min-w-30 bg-base-200 border border-base-content/10 rounded-xl md:rounded-2xl shadow-2xl z-110 overflow-hidden py-1 md:py-2 animate-in fade-in zoom-in-95 duration-100">
            <div className="max-h-48 md:max-h-60 overflow-y-auto custom-scrollbar">
              {["All", ...options.map((o: any) => o.val)].map((optVal, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onChange(optVal);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 md:px-5 py-2.5 md:py-3 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-colors outline-none ${value === optVal ? "text-primary bg-primary/5" : "text-base-content/60"}`}
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
    "w-10 h-10 md:w-16 md:h-16 flex items-center justify-center shrink-0 overflow-hidden";

  if (imgFailed || !src) {
    const nameLower = itemName.toLowerCase();
    const iconClass = `w-8 h-8 md:w-14 md:h-14 opacity-50 ${isSelected ? "text-primary-content" : "text-base-content"}`;
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

  const itemsPerPage = 10;
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
  useEffect(() => {
    setSelectedIndex(0);
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
  }, [s.searchPage]);

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
        if (isInputFocused) {
          if (paginatedItems.length > 0) {
            inputRef.current?.blur();
            setSelectedIndex(0);
          }
        } else {
          setSelectedIndex((prev) =>
            Math.min(prev + 1, paginatedItems.length - 1),
          );
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!isInputFocused) {
          if (selectedIndex === 0) inputRef.current?.focus();
          else setSelectedIndex((prev) => Math.max(prev - 1, 0));
        }
      } else if (e.key === "ArrowRight") {
        if (!isInputFocused || cursorAtEnd) {
          if (s.searchPage < totalPages) {
            e.preventDefault();
            s.setSearchPage(s.searchPage + 1);
          }
        }
      } else if (e.key === "ArrowLeft") {
        if (!isInputFocused || cursorAtStart) {
          if (s.searchPage > 1) {
            e.preventDefault();
            s.setSearchPage(s.searchPage - 1);
          }
        }
      } else if (
        e.key === "Enter" &&
        paginatedItems.length > 0 &&
        !isInputFocused
      ) {
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

  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-0 md:p-6 isolate">
      <div
        className="absolute inset-0 bg-base-300/98 md:bg-base-300/95"
        onClick={onClose}
      />
      <div
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
        className="relative bg-base-200 w-full h-full md:max-w-4xl md:h-[80vh] rounded-none md:rounded-4xl border-none md:border md:border-base-content/10 shadow-2xl overflow-hidden flex flex-col z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 md:p-8 pb-3 md:pb-4 grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-6 border-b border-base-content/5 md:border-none shrink-0 bg-base-200 z-30">
          <div className="flex items-center justify-center w-8 md:w-10">
            {isSearching ? (
              <Loader2 size={24} className="text-primary animate-spin" />
            ) : (
              <Search size={24} className="text-primary opacity-80" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder="Search item..."
            className="w-full bg-transparent border-none outline-none text-xl md:text-3xl font-black text-base-content placeholder:opacity-20"
            value={s.searchQuery}
            onChange={(e) => s.setSearchQuery(e.target.value)}
          />

          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square md:btn-circle opacity-60 hover:opacity-100 flex items-center justify-center"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-4 relative z-40 bg-base-200 shrink-0">
          <div className="flex items-center gap-2 md:gap-4 overflow-visible">
            <div className="bg-primary/10 p-2 md:p-3 rounded-xl text-primary shrink-0">
              <Filter className="size={14} md:size={18}" />
            </div>
            <div className="flex gap-2">
              <CustomDropdown
                label="Tier"
                value={s.tierFilter}
                onChange={s.setTierFilter}
                options={[1, 2, 3, 4, 5, 6, 7, 8].map((t) => ({
                  label: `T${t}`,
                  val: t.toString(),
                }))}
              />
              <CustomDropdown
                label="Level"
                value={s.enchantFilter}
                onChange={s.setEnchantFilter}
                options={[0, 1, 2, 3, 4].map((e) => ({
                  label: `.${e}`,
                  val: e.toString(),
                }))}
              />
            </div>
          </div>
          <button
            onClick={handleReset}
            className="btn btn-xs md:btn-md bg-error/10 hover:bg-error/20 text-error rounded-lg md:rounded-2xl h-8 md:h-12 px-3 md:px-6 flex items-center gap-2 text-[9px] md:text-xs font-black uppercase"
          >
            <RotateCcw className="size={12} md:size={16}" />
          </button>
        </div>

        <div className="flex-1 flex flex-col bg-base-content/5 md:mx-8 md:mb-4 md:rounded-3xl overflow-hidden border-t md:border border-base-content/5 z-10">
          <div className="px-5 md:px-8 py-2 md:py-3 border-b border-base-content/5 bg-base-200/50 flex justify-between items-center shrink-0">
            <p className="text-[8px] md:text-[9px] font-black text-base-content/40 uppercase tracking-widest">
              Found: {s.searchResults.length}
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[8px] md:text-[9px] font-black text-primary uppercase">
                Database
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div
              ref={scrollContainerRef}
              onTouchStart={() => {
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
              }}
              className="absolute inset-0 p-2 md:p-4 overflow-y-auto custom-scrollbar"
            >
              {paginatedItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-1 md:gap-1.5">
                  {paginatedItems.map((item, index) => (
                    <div
                      key={item.id}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                      onClick={() => {
                        s.selectItem(item);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`px-3 md:px-6 py-2 md:py-4 rounded-xl md:rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-100 ${index === selectedIndex ? "bg-primary text-primary-content shadow-lg scale-[0.98] md:scale-100" : "hover:bg-base-content/5"}`}
                    >
                      <div className="flex items-center gap-3 md:gap-6 min-w-0">
                        <div className="w-10 h-10 md:w-16 md:h-16 shrink-0 bg-base-300/50 rounded-lg overflow-hidden">
                          <FallbackImage
                            src={getImgUrl(item.id)}
                            alt={item.display_name}
                            itemName={item.display_name}
                            isSelected={index === selectedIndex}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs md:text-lg font-black tracking-tight leading-tight truncate">
                            {item.display_name}
                          </span>
                          <span className="text-[7px] md:text-[10px] font-bold uppercase tracking-widest opacity-50 truncate">
                            {item.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-10 text-center">
                  <Package className="size={32} md:size={40} md:mb-4" />
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">
                    No Items Found
                  </p>
                </div>
              )}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="px-4 md:px-8 py-2 md:py-3 border-t border-base-content/5 flex items-center justify-between bg-base-200/30 shrink-0">
              <button
                onClick={() => s.setSearchPage(Math.max(1, s.searchPage - 1))}
                disabled={s.searchPage === 1}
                className="btn btn-sm md:btn-xs btn-ghost font-black disabled:opacity-5 w-12 h-10 md:w-auto md:h-auto"
              >
                <ChevronLeft size={18} className="md:w-4 md:h-4" />
              </button>

              <div className="bg-primary/10 px-4 py-1.5 rounded-full text-[11px] md:text-[10px] font-black text-primary border border-primary/20">
                {s.searchPage} / {totalPages}
              </div>

              <button
                onClick={() =>
                  s.setSearchPage(Math.min(totalPages, s.searchPage + 1))
                }
                disabled={s.searchPage === totalPages}
                className="btn btn-sm md:btn-xs btn-ghost font-black disabled:opacity-5 w-12 h-10 md:w-auto md:h-auto"
              >
                <ChevronRight size={18} className="md:w-4 md:h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="hidden md:flex px-10 py-5 border-t border-base-content/5 justify-between items-center text-[10px] font-black uppercase opacity-20 select-none shrink-0">
          <div className="flex gap-8">
            <span>
              <kbd className="kbd kbd-xs bg-base-content/5">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="kbd kbd-xs bg-base-content/5">←→</kbd> Pages
            </span>
            <span>
              <kbd className="kbd kbd-xs bg-base-content/5">↵</kbd> Select
            </span>
          </div>
          <span>Avalonian V2.6</span>
        </div>
      </div>
    </div>
  );
};

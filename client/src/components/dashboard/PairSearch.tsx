import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface PairSearchProps {
  value: string;
  onChange: (pair: string) => void;
}

export function PairSearch({ value, onChange }: PairSearchProps) {
  const [pairs, setPairs] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPairs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/trading-pairs");
        const data = await res.json();
        setPairs(data.pairs || []);
      } catch (error) {
        console.error("Failed to fetch pairs:", error);
        // Fallback pairs
        setPairs(["BTCUSDT", "ETHUSDT", "SOLAUSDT", "ADAUSDT", "DOGEUSDT", "XRPUSDT"]);
      } finally {
        setLoading(false);
      }
    };
    fetchPairs();
  }, []);

  const filteredPairs = search
    ? pairs.filter((pair) => pair.toUpperCase().includes(search.toUpperCase()))
    : pairs;

  const handleSelect = (pair: string) => {
    onChange(pair);
    setSearch("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full lg:w-64">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-3 h-3 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search pairs..."
          value={search || value}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          data-testid="input-pair-search"
          className="w-full pl-8 pr-8 py-1.5 text-[11px] border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {(search || value) && (
          <button
            onClick={() => {
              setSearch("");
              setIsOpen(false);
            }}
            className="absolute right-3 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full border border-border bg-background shadow-lg z-50 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-2 text-[10px] text-muted-foreground text-center">Loading pairs...</div>
          ) : filteredPairs.length === 0 ? (
            <div className="p-2 text-[10px] text-muted-foreground text-center">No pairs found</div>
          ) : (
            filteredPairs.map((pair) => (
              <button
                key={pair}
                onClick={() => handleSelect(pair)}
                className={cn(
                  "w-full text-left px-3 py-1.5 text-[11px] font-mono transition-colors hover:bg-secondary",
                  value === pair ? "bg-primary text-primary-foreground" : "text-foreground"
                )}
                data-testid={`pair-option-${pair}`}
              >
                {pair}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Star, Plus, X, Search, TrendingUp, Sparkles, ExternalLink } from "lucide-react";
import { formatNumber, formatPercent, formatPosition } from "@/lib/view-helpers";

interface PinnedQueriesWatchlistProps {
  websiteId: string;
  allQueries: any[];
  periodLabel?: string;
  onPinnedChange?: (pinnedList: string[]) => void;
}

export function PinnedQueriesWatchlist({
  websiteId,
  allQueries = [],
  periodLabel = "Periode Terpilih",
  onPinnedChange,
}: PinnedQueriesWatchlistProps) {
  const [pinnedList, setPinnedList] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Load pinned keywords from localStorage
  useEffect(() => {
    if (!websiteId) return;
    try {
      const stored = localStorage.getItem(`pinned_queries_${websiteId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPinnedList(parsed);
          onPinnedChange?.(parsed);
          return;
        }
      }
      // If empty, suggest default from top queries if available
      if (allQueries.length > 0) {
        const defaults = allQueries.slice(0, 3).map((q: any) => q.query);
        setPinnedList(defaults);
        localStorage.setItem(`pinned_queries_${websiteId}`, JSON.stringify(defaults));
        onPinnedChange?.(defaults);
      }
    } catch {}
  }, [websiteId, allQueries.length]);

  const savePinned = (newList: string[]) => {
    setPinnedList(newList);
    try {
      localStorage.setItem(`pinned_queries_${websiteId}`, JSON.stringify(newList));
      onPinnedChange?.(newList);
    } catch {}
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newKeyword.trim().toLowerCase();
    if (!trimmed) return;
    if (!pinnedList.some((k) => k.toLowerCase() === trimmed)) {
      const updated = [...pinnedList, trimmed];
      savePinned(updated);
    }
    setNewKeyword("");
    setIsAdding(false);
  };

  const handleRemoveKeyword = (keyword: string) => {
    const updated = pinnedList.filter((k) => k.toLowerCase() !== keyword.toLowerCase());
    savePinned(updated);
  };

  // Build matched watchlist items
  const matchedWatchlist = useMemo(() => {
    return pinnedList.map((keyword) => {
      const match = allQueries.find(
        (q: any) => q.query.toLowerCase() === keyword.toLowerCase()
      );
      if (match) {
        return {
          query: match.query,
          clicks: match.clicks || 0,
          impressions: match.impressions || 0,
          ctr: match.ctr || 0,
          position: match.averagePosition || 0,
          isRanked: true,
        };
      }
      return {
        query: keyword,
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
        isRanked: false,
      };
    });
  }, [pinnedList, allQueries]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-xs">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <span>Kata Kunci Target Utama (Keyword Watchlist)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {pinnedList.length} Kata Kunci Dipantau
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Pantau peringkat kata kunci paling penting untuk bisnis Anda di hasil pencarian Google
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Kata Kunci</span>
        </button>
      </div>

      {/* Add Keyword Form */}
      {isAdding && (
        <form onSubmit={handleAddKeyword} className="flex items-center gap-2 bg-amber-50/50 p-3 rounded-xl border border-amber-200">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ketik kata kunci target (misal: cetak buku jakarta, jasa renovasi)..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              className="w-full text-xs bg-white border border-amber-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 outline-none focus:border-amber-400 font-medium"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            Simpan Pantauan
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 text-xs"
          >
            Batal
          </button>
        </form>
      )}

      {/* Pinned Keyword Cards Grid */}
      {matchedWatchlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {matchedWatchlist.map((item, idx) => {
            const pos = item.position;
            const posBadge =
              !item.isRanked || pos <= 0
                ? { label: "Belum Masuk 300 Besar", bg: "bg-slate-100 text-slate-500 border-slate-200" }
                : pos <= 3
                ? { label: `Peringkat #${pos.toFixed(1)} (Juara 🏆)`, bg: "bg-emerald-50 text-emerald-700 border-emerald-200" }
                : pos <= 10
                ? { label: `Peringkat #${pos.toFixed(1)} (Halaman 1)`, bg: "bg-indigo-50 text-indigo-700 border-indigo-200" }
                : pos <= 20
                ? { label: `Peringkat #${pos.toFixed(1)} (Halaman 2)`, bg: "bg-amber-50 text-amber-700 border-amber-200" }
                : { label: `Peringkat #${pos.toFixed(1)} (Halaman 3+)`, bg: "bg-slate-50 text-slate-600 border-slate-200" };

            return (
              <div
                key={idx}
                className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-amber-300 transition-all shadow-xs relative group space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="font-extrabold text-slate-900 text-xs truncate" title={item.query}>
                      {item.query}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${posBadge.bg}`}
                    >
                      {posBadge.label}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(item.query)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Hapus dari daftar pantauan"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Klik</span>
                    <strong className="text-xs text-slate-900 font-extrabold">
                      {formatNumber(item.clicks)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tayang</span>
                    <strong className="text-xs text-slate-800 font-extrabold">
                      {formatNumber(item.impressions)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">CTR</span>
                    <strong className="text-xs text-indigo-600 font-extrabold">
                      {formatPercent(item.ctr * 100)}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
          Belum ada kata kunci yang dipantau. Klik tombol &ldquo;Tambah Kata Kunci&rdquo; di atas untuk memantau kata kunci target bisnis Anda.
        </div>
      )}
    </div>
  );
}

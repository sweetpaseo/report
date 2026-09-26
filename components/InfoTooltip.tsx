"use client";

import React, { useState } from "react";
import { HelpCircle, X } from "lucide-react";

interface InfoTooltipProps {
  term: string;
  explanation: string;
  example?: string;
}

export function InfoTooltip({ term, explanation, example }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-slate-100"
        title={`Penjelasan ${term}`}
        aria-label={`Penjelasan ${term}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <span
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900/95 text-white text-xs rounded-xl shadow-xl backdrop-blur-sm pointer-events-auto border border-slate-700/60 transition-all animate-in fade-in zoom-in-95 duration-150"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <span className="flex items-center justify-between font-bold text-indigo-300 pb-1 border-b border-slate-800">
            <span>{term}</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
          <span className="block text-slate-200 mt-1.5 leading-relaxed font-normal">
            {explanation}
          </span>
          {example && (
            <span className="block mt-2 pt-1.5 border-t border-slate-800/80 text-[11px] text-amber-300/90 font-medium">
              💡 <em>Contoh:</em> {example}
            </span>
          )}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95" />
        </span>
      )}
    </span>
  );
}

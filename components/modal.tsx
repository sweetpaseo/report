"use client";

import { type ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal" role="dialog" aria-modal="true">
        <header>
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Tutup"><X /></button>
        </header>
        {children}
      </section>
    </div>
  );
}

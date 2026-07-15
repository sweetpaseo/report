"use client";

import { Modal } from "./modal";
import { DataTable, type Column } from "./data-table";

export function DataModal<T>({ open, title, columns, rows, filename, onClose }: { open: boolean; title: string; columns: Column<T>[]; rows: T[]; filename: string; onClose: () => void }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <DataTable columns={columns} rows={rows} filename={filename} />
    </Modal>
  );
}

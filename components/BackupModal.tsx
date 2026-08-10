"use client";

import React, { useState } from "react";
import { Download, Upload, Database, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Modal } from "./modal";

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BackupModal({ isOpen, onClose, onSuccess }: BackupModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [backupJsonInput, setBackupJsonInput] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleDownloadBackup = async () => {
    setDownloading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/backup");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengunduh file backup");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      a.href = url;
      a.download = `whr-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      setMessage({ type: "success", text: "File backup JSON berhasil diunduh!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setDownloading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setBackupJsonInput(content);
    };
    reader.readAsText(file);
  };

  const handleRestoreBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupJsonInput.trim()) return;

    setUploading(true);
    setMessage(null);
    try {
      const parsed = JSON.parse(backupJsonInput.trim());
      const res = await fetch("/api/settings/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-with": "XMLHttpRequest" },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message || "Berhasil memulihkan data backup!" });
        setBackupJsonInput("");
        onSuccess();
      } else {
        setMessage({ type: "error", text: data.error || "Gagal memulihkan backup" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: `Format JSON tidak valid: ${err.message}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal open={isOpen} title="Backup & Restore System Settings" onClose={onClose}>
      <div className="form-stack">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", padding: "14px", borderRadius: "10px", fontSize: "12px" }}>
          <div style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <Database size={16} /> 1-Click Export Backup Data & Credential
          </div>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "11px", lineHeight: "1.5" }}>
            Unduh seluruh konfigurasi sistem (termasuk Service Account Key Google API, daftar website, dan token klien) ke dalam file <code>.json</code> aman. File ini dapat langsung di-import di server baru.
          </p>
          <button
            type="button"
            className="button primary"
            onClick={handleDownloadBackup}
            disabled={downloading}
            style={{ marginTop: "10px", fontSize: "12px", width: "100%", justifyContent: "center" }}
          >
            {downloading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            {downloading ? "Menyiapkan File Backup..." : "Unduh File Backup (whr-backup.json)"}
          </button>
        </div>

        <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: "8px 0" }} />

        <form onSubmit={handleRestoreBackup} className="form-stack">
          <div style={{ fontWeight: "700", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Upload size={16} /> Restore / Import Backup Data
          </div>

          <label style={{ fontSize: "12px" }}>
            Pilih File Backup JSON
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ fontSize: "11px", marginTop: "4px" }}
            />
          </label>

          <label style={{ fontSize: "12px" }}>
            Atau Tempel (Paste) Isi JSON Backup
            <textarea
              rows={4}
              value={backupJsonInput}
              onChange={(e) => setBackupJsonInput(e.target.value)}
              placeholder='{"app": "Website Health Report", "system_settings": [...], "websites": [...]}'
              style={{
                fontFamily: "monospace",
                fontSize: "11px",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                padding: "8px",
                width: "100%",
              }}
            />
          </label>

          {message && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: message.type === "success" ? "#e8f8ef" : "#fef2f2",
                color: message.type === "success" ? "#148448" : "#991b1b",
                border: `1px solid ${message.type === "success" ? "#1f9d5a" : "#f87171"}`,
              }}
            >
              {message.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            className="button secondary wide"
            disabled={uploading || !backupJsonInput.trim()}
          >
            {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Memproses Import..." : "Import & Pulihkan Data"}
          </button>
        </form>
      </div>
    </Modal>
  );
}

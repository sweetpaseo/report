"use client";

import React, { useEffect, useState } from "react";
import { Copy, Check, RefreshCw, Key, Globe, Layers, AlertCircle, ExternalLink, X } from "lucide-react";
import { Modal } from "./modal";

interface Website {
  id: string;
  name: string;
  domain: string;
  gsc_site_url?: string;
  ga_property_id?: string;
  last_api_sync_at?: string;
  api_sync_status?: string;
  api_sync_error?: string;
}

interface GoogleApiModalProps {
  website: Website;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GoogleApiModal({ website, isOpen, onClose, onSuccess }: GoogleApiModalProps) {
  const [activeTab, setActiveTab] = useState<"service-account" | "website">("service-account");
  const [gscSiteUrl, setGscSiteUrl] = useState(website.gsc_site_url || `sc-domain:${website.domain}`);
  const [gaPropertyId, setGaPropertyId] = useState(website.ga_property_id || "");
  const [savingWebsite, setSavingWebsite] = useState(false);

  // Service Account states
  const [saConfigured, setSaConfigured] = useState(false);
  const [saEmail, setSaEmail] = useState("");
  const [saJsonInput, setSaJsonInput] = useState("");
  const [savingSa, setSavingSa] = useState(false);
  const [saMessage, setSaMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync states
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Date range picker for sync (default: last 30 days)
  const defaultEndDate = new Date().toISOString().split("T")[0];
  const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGscSiteUrl(website.gsc_site_url || `sc-domain:${website.domain}`);
      setGaPropertyId(website.ga_property_id || "");
      fetchSaStatus();
    }
  }, [isOpen, website]);

  const fetchSaStatus = async () => {
    try {
      const res = await fetch("/api/settings/google-service-account");
      const data = await res.json();
      if (data.configured) {
        setSaConfigured(true);
        setSaEmail(data.client_email || "");
      } else {
        setSaConfigured(false);
        setSaEmail("");
      }
    } catch (e) {
      console.error("Failed to fetch SA status", e);
    }
  };

  const handleSaveWebsiteConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWebsite(true);
    setSyncMessage(null);
    try {
      const res = await fetch(`/api/websites/${website.id}/google-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-with": "XMLHttpRequest" },
        body: JSON.stringify({
          gsc_site_url: gscSiteUrl.trim(),
          ga_property_id: gaPropertyId.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage({ type: "success", text: "Konfigurasi ID Google API berhasil disimpan!" });
        onSuccess();
      } else {
        setSyncMessage({ type: "error", text: data.error || "Gagal menyimpan konfigurasi" });
      }
    } catch (err: any) {
      setSyncMessage({ type: "error", text: err.message });
    } finally {
      setSavingWebsite(false);
    }
  };

  const handleSaveSaJson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saJsonInput.trim()) return;
    setSavingSa(true);
    setSaMessage(null);
    try {
      const res = await fetch("/api/settings/google-service-account", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-with": "XMLHttpRequest" },
        body: JSON.stringify({ json_string: saJsonInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaConfigured(true);
        setSaEmail(data.client_email);
        setSaJsonInput("");
        setSaMessage({ type: "success", text: "Service Account Google API berhasil disimpan!" });
      } else {
        setSaMessage({ type: "error", text: data.error || "Gagal menyimpan Service Account" });
      }
    } catch (err: any) {
      setSaMessage({ type: "error", text: err.message });
    } finally {
      setSavingSa(false);
    }
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch(`/api/websites/${website.id}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-with": "XMLHttpRequest" },
        body: JSON.stringify({ startDate, endDate }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage({ type: "success", text: data.message || "Berhasil menarik data dari Google API!" });
        onSuccess();
      } else {
        setSyncMessage({ type: "error", text: data.error || "Gagal menarik data dari Google API" });
      }
    } catch (err: any) {
      setSyncMessage({ type: "error", text: err.message });
    } finally {
      setSyncing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <Modal open={isOpen} title={`Google API Sync (${website.name})`} onClose={onClose}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", borderBottom: "1px solid var(--line)", paddingBottom: "10px" }}>
        <button
          type="button"
          className={`button ${activeTab === "service-account" ? "primary" : "secondary"}`}
          onClick={() => setActiveTab("service-account")}
          style={{ fontSize: "12px", padding: "8px 12px" }}
        >
          <Key size={14} /> 1. Service Account Key {saConfigured && "✓"}
        </button>
        <button
          type="button"
          className={`button ${activeTab === "website" ? "primary" : "secondary"}`}
          onClick={() => setActiveTab("website")}
          style={{ fontSize: "12px", padding: "8px 12px" }}
        >
          <Globe size={14} /> 2. Setting ID & Sync Data
        </button>
      </div>

      {activeTab === "service-account" ? (
        <div className="form-stack">
          {saConfigured ? (
            <div style={{ background: "#e8f8ef", border: "1px solid #1f9d5a", padding: "12px", borderRadius: "10px", fontSize: "12px" }}>
              <div style={{ fontWeight: "700", color: "#148448", marginBottom: "4px" }}>
                ✓ Service Account Aktif:
              </div>
              <div style={{ fontFamily: "monospace", wordBreak: "break-all", background: "#fff", padding: "6px 8px", borderRadius: "6px", border: "1px solid #d7deea", marginBottom: "8px" }}>
                {saEmail}
              </div>
              <button
                type="button"
                className="button subtle"
                onClick={() => copyToClipboard(saEmail)}
                style={{ fontSize: "11px", padding: "4px 8px" }}
              >
                {copiedEmail ? <Check size={12} /> : <Copy size={12} />}
                {copiedEmail ? "Tersalin!" : "Salin Email Ini"}
              </button>
              <p style={{ margin: "8px 0 0", color: "#344054", fontSize: "11px" }}>
                Tambahkan email di atas sebagai <strong>Viewer / Resticted User</strong> pada Google Search Console & GA4 Property Anda.
              </p>
            </div>
          ) : (
            <div style={{ background: "#fff5dc", border: "1px solid #a66b00", padding: "12px", borderRadius: "10px", fontSize: "12px", color: "#7a4f00" }}>
              <strong>Perhatian: Service Account Belum Disimpan!</strong>
              <p style={{ margin: "4px 0 0", fontSize: "11px" }}>
                Tempel (paste) isi file JSON Service Account dari Google Cloud Console di bawah ini.
              </p>
            </div>
          )}

          <form onSubmit={handleSaveSaJson} className="form-stack">
            <label>
              Isi File JSON Service Account
              <textarea
                rows={5}
                value={saJsonInput}
                onChange={(e) => setSaJsonInput(e.target.value)}
                placeholder='{"type": "service_account", "project_id": "...", "private_key": "...", "client_email": "..."}'
                style={{
                  fontFamily: "monospace",
                  fontSize: "11px",
                  border: "1px solid #d7deea",
                  borderRadius: "10px",
                  padding: "10px",
                  width: "100%",
                  outline: "none",
                }}
              />
            </label>

            {saMessage && (
              <p className={saMessage.type === "success" ? "upload-note" : "form-error"}>
                {saMessage.text}
              </p>
            )}

            <button type="submit" className="button primary wide" disabled={savingSa || !saJsonInput.trim()}>
              {savingSa ? "Menyimpan JSON..." : "Simpan Service Account Key"}
            </button>
          </form>
        </div>
      ) : (
        <div className="form-stack">
          {!saConfigured && (
            <p className="form-error">
              Service Account belum dikonfigurasi. Harap isi tab &quot;1. Service Account Key&quot; terlebih dahulu.
            </p>
          )}

          <form onSubmit={handleSaveWebsiteConfig} className="form-stack">
            <label>
              Search Console Site URL / Domain Property
              <input
                type="text"
                value={gscSiteUrl}
                onChange={(e) => setGscSiteUrl(e.target.value)}
                placeholder="sc-domain:erihome.id atau https://erihome.id/"
              />
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "normal" }}>
                Gunakan <code>sc-domain:domain.com</code> untuk Domain Property, atau <code>https://domain.com/</code> untuk URL Prefix.
              </span>
            </label>

            <label>
              Google Analytics 4 (GA4) Property ID
              <input
                type="text"
                value={gaPropertyId}
                onChange={(e) => setGaPropertyId(e.target.value)}
                placeholder="Contoh: 123456789 (Hanya angka)"
              />
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "normal" }}>
                ID Properti GA4 dari Admin GA4 &gt; Property Settings.
              </span>
            </label>

            <button type="submit" className="button secondary wide" disabled={savingWebsite}>
              {savingWebsite ? "Menyimpan..." : "Simpan ID Properti"}
            </button>
          </form>

          <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: "8px 0" }} />

          <div className="form-stack">
            <h3 className="sub-head" style={{ margin: 0 }}>Tarik Data Realtime (Sync API)</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label>
                Tanggal Mulai
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label>
                Tanggal Akhir
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </div>

            {syncMessage && (
              <p className={syncMessage.type === "success" ? "upload-note" : "form-error"}>
                {syncMessage.text}
              </p>
            )}

            <button
              type="button"
              className="button primary wide"
              onClick={handleTriggerSync}
              disabled={syncing || !saConfigured || (!gscSiteUrl && !gaPropertyId)}
            >
              <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Sedang Menarik Data dari Google..." : "Tarik Data Sekarang"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

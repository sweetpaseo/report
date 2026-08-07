"use client";

import React, { useEffect, useState } from "react";
import { Copy, Check, RefreshCw, Key, Globe, Layers, AlertCircle, ExternalLink, X } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"website" | "service-account">("website");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gsc_site_url: gscSiteUrl.trim(),
          ga_property_id: gaPropertyId.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage({ type: "success", text: "Konfigurasi Google API website berhasil disimpan!" });
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage({ type: "success", text: data.message || "Berhasil melakukan sinkronisasi data Google API!" });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Integrasi Google API ({website.name})</h3>
              <p className="text-xs text-slate-400">Google Search Console & Google Analytics 4 Realtime Sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6">
          <button
            onClick={() => setActiveTab("website")}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "website"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            Konfigurasi Website & Sync
          </button>
          <button
            onClick={() => setActiveTab("service-account")}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "service-account"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="w-4 h-4" />
            Service Account Key {saConfigured && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {activeTab === "website" ? (
            <>
              {/* Service Account Status Banner */}
              {!saConfigured ? (
                <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Service Account Belum Dikonfigurasi!</span>
                    <p className="text-xs text-amber-200/80 mt-1">
                      Buka tab <button onClick={() => setActiveTab("service-account")} className="underline font-semibold">Service Account Key</button> untuk memasukkan file JSON dari Google Cloud Console agar API dapat diakses.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Service Account Terhubung: <strong>{saEmail}</strong></span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(saEmail)}
                    className="flex items-center gap-1 text-emerald-400 hover:underline bg-emerald-500/10 px-2 py-1 rounded"
                  >
                    {copiedEmail ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedEmail ? "Tersalin" : "Salin Email"}
                  </button>
                </div>
              )}

              {/* Form Website Config */}
              <form onSubmit={handleSaveWebsiteConfig} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Google Search Console Site URL / Property
                  </label>
                  <input
                    type="text"
                    value={gscSiteUrl}
                    onChange={(e) => setGscSiteUrl(e.target.value)}
                    placeholder="sc-domain:example.com atau https://example.com/"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Format: <code>sc-domain:domain.com</code> (Domain Property) atau <code>https://domain.com/</code> (URL Prefix).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Google Analytics 4 (GA4) Property ID
                  </label>
                  <input
                    type="text"
                    value={gaPropertyId}
                    onChange={(e) => setGaPropertyId(e.target.value)}
                    placeholder="Contoh: 123456789 (Hanya angka)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Dapatkan di GA4 Admin &gt; Property Settings &gt; Property ID.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingWebsite}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    {savingWebsite ? "Menyimpan..." : "Simpan Konfigurasi ID"}
                  </button>
                </div>
              </form>

              <hr className="border-slate-800" />

              {/* Direct Sync Action */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Tarik Data Realtime (Sync API)</h4>
                    <p className="text-xs text-slate-400">Pilih rentang tanggal untuk menarik data terbaru dari GSC & GA4</p>
                  </div>
                  {website.last_api_sync_at && (
                    <span className="text-xs text-slate-400">
                      Sync Terakhir: {new Date(website.last_api_sync_at).toLocaleString("id-ID")}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Tanggal Akhir</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {syncMessage && (
                  <div
                    className={`p-3 rounded-lg text-xs ${
                      syncMessage.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {syncMessage.text}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleTriggerSync}
                  disabled={syncing || !saConfigured || (!gscSiteUrl && !gaPropertyId)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Sedang Menarik Data dari Google API..." : "Tarik Data Sekarang"}
                </button>
              </div>
            </>
          ) : (
            /* Service Account Key Tab */
            <div className="space-y-5">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-2">
                <h4 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  Cara Menghubungkan Google Service Account
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Buka <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-emerald-400 underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-3 h-3" /></a> dan buat project baru.</li>
                  <li>Aktifkan <strong>Google Search Console API</strong> dan <strong>Google Analytics Data API</strong>.</li>
                  <li>Buat <strong>Service Account</strong>, buat kunci berformat <strong>JSON Key</strong>, lalu unduh filenya.</li>
                  <li>Buka isi file JSON tersebut, salin seluruh teksnya, dan tempel pada kolom di bawah ini.</li>
                  <li>Tambahkan email Service Account tersebut sebagai <strong>Viewer / Resticted User</strong> di Google Search Console dan Google Analytics Property Anda.</li>
                </ol>
              </div>

              {saConfigured && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center justify-between">
                  <div>
                    <strong>Status: Service Account Aktif</strong>
                    <p className="text-slate-400 mt-0.5">{saEmail}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(saEmail)}
                    className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded flex items-center gap-1"
                  >
                    {copiedEmail ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedEmail ? "Tersalin" : "Salin Email"}
                  </button>
                </div>
              )}

              <form onSubmit={handleSaveSaJson} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Paste Isi File JSON Service Account
                  </label>
                  <textarea
                    rows={6}
                    value={saJsonInput}
                    onChange={(e) => setSaJsonInput(e.target.value)}
                    placeholder='{"type": "service_account", "project_id": "...", "private_key": "...", "client_email": "..."}'
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  ></textarea>
                </div>

                {saMessage && (
                  <div
                    className={`p-3 rounded-lg text-xs ${
                      saMessage.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {saMessage.text}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSa || !saJsonInput.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    {savingSa ? "Menyimpan JSON..." : "Simpan Kredensial JSON"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

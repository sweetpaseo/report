"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Share2,
  Calendar,
  Lightbulb,
  BarChart3,
  Link as LinkIcon,
  Plus,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface SocialMediaViewProps {
  website?: {
    id: string;
    name: string;
    domain: string;
    client_id?: string | null;
  };
  userRole?: string;
}

interface TebarAccount {
  id: string;
  platform: string;
  name: string;
  username?: string;
  profile_picture?: string;
}

interface TebarPost {
  id: string;
  content: string;
  status: "draft" | "scheduled" | "publishing" | "published" | "failed";
  targets?: Array<{ account_id: string; platform?: string; status?: string }>;
  scheduled_at?: string | null;
  published_at?: string | null;
  created_at: string;
}

interface TebarIdea {
  id: string;
  text: string;
  column_id?: string;
  created_at: string;
}

export function SocialMediaView({ website }: SocialMediaViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"accounts" | "posts" | "ideas" | "insights">("accounts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tebar data
  const [tebarUser, setTebarUser] = useState<{ name: string; email: string } | null>(null);
  const [accounts, setAccounts] = useState<TebarAccount[]>([]);
  const [posts, setPosts] = useState<TebarPost[]>([]);
  const [ideas, setIdeas] = useState<TebarIdea[]>([]);

  // Connect link modal
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectUrl, setConnectUrl] = useState<string | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // New post modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [postSubmitting, setPostSubmitting] = useState(false);

  // New idea modal
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [ideaText, setIdeaText] = useState("");
  const [ideaSubmitting, setIdeaSubmitting] = useState(false);

  // Fetch status & data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusRes, postsRes, ideasRes] = await Promise.all([
        fetch("/api/social/status").then((r) => r.json()),
        fetch("/api/social/posts").then((r) => r.json()),
        fetch("/api/social/ideas").then((r) => r.json()),
      ]);

      if (statusRes.ok && statusRes.tebar) {
        setTebarUser(statusRes.tebar.me);
        setAccounts(statusRes.tebar.accounts || []);
      }
      if (postsRes.ok) {
        setPosts(postsRes.posts || []);
      }
      if (ideasRes.ok) {
        setIdeas(ideasRes.ideas || []);
      }
    } catch {
      setError("Gagal menghubungi server social media. Periksa koneksi atau konfigurasi API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate Connect Link
  async function handleGenerateConnectLink() {
    setConnectLoading(true);
    try {
      const res = await fetch("/api/social/connect-link", { method: "POST" });
      const data = await res.json();
      if (data.ok && data.url) {
        setConnectUrl(data.url);
        setShowConnectModal(true);
      } else {
        alert(data.error || "Gagal membuat link koneksi.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setConnectLoading(false);
    }
  }

  function handleCopy() {
    if (!connectUrl) return;
    navigator.clipboard.writeText(connectUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Submit Post
  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!postContent.trim()) return;
    if (selectedAccounts.length === 0) {
      alert("Pilih minimal satu akun tujuan posting.");
      return;
    }

    setPostSubmitting(true);
    try {
      const res = await fetch("/api/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: postContent,
          accountIds: selectedAccounts,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal membuat postingan.");
      } else {
        setShowPostModal(false);
        setPostContent("");
        setSelectedAccounts([]);
        setScheduledAt("");
        fetchData();
      }
    } catch {
      alert("Gagal mengirim postingan.");
    } finally {
      setPostSubmitting(false);
    }
  }

  // Submit Idea
  async function handleCreateIdea(e: React.FormEvent) {
    e.preventDefault();
    if (!ideaText.trim()) return;

    setIdeaSubmitting(true);
    try {
      const res = await fetch("/api/social/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ideaText }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal menyimpan ide.");
      } else {
        setShowIdeaModal(false);
        setIdeaText("");
        fetchData();
      }
    } catch {
      alert("Gagal menyimpan ide.");
    } finally {
      setIdeaSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Share2 className="w-4 h-4 text-indigo-400" />
            Social Media Hub &bull; {website?.name || "Klien Erihome"}
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Pusat Optimasi Media Sosial Klien
          </h2>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl">
            Kelola perencanaan konten, jadwal publikasi multi-platform, dan pantau analitik media sosial dari satu tempat.
          </p>
          {tebarUser && (
            <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Kanal Media Sosial: <strong className="text-white">Terhubung &amp; Aktif</strong>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
          <button
            onClick={handleGenerateConnectLink}
            disabled={connectLoading}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tautkan Akun Klien</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab("accounts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "accounts"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Akun Terhubung ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("posts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "posts"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Jadwal & Postingan ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("ideas")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "ideas"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Papan Ide Konten ({ideas.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("insights")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "insights"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analitik & Waktu Terbaik</span>
        </button>
      </div>

      {/* SUB-TAB: ACCOUNTS */}
      {activeSubTab === "accounts" && (
        <div className="space-y-4">
          {accounts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
                <Share2 className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="font-extrabold text-slate-900 text-base">Belum Ada Akun Media Sosial Tertaut</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Klien dapat menautkan akun Instagram, TikTok, Threads, YouTube, Facebook, atau X mereka secara mandiri tanpa perlu membagikan password kepada staff.
                </p>
              </div>
              <button
                onClick={handleGenerateConnectLink}
                disabled={connectLoading}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Buat Link Tautan Akun untuk Klien</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((acc) => (
                <div key={acc.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0 uppercase text-xs">
                    {acc.platform.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{acc.name}</h4>
                    <p className="text-[11px] text-slate-400 capitalize">{acc.platform} &bull; @{acc.username || acc.name}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    Aktif
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: POSTS */}
      {activeSubTab === "posts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Kalender & Daftar Postingan</h3>
            <button
              onClick={() => setShowPostModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Postingan Baru</span>
            </button>
          </div>

          {posts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center text-slate-500 text-xs">
              Belum ada riwayat postingan. Klik &quot;Buat Postingan Baru&quot; untuk merilis atau menjadwalkan konten.
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm">
              {posts.map((p) => (
                <div key={p.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-800 line-clamp-2">{p.content}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {p.scheduled_at ? `Jadwal: ${new Date(p.scheduled_at).toLocaleString("id-ID")}` : `Dibuat: ${new Date(p.created_at).toLocaleDateString("id-ID")}`}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    p.status === "published" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                    p.status === "scheduled" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: IDEAS */}
      {activeSubTab === "ideas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Papan Ide Konten (Ideation Hub)</h3>
              <p className="text-[11px] text-slate-500">Kumpulkan dan susun konsep ide konten sebelum diproduksi menjadi materi postingan.</p>
            </div>
            <button
              onClick={() => setShowIdeaModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Ide</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between font-bold text-xs text-slate-700">
                <span>Ide Baru ({ideas.length})</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <div className="space-y-2">
                {ideas.map((idea) => (
                  <div key={idea.id} className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-sm space-y-2">
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">{idea.text}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>{new Date(idea.created_at).toLocaleDateString("id-ID")}</span>
                      <span className="text-indigo-600 font-bold hover:underline cursor-pointer" onClick={() => {
                        setPostContent(idea.text);
                        setShowPostModal(true);
                      }}>
                        Jadikan Post &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between font-bold text-xs text-slate-700">
                <span>Dalam Pengerjaan Desain / Video (0)</span>
                <span className="w-2 h-2 rounded-full bg-blue-400" />
              </div>
              <div className="text-center p-6 text-[11px] text-slate-400">
                Belum ada ide dalam tahap produksi materi.
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between font-bold text-xs text-slate-700">
                <span>Siap Dijadwalkan (0)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-center p-6 text-[11px] text-slate-400">
                Materi yang siap rilis dapat langsung dijadwalkan di tab Postingan.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: INSIGHTS */}
      {activeSubTab === "insights" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <p className="text-[11px] text-slate-500 font-medium">Total Akun Aktif</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{accounts.length}</h4>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">Multi-platform ready</p>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <p className="text-[11px] text-slate-500 font-medium">Postingan Bulan Ini</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{posts.length}</h4>
              <p className="text-[10px] text-slate-400 mt-1">Terjadwal & Terbit</p>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <p className="text-[11px] text-slate-500 font-medium">Bank Ide Konten</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{ideas.length}</h4>
              <p className="text-[10px] text-indigo-600 font-semibold mt-1">Riset & Ideation</p>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <p className="text-[11px] text-slate-500 font-medium">Status Integrasi</p>
              <h4 className="text-2xl font-black text-emerald-600 mt-1">Normal</h4>
              <p className="text-[10px] text-slate-400 mt-1">Multi-Platform Cloud Sync Active</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h4 className="font-extrabold text-slate-900 text-sm">Rekomendasi Waktu Terbaik untuk Posting (Best Time to Post)</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sistem secara otomatis menganalisa waktu interaksi audiens tertinggi per platform agar jangkauan (*reach*) dan *engagement* konten klien maksimal. Begitu akun media sosial klien aktif memposting, rekomendasi jam tayang optimal per hari akan muncul di sini.
            </p>
          </div>
        </div>
      )}

      {/* MODAL: CONNECT LINK FOR CLIENT */}
      {showConnectModal && connectUrl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Link Tautan Akun untuk Klien</h3>
                  <p className="text-[11px] text-slate-400">Klien login di perangkat mereka sendiri</p>
                </div>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                &times; Tutup
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
              <p className="text-xs text-slate-600 leading-relaxed">
                Kirim link berikut ke klien (melalui WhatsApp/Email). Klien cukup membuka link ini untuk menghubungkan Instagram, TikTok, Threads, atau channel lainnya:
              </p>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-2">
                <input
                  type="text"
                  readOnly
                  value={connectUrl}
                  className="w-full text-xs text-slate-800 bg-transparent outline-none truncate"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shrink-0 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Tersalin!" : "Salin Link"}</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Tautan ini aman &bull; Klien menghubungkan akun dari perangkat mereka sendiri tanpa perlu membagikan password kepada staff.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <a
                href={connectUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline px-3 py-2"
              >
                <span>Buka Tautan Langsung</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setShowConnectModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE POST */}
      {showPostModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreatePost} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Buat Postingan Baru</h3>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Akun Tujuan</label>
              {accounts.length === 0 ? (
                <p className="text-xs text-rose-500">Belum ada akun terhubung. Tautkan akun terlebih dahulu.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {accounts.map((acc) => {
                    const isSelected = selectedAccounts.includes(acc.id);
                    return (
                      <button
                        type="button"
                        key={acc.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAccounts(selectedAccounts.filter((id) => id !== acc.id));
                          } else {
                            setSelectedAccounts([...selectedAccounts, acc.id]);
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {acc.platform}: {acc.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Teks / Caption</label>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Tulis caption postingan media sosial di sini..."
                rows={4}
                required
                className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Jadwal Rilis (Opsional)</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400">Kosongkan jika ingin langsung dipublikasikan sekarang.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={postSubmitting || accounts.length === 0}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{postSubmitting ? "Memproses..." : scheduledAt ? "Jadwalkan" : "Publikasikan"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CREATE IDEA */}
      {showIdeaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateIdea} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Catat Ide Konten Baru</h3>
              <button
                type="button"
                onClick={() => setShowIdeaModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Konsep / Topik Ide</label>
              <textarea
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                placeholder="Contoh: Tips memilih warna cat rumah minimalis untuk promo bulan ini..."
                rows={3}
                required
                className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowIdeaModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={ideaSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {ideaSubmitting ? "Menyimpan..." : "Simpan Ide"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

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
  Sparkles,
  Laptop,
  Heart,
  MessageCircle,
  Users,
  Compass,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Download,
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

interface ProfileSnapshot {
  id: string;
  client_id: string;
  platform: string;
  username: string;
  full_name: string | null;
  followers_count: number;
  following_count: number;
  posts_count: number;
  bio: string | null;
  profile_pic_url: string | null;
  synced_by_staff_id: string | null;
  synced_by_name?: string | null;
  synced_at: string;
}

interface SyncedPost {
  id: string;
  client_id: string;
  platform: string;
  post_id: string;
  post_url: string | null;
  caption: string | null;
  media_type: string | null;
  thumbnail_url: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  posted_at: string | null;
  engagement_score: number;
  synced_at: string;
}

export function SocialMediaView({ website }: SocialMediaViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"accounts" | "posts" | "ideas" | "insights" | "extension">("accounts");
  const [postSourceFilter, setPostSourceFilter] = useState<"all" | "extension" | "cloud">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cloud & Tebar data
  const [tebarUser, setTebarUser] = useState<{ name: string; email: string } | null>(null);
  const [accounts, setAccounts] = useState<TebarAccount[]>([]);
  const [posts, setPosts] = useState<TebarPost[]>([]);
  const [ideas, setIdeas] = useState<TebarIdea[]>([]);

  // Browser Extension data
  const [snapshots, setSnapshots] = useState<ProfileSnapshot[]>([]);
  const [syncedPosts, setSyncedPosts] = useState<SyncedPost[]>([]);
  const [clientInfo, setClientInfo] = useState<{ id: string; name: string; socialHandles: Record<string, string> } | null>(null);

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
      const clientIdQuery = website?.client_id ? `?clientId=${website.client_id}` : website?.id ? `?websiteId=${website.id}` : "";
      
      const [statusRes, postsRes, ideasRes, extensionRes] = await Promise.all([
        fetch("/api/social/status").then((r) => r.json()).catch(() => ({ ok: false })),
        fetch("/api/social/posts").then((r) => r.json()).catch(() => ({ ok: false })),
        fetch("/api/social/ideas").then((r) => r.json()).catch(() => ({ ok: false })),
        fetch(`/api/social/synced-data${clientIdQuery}`).then((r) => r.json()).catch(() => ({ ok: false })),
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
      if (extensionRes.ok) {
        setSnapshots(extensionRes.snapshots || []);
        setSyncedPosts(extensionRes.posts || []);
        if (extensionRes.client) {
          setClientInfo(extensionRes.client);
        }
      }
    } catch {
      setError("Gagal menghubungi server social media. Periksa koneksi.");
    } finally {
      setLoading(false);
    }
  }, [website]);

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

  const latestSnapshot = snapshots.length > 0 ? snapshots[0] : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Share2 className="w-4 h-4 text-indigo-400" />
            Social Media Hub &bull; {website?.name || clientInfo?.name || "Klien Erihome"}
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Pusat Optimasi Media Sosial Klien
          </h2>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
            Perencanaan konten terpadu, sinkronisasi metrik langsung dari browser staf via <strong>ACS Social Extension</strong>, dan rekomendasi topik berbasis performa Google Search Console.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
            {latestSnapshot ? (
              <span className="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/70 border border-emerald-800/50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ekstensi Browser: <strong>@{latestSnapshot.username} Terhubung ({latestSnapshot.followers_count.toLocaleString("id-ID")} followers)</strong>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-300 bg-amber-950/70 border border-amber-800/50 px-2.5 py-1 rounded-full">
                <Laptop className="w-3 h-3" />
                Ekstensi Browser: Belum ada sinkronisasi aktif
              </span>
            )}
            {tebarUser && (
              <span className="flex items-center gap-1.5 text-indigo-300 bg-indigo-950/70 border border-indigo-800/50 px-2.5 py-1 rounded-full">
                <Share2 className="w-3 h-3" />
                Cloud API Hub: Aktif
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
          <button
            onClick={() => setActiveSubTab("extension")}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-emerald-600/25 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ekstensi Staf (ACS Copilot)</span>
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
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("accounts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === "accounts"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Akun Terhubung ({accounts.length + snapshots.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("posts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === "posts"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Postingan & Performa ({posts.length + syncedPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("ideas")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === "insights"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analitik & Waktu Terbaik</span>
        </button>

        <button
          onClick={() => setActiveSubTab("extension")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === "extension"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
          }`}
        >
          <Laptop className="w-3.5 h-3.5 text-current" />
          <span>Ekstensi Browser Staff</span>
        </button>
      </div>

      {/* SUB-TAB: ACCOUNTS */}
      {activeSubTab === "accounts" && (
        <div className="space-y-6">
          {/* Section A: Synced via Browser Extension */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Akun Terpantau via Ekstensi Browser Staf ({snapshots.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">Zero-Risk Banned &bull; Menggunakan IP Residensial Staf</span>
            </div>

            {snapshots.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-6 text-center space-y-2">
                <Laptop className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">Belum ada profil yang disinkronkan melalui ekstensi browser staf.</p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Staf media sosial cukup membuka Instagram/TikTok klien di laptop mereka dan menekan tombol &quot;Sinkronkan ke ACS&quot; pada ekstensi.
                </p>
                <button
                  onClick={() => setActiveSubTab("extension")}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline"
                >
                  <span>Lihat Panduan Instalasi Ekstensi &rarr;</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {snapshots.map((snap) => (
                  <div key={snap.id} className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4 hover:border-indigo-300 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                          {snap.platform === "instagram" ? "IG" : "TT"}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{snap.full_name || `@${snap.username}`}</h4>
                          <p className="text-xs text-slate-500 truncate">@{snap.username}</p>
                          <span className="inline-block mt-0.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.2 rounded-full uppercase">
                            {snap.platform}
                          </span>
                        </div>
                      </div>
                    </div>

                    {snap.bio && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2 leading-relaxed">
                        {snap.bio}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-2 text-center bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      <div>
                        <div className="text-sm font-black text-slate-900">{snap.followers_count.toLocaleString("id-ID")}</div>
                        <div className="text-[10px] text-slate-400 font-medium">Followers</div>
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900">{snap.following_count.toLocaleString("id-ID")}</div>
                        <div className="text-[10px] text-slate-400 font-medium">Following</div>
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900">{snap.posts_count.toLocaleString("id-ID")}</div>
                        <div className="text-[10px] text-slate-400 font-medium">Posts</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Sync: {new Date(snap.synced_at).toLocaleString("id-ID")}</span>
                      {snap.synced_by_name && (
                        <span className="font-semibold text-slate-600">Oleh: {snap.synced_by_name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Cloud / Official API Linked Accounts */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Akun Cloud Publisher Resmi ({accounts.length})
                </h3>
              </div>
              <button
                onClick={handleGenerateConnectLink}
                disabled={connectLoading}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                + Tautkan Akun Baru
              </button>
            </div>

            {accounts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 text-center space-y-3 shadow-sm">
                <p className="text-xs text-slate-500">
                  Belum ada akun media sosial yang terhubung via Cloud Publisher API resmi. Anda bisa membuat link koneksi mandiri untuk dikirim ke klien.
                </p>
                <button
                  onClick={handleGenerateConnectLink}
                  disabled={connectLoading}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all"
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
        </div>
      )}

      {/* SUB-TAB: POSTS */}
      {activeSubTab === "posts" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Postingan & Riwayat Interaksi Medsos</h3>
              <p className="text-xs text-slate-500">Pantau performa konten Instagram/TikTok yang disinkronkan dan jadwal postingan terencana.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
                <button
                  onClick={() => setPostSourceFilter("all")}
                  className={`px-3 py-1 rounded-lg transition-all ${postSourceFilter === "all" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500"}`}
                >
                  Semua ({posts.length + syncedPosts.length})
                </button>
                <button
                  onClick={() => setPostSourceFilter("extension")}
                  className={`px-3 py-1 rounded-lg transition-all ${postSourceFilter === "extension" ? "bg-white text-emerald-700 shadow-xs font-bold" : "text-slate-500"}`}
                >
                  Dari Medsos ({syncedPosts.length})
                </button>
                <button
                  onClick={() => setPostSourceFilter("cloud")}
                  className={`px-3 py-1 rounded-lg transition-all ${postSourceFilter === "cloud" ? "bg-white text-indigo-700 shadow-xs font-bold" : "text-slate-500"}`}
                >
                  Jadwal Cloud ({posts.length})
                </button>
              </div>

              <button
                onClick={() => setShowPostModal(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-sm transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Postingan Baru</span>
              </button>
            </div>
          </div>

          {/* Synced Posts Grid */}
          {(postSourceFilter === "all" || postSourceFilter === "extension") && syncedPosts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-emerald-600" />
                  Postingan Terbaru dari Feed Medsos Klien
                </span>
                <span className="text-[11px] text-slate-400">Diambil otomatis oleh ekstensi staf</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {syncedPosts.map((p) => (
                  <div key={p.id} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-indigo-600 capitalize flex items-center gap-1">
                          {p.platform} &bull; {p.media_type || "Post"}
                        </span>
                        <span className="text-slate-400">
                          {p.posted_at ? new Date(p.posted_at).toLocaleDateString("id-ID") : "Baru saja"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-800 line-clamp-3 leading-relaxed">
                        {p.caption || "(Tanpa caption)"}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-rose-600">
                          <Heart className="w-3.5 h-3.5" />
                          {p.likes_count.toLocaleString("id-ID")}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-blue-600">
                          <MessageCircle className="w-3.5 h-3.5" />
                          {p.comments_count.toLocaleString("id-ID")}
                        </span>
                      </div>

                      {p.post_url && (
                        <a
                          href={p.post_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-indigo-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>Buka Post</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cloud Scheduled Posts */}
          {(postSourceFilter === "all" || postSourceFilter === "cloud") && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Daftar Jadwal Publikasi Terencana ({posts.length})
              </span>

              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center text-slate-500 text-xs">
                  Belum ada postingan dalam antrean jadwal publikasi cloud.
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
        </div>
      )}

      {/* SUB-TAB: IDEAS */}
      {activeSubTab === "ideas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Papan Ide Konten (Ideation Hub)</h3>
              <p className="text-[11px] text-slate-500">Riset konsep ide konten dan rekomendasi topik SEO-to-Social sebelum diproduksi menjadi materi desain & video.</p>
            </div>
            <button
              onClick={() => setShowIdeaModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Ide</span>
            </button>
          </div>

          {/* GSC to Social Content Synergy Banner */}
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs">Sinergi Data: Website SEO &rarr; Ide Konten Medsos</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Ekstensi staf secara otomatis membedah kueri pencarian Google Search Console klien yang memiliki *high impressions*. Kueri tersebut langsung diubah menjadi formula *viral hook* di floating widget staf saat menyusun caption.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab("extension")}
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
            >
              Buka Panduan Ekstensi
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
              <p className="text-[11px] text-slate-500 font-medium">Total Akun Terpantau</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{accounts.length + snapshots.length}</h4>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                {snapshots.length > 0 ? "Ekstensi Browser Aktif" : "Multi-platform ready"}
              </p>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <p className="text-[11px] text-slate-500 font-medium">Postingan Terpantau</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{posts.length + syncedPosts.length}</h4>
              <p className="text-[10px] text-slate-400 mt-1">Medsos Feed &amp; Antrean Cloud</p>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <p className="text-[11px] text-slate-500 font-medium">Bank Ide Konten</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{ideas.length}</h4>
              <p className="text-[10px] text-indigo-600 font-semibold mt-1">Riset &amp; Ideation</p>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <p className="text-[11px] text-slate-500 font-medium">Status Ekstensi Staf</p>
              <h4 className="text-2xl font-black text-emerald-600 mt-1">
                {snapshots.length > 0 ? "Tersinkron" : "Siap Dipakai"}
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">Zero-Risk Direct Web Sync</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h4 className="font-extrabold text-slate-900 text-sm">Rekomendasi Waktu Terbaik untuk Posting (Best Time to Post)</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Berdasarkan analisa algoritma audiens media sosial di Indonesia, waktu tayang dengan retensi tertinggi umumnya berada di:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-indigo-600 uppercase">Siang Hari (Istirahat Kerja)</span>
                <p className="text-xs font-black text-slate-800 mt-0.5">12:00 - 13:30 WIB</p>
                <p className="text-[10px] text-slate-400 mt-1">Ideal untuk tips singkat &amp; infografis.</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-rose-600 uppercase">Sore Menjelang Pulang</span>
                <p className="text-xs font-black text-slate-800 mt-0.5">17:00 - 18:30 WIB</p>
                <p className="text-[10px] text-slate-400 mt-1">Bagus untuk carousel dan video showcase.</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Malam Hari (Prime Time)</span>
                <p className="text-xs font-black text-slate-800 mt-0.5">19:30 - 21:00 WIB</p>
                <p className="text-[10px] text-slate-400 mt-1">Engagement komentar &amp; save tertinggi.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: EXTENSION (ACS COPILOT) */}
      {activeSubTab === "extension" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-emerald-800/40 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              ACS Social Media Copilot &bull; Chrome &amp; Edge Extension
            </div>
            <h3 className="text-xl font-black text-white">
              Pasang Ekstensi Browser di Laptop / PC Staf
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Ekstensi ini dirancang khusus agar staf media sosial dapat bekerja dengan aman (zero-risk banned) menggunakan browser asli mereka. Ekstensi langsung menyerap data followers &amp; postingan klien ke ACS, serta menampilkan <strong>Floating Copilot</strong> di layar Instagram/TikTok staf yang memberikan ide topik dari Google Search Console.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bebas Blokir Meta / TikTok &bull; IP Residensial Staf</span>
              </div>
              <div className="bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Saran Konten Berbasis Google Trends &amp; GSC</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Installation */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Laptop className="w-4 h-4 text-indigo-600" />
              Langkah Cepat Pemasangan Ekstensi (3 Menit)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  1
                </div>
                <h5 className="font-bold text-slate-900 text-xs">Buka Menu Ekstensi Browser</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Buka peramban Google Chrome atau Microsoft Edge di laptop staf. Ketik <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">chrome://extensions</code> di address bar, lalu aktifkan saklar <strong>Developer mode</strong> di pojok kanan atas.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  2
                </div>
                <h5 className="font-bold text-slate-900 text-xs">Muat Folder Ekstensi (Load unpacked)</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Klik tombol <strong>Load unpacked</strong> di pojok kiri atas browser, lalu pilih folder berikut di laptop Anda:
                </p>
                <div className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-[10px] text-slate-700 select-all truncate">
                  acs-social-extension
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  3
                </div>
                <h5 className="font-bold text-slate-900 text-xs">Login Staf &amp; Siap Pakai</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Klik icon ekstensi <strong>ACS Social Sync</strong> di toolbar. Masukkan akun staf yang telah didaftarkan. Ekstensi siap menyerap data dan menampilkan Copilot di Instagram/TikTok.
                </p>
              </div>
            </div>
          </div>

          {/* Snapshot History Table */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Riwayat Sinkronisasi dari Browser Staf</h4>
                <p className="text-xs text-slate-500">Log penarikan metrik terbaru per platform untuk klien ini.</p>
              </div>
              <button
                onClick={fetchData}
                className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Segarkan Data
              </button>
            </div>

            {snapshots.length === 0 ? (
              <div className="text-center p-8 text-slate-400 text-xs">
                Belum ada log sinkronisasi yang tercatat.
              </div>
            ) : (
              <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {snapshots.map((snap) => (
                  <div key={snap.id} className="p-3.5 flex items-center justify-between gap-4 text-xs hover:bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                        {snap.platform.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">@{snap.username} ({snap.full_name || snap.username})</div>
                        <div className="text-[10px] text-slate-400">
                          {snap.followers_count.toLocaleString("id-ID")} Followers &bull; {snap.posts_count} Posts
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-[11px]">
                      <div className="font-semibold text-slate-700">{snap.synced_by_name || "Staf Media Sosial"}</div>
                      <div className="text-slate-400 text-[10px]">{new Date(snap.synced_at).toLocaleString("id-ID")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                <p className="text-xs text-rose-500">Belum ada akun terhubung di cloud publisher. Tautkan akun terlebih dahulu.</p>
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

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Building2,
  RefreshCw,
  Lock,
  Mail,
  User,
  Sparkles,
  Plus,
  Shield,
  Layers,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { UserPermissions, DEFAULT_STAFF_PERMISSIONS } from "@/lib/auth";

interface StaffUser {
  id: string;
  username?: string | null;
  name: string;
  email: string;
  role: string;
  status: string;
  permissions: UserPermissions;
  assignedClients: Array<{ id: string; name: string }>;
  assignedClientIds: string[];
  created_at: string;
  updated_at: string | null;
}

interface ClientItem {
  id: string;
  name: string;
}

export function UserManagementView() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [formRole, setFormRole] = useState<"staff_social_media" | "admin">("staff_social_media");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");
  const [formPermissions, setFormPermissions] = useState<UserPermissions>(DEFAULT_STAFF_PERMISSIONS);
  const [formClientIds, setFormClientIds] = useState<string[]>([]);

  // Add Client Modal State
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [clientSubmitting, setClientSubmitting] = useState(false);

  // Fetch Users & Clients
  const fetchUsersData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat daftar pengguna.");
      }
      setUsers(data.users || []);
      setClients(data.clients || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsersData();
  }, [fetchUsersData]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormName("");
    setFormUsername("");
    setFormEmail("");
    setFormPassword("");
    setShowFormPassword(false);
    setFormRole("staff_social_media");
    setFormStatus("active");
    setFormPermissions({
      can_view_website_hub: false,
      can_view_social_hub: true,
      can_edit_social: true,
      can_manage_clients: false,
    });
    setFormClientIds([]);
    setShowUserModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: StaffUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormUsername(user.username || user.email.split("@")[0] || "");
    setFormEmail(user.email);
    setFormPassword(""); // Leave empty unless changing
    setShowFormPassword(false);
    setFormRole(user.role === "admin" ? "admin" : "staff_social_media");
    setFormStatus(user.status === "inactive" ? "inactive" : "active");
    setFormPermissions({ ...DEFAULT_STAFF_PERMISSIONS, ...user.permissions });
    setFormClientIds(user.assignedClientIds || []);
    setShowUserModal(true);
  };

  // Toggle Client Selection in Checklist
  const handleToggleClient = (clientId: string) => {
    setFormClientIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  // Submit User Form (Create or Update)
  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);
    try {
      const payload = {
        name: formName,
        username: formUsername,
        email: formEmail,
        password: formPassword,
        role: formRole,
        status: formStatus,
        permissions: formPermissions,
        clientIds: formClientIds,
      };

      const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users";
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal menyimpan data pengguna.");
      } else {
        setShowUserModal(false);
        fetchUsersData();
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setModalSubmitting(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (user: StaffUser) => {
    if (!confirm(`Yakin ingin menghapus pengguna "${user.name}" (${user.email})?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal menghapus pengguna.");
      } else {
        fetchUsersData();
      }
    } catch {
      alert("Gagal menghapus pengguna.");
    }
  };

  // Submit Add Client
  const handleSubmitNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    setClientSubmitting(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClientName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal menambah klien.");
      } else {
        setShowClientModal(false);
        setNewClientName("");
        fetchUsersData();
      }
    } catch {
      alert("Gagal menambah klien.");
    } finally {
      setClientSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Manajemen Akses &amp; Hak Pengguna</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Hak Akses Pengguna &amp; Penugasan Klien (RBAC)
          </h2>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
            Atur staf media sosial, isolasi penugasan klien khusus (misal: <strong>Kurnia Printing</strong> atau <strong>Erihome</strong>), serta kendalikan hak akses halaman Website Hub agar pekerjaan staf tetap terisolasi dengan aman.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap w-full md:w-auto">
          <button
            onClick={fetchUsersData}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all border border-slate-700 flex-1 sm:flex-none justify-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
          <button
            onClick={() => setShowClientModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all border border-slate-700 flex-1 sm:flex-none justify-center"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ Klien Baru</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/25 transition-all w-full sm:w-auto justify-center"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">Total Pengguna</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{users.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">Terdaftar di database</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-[11px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1 truncate">
            <Users className="w-3 h-3 text-indigo-600 shrink-0" />
            <span className="truncate">Staf Media Sosial</span>
          </span>
          <div className="text-xl sm:text-2xl font-black text-indigo-700 mt-1">
            {users.filter((u) => u.role === "staff_social_media").length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">Fokus penugasan klien</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1 truncate">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">Akun Aktif</span>
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
            {users.filter((u) => u.status === "active").length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">Dapat login &amp; akses</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-[11px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1 truncate">
            <Building2 className="w-3 h-3 text-purple-600 shrink-0" />
            <span className="truncate">Total Klien Terdaftar</span>
          </span>
          <div className="text-xl sm:text-2xl font-black text-purple-700 mt-1">{clients.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">Portofolio &amp; cabang</div>
        </div>
      </div>

      {/* USERS LIST CONTAINER */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
            Memuat daftar pengguna...
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 text-xs border border-slate-200">
            Belum ada staf yang terdaftar. Klik tombol "+ Tambah Pengguna" untuk menambahkan staf baru.
          </div>
        ) : (
          <>
            {/* MOBILE VIEW (< md): Responsive User Cards */}
            <div className="block md:hidden space-y-3">
              {users.map((user) => (
                <div key={user.id} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-xs text-slate-900 truncate">{user.name}</h3>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded font-mono">
                            @{user.username || user.email.split("@")[0]}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        user.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {user.status === "active" ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  {/* Role & Permissions badges */}
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {user.role === "admin" ? "🛡️ Administrator" : "📱 Staf Medsos"}
                    </span>
                    {user.permissions?.can_view_website_hub ? (
                      <span className="font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Web Hub: Ya
                      </span>
                    ) : (
                      <span className="font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                        Web Hub: Dikunci
                      </span>
                    )}
                    {user.permissions?.can_edit_social && (
                      <span className="font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                        Editor Medsos
                      </span>
                    )}
                  </div>

                  {/* Assigned Clients */}
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Klien yang Ditugaskan:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {user.assignedClients.length > 0 ? (
                        user.assignedClients.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-lg"
                          >
                            <Building2 className="w-2.5 h-2.5 text-indigo-600" />
                            {c.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-amber-600 italic">Belum ada klien yang ditugaskan</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-xl transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit Izin</span>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                      title="Hapus Pengguna"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW (>= md): Comprehensive Table */}
            <div className="hidden md:block bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Pengguna</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-4 min-w-[200px]">Klien yang Ditugaskan</th>
                      <th className="py-3 px-3">Izin Modul</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user, idx) => (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-extrabold text-slate-900 leading-tight">{user.name}</p>
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.2 rounded font-mono">
                                  @{user.username || user.email.split("@")[0]}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-slate-400 mt-0.5">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-bold px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {user.role === "admin" ? "🛡️ Admin" : "📱 Staf Medsos"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {user.assignedClients.length > 0 ? (
                              user.assignedClients.map((c) => (
                                <span
                                  key={c.id}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/90 px-2 py-0.5 rounded-lg"
                                >
                                  <Building2 className="w-2.5 h-2.5 text-indigo-600" />
                                  {c.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">Semua Klien (Admin)</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="space-y-0.5 text-[10px]">
                            <div className="flex items-center gap-1">
                              {user.permissions?.can_view_website_hub ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                  <Check className="w-3 h-3 text-emerald-600" /> Web Hub
                                </span>
                              ) : (
                                <span className="text-slate-400 flex items-center gap-0.5">
                                  <X className="w-3 h-3 text-slate-400" /> Web Hub
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {user.permissions?.can_view_social_hub ? (
                                <span className="text-indigo-700 font-bold flex items-center gap-0.5">
                                  <Check className="w-3 h-3 text-indigo-600" /> Social Hub
                                </span>
                              ) : (
                                <span className="text-slate-400 flex items-center gap-0.5">
                                  <X className="w-3 h-3 text-slate-400" /> Social Hub
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              user.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            {user.status === "active" ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors"
                              title="Edit Pengguna & Hak Akses"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                              title="Hapus Pengguna"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODAL: ADD / EDIT USER */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowUserModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 z-10 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                    {editingUser ? "Edit Pengguna & Hak Akses" : "Tambah Pengguna Baru"}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Atur kredensial, role, dan penugasan klien secara aman.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitUser} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Account Credentials */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Staf *</label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="bg-transparent text-xs text-slate-900 w-full outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username Login *</label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                    <span className="text-slate-400 font-bold text-xs select-none">@</span>
                    <input
                      type="text"
                      required
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                      placeholder="Contoh: kurnia atau erihome"
                      className="bg-transparent text-xs text-slate-900 w-full outline-none font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Digunakan staf/admin untuk masuk sistem (bukan alamat email).</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email (Opsional)</label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="Contoh: staff.kurnia@erihome.id"
                      className="bg-transparent text-xs text-slate-900 w-full outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {editingUser ? "Password Baru (Biarkan kosong jika tidak diubah)" : "Password Login *"}
                  </label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type={showFormPassword ? "text" : "password"}
                      required={!editingUser}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder={editingUser ? "•••••••• (tidak diubah)" : "Minimal 6 karakter"}
                      className="bg-transparent text-xs text-slate-900 w-full outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword((prev) => !prev)}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                      tabIndex={-1}
                    >
                      {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Peran (Role)</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  >
                    <option value="staff_social_media">Staf Media Sosial</option>
                    <option value="admin">Administrator Penuh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Akun</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  >
                    <option value="active">Aktif (Dapat Login)</option>
                    <option value="inactive">Nonaktif (Diblokir)</option>
                  </select>
                </div>
              </div>

              {/* MODULE PERMISSIONS MATRIX */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-extrabold text-slate-900">
                  Hak Akses Halaman &amp; Fitur (Permissions Matrix)
                </label>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.can_view_website_hub}
                      onChange={(e) =>
                        setFormPermissions((prev) => ({ ...prev, can_view_website_hub: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-800">
                      Boleh Akses Modul Website Hub (GSC, GA4, Kecepatan, SEO)
                    </span>
                  </label>
                  <p className="text-[10px] text-slate-400 pl-6">
                    Jika tidak dicentang, menu Website Hub disembunyikan total dari staf ini.
                  </p>

                  <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-slate-200/60">
                    <input
                      type="checkbox"
                      checked={formPermissions.can_view_social_hub}
                      onChange={(e) =>
                        setFormPermissions((prev) => ({ ...prev, can_view_social_hub: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-800">
                      Boleh Akses Modul Social Media Hub
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-slate-200/60">
                    <input
                      type="checkbox"
                      checked={formPermissions.can_edit_social}
                      onChange={(e) =>
                        setFormPermissions((prev) => ({ ...prev, can_edit_social: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-800">
                      Boleh Sinkronisasi Ekstensi, Menambah Ide &amp; Jadwal Konten
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-slate-200/60">
                    <input
                      type="checkbox"
                      checked={formPermissions.can_manage_clients}
                      onChange={(e) =>
                        setFormPermissions((prev) => ({ ...prev, can_manage_clients: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-800">
                      Boleh Mendaftarkan Akun Cabang Baru Klien (misal @erihome.bali)
                    </span>
                  </label>
                </div>
              </div>

              {/* CLIENT ASSIGNMENTS CHECKLIST */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-900">
                    Penugasan Klien Khusus (Client Scoping) *
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {formClientIds.length} klien dipilih
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Staf ini hanya dapat melihat data media sosial dari klien yang dicentang di bawah ini:
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar">
                  {clients.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">Belum ada klien di sistem.</p>
                  ) : (
                    clients.map((client) => {
                      const checked = formClientIds.includes(client.id);
                      return (
                        <label
                          key={client.id}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            checked ? "bg-indigo-50 border border-indigo-200/80" : "hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleClient(client.id)}
                            className="rounded text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                          />
                          <Building2 className={`w-3.5 h-3.5 ${checked ? "text-indigo-600" : "text-slate-400"}`} />
                          <span className={`text-xs font-semibold ${checked ? "text-indigo-950 font-bold" : "text-slate-700"}`}>
                            {client.name}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                >
                  {modalSubmitting ? "Menyimpan..." : editingUser ? "Simpan Perubahan" : "Buat Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CLIENT */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowClientModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Tambah Klien Baru
              </h3>
              <button
                onClick={() => setShowClientModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewClient} className="pt-3 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Klien / Perusahaan *</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Contoh: Kurnia Printing"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={clientSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  {clientSubmitting ? "Menyimpan..." : "Tambah Klien"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


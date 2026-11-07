"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export function LoginForm({ nextPath = "/dashboard" }: { nextPath?: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        return setError(data.error || "Username atau password salah.");
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setLoading(false);
      setError("Terjadi gangguan koneksi ke server. Silakan coba lagi.");
    }
  }

  return (
    <form onSubmit={submit} className="form-stack">
      {/* Username Field */}
      <div>
        <label htmlFor="login-username" className="block text-xs font-bold text-slate-700 mb-1.5">
          Username
        </label>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <User
            style={{
              position: "absolute",
              left: "14px",
              width: "16px",
              height: "16px",
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          />
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin, han, kurnia, atau erihome"
            autoComplete="username"
            required
            autoFocus
            style={{ width: "100%", paddingLeft: "40px" }}
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 mb-1.5">
          Password
        </label>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Lock
            style={{
              position: "absolute",
              left: "14px",
              width: "16px",
              height: "16px",
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          />
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            style={{ width: "100%", paddingLeft: "40px", paddingRight: "42px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: "absolute",
              right: "12px",
              background: "none",
              border: "none",
              padding: "4px",
              cursor: "pointer",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            tabIndex={-1}
            aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
          >
            {showPassword ? <EyeOff style={{ width: "16px", height: "16px" }} /> : <Eye style={{ width: "16px", height: "16px" }} />}
          </button>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <button
        type="submit"
        className="button primary wide"
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        <span>{loading ? "Memverifikasi..." : "Masuk ke Dashboard"}</span>
        {!loading && <ArrowRight style={{ width: "16px", height: "16px" }} />}
      </button>

      <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#64748b", textAlign: "center", lineHeight: "1.4" }}>
        Masuk sebagai Admin, Pemeriksa Laporan (Han), atau Staf Medsos menggunakan username.
      </p>
    </form>
  );
}

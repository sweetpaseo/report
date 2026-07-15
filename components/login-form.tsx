"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ nextPath = "/dashboard" }: { nextPath?: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError("");
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) return setError(data.error || "Gagal masuk.");
    router.replace(nextPath);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="form-stack">
       <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
      {error && <p className="form-error">{error}</p>}
      <button className="button primary wide" disabled={loading}>{loading ? "Memeriksa…" : "Masuk"}</button>
    </form>
  );
}

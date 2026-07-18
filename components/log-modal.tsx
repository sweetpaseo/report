import { useEffect, useState } from "react";
import { Modal } from "./modal";
import { Activity, AlertCircle, Info, AlertTriangle } from "lucide-react";

export function LogModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/logs?limit=100")
      .then(res => res.json())
      .then(data => {
        if (data.logs) setLogs(data.logs);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load logs", err);
        setLoading(false);
      });
  }, [open]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Sistem Log">
      <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
        {loading ? (
          <p style={{ padding: "20px", textAlign: "center" }}>Memuat log...</p>
        ) : logs.length === 0 ? (
          <p style={{ padding: "20px", textAlign: "center" }}>Belum ada log yang tercatat.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Level</th>
                <th>Konteks</th>
                <th>Pesan</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{new Date(log.created_at).toLocaleString("id-ID")}</td>
                  <td>
                    {log.level === "ERROR" && <span style={{ color: "var(--red)", display: "flex", gap: "4px", alignItems: "center" }}><AlertCircle size={14} /> ERROR</span>}
                    {log.level === "WARNING" && <span style={{ color: "orange", display: "flex", gap: "4px", alignItems: "center" }}><AlertTriangle size={14} /> WARN</span>}
                    {log.level === "INFO" && <span style={{ color: "var(--blue)", display: "flex", gap: "4px", alignItems: "center" }}><Info size={14} /> INFO</span>}
                  </td>
                  <td>{log.context}</td>
                  <td>{log.message}</td>
                  <td>
                    <details>
                      <summary style={{ cursor: "pointer", color: "var(--blue)" }}>Lihat Detail</summary>
                      <pre style={{ background: "#f4f4f5", padding: "8px", borderRadius: "4px", marginTop: "4px", fontSize: "11px", overflowX: "auto" }}>
                        {log.details ? JSON.stringify(JSON.parse(log.details), null, 2) : "-"}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
}

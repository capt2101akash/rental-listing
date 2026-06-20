"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RequestsTable({ initialRequests }: { initialRequests: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setLoadingId(id);
    await fetch(`/api/admin/requests/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    setLoadingId(null);
    router.refresh();
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ backgroundColor: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
          <th style={{ padding: "1rem" }}>Email</th>
          <th style={{ padding: "1rem" }}>Phone</th>
          <th style={{ padding: "1rem" }}>Address</th>
          <th style={{ padding: "1rem" }}>Status</th>
          <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {initialRequests.map(req => (
          <tr key={req.id} style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ padding: "1rem" }}>{req.email}</td>
            <td style={{ padding: "1rem", color: "var(--text-muted)" }}>{req.phone}</td>
            <td style={{ padding: "1rem", color: "var(--text-muted)" }}>{req.address}</td>
            <td style={{ padding: "1rem" }}>
              <span style={{ 
                fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "999px", fontWeight: 600,
                backgroundColor: req.status === "PENDING" ? "rgba(245, 158, 11, 0.1)" : req.status === "APPROVED" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                color: req.status === "PENDING" ? "#F59E0B" : req.status === "APPROVED" ? "#10B981" : "#EF4444"
              }}>
                {req.status}
              </span>
            </td>
            <td style={{ padding: "1rem" }}>
              {req.status === "PENDING" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                  <button onClick={() => handleAction(req.id, 'approve')} disabled={loadingId === req.id} style={{ backgroundColor: "#10B981", color: "white", fontWeight: 600, padding: "0.4rem 1.25rem", borderRadius: "999px", minWidth: "110px", textAlign: "center", transition: "opacity 0.2s", opacity: loadingId === req.id ? 0.7 : 1 }}>Approve</button>
                  <button onClick={() => handleAction(req.id, 'reject')} disabled={loadingId === req.id} style={{ backgroundColor: "#EF4444", color: "white", fontWeight: 600, padding: "0.4rem 1.25rem", borderRadius: "999px", minWidth: "110px", textAlign: "center", transition: "opacity 0.2s", opacity: loadingId === req.id ? 0.7 : 1 }}>Reject</button>
                </div>
              )}
            </td>
          </tr>
        ))}
        {initialRequests.length === 0 && (
          <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No requests found.</td></tr>
        )}
      </tbody>
    </table>
  );
}

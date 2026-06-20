"use client";
import { useState } from "react";

export function BookingForm({ propertyId, roomId, title = "Request to Lease" }: { propertyId: string, roomId?: string, title?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    
    const formData = new FormData(e.currentTarget);
    const data = {
      propertyId,
      roomId,
      studentName: formData.get("studentName"),
      studentEmail: formData.get("studentEmail"),
      studentPhone: formData.get("studentPhone"),
      budget: formData.get("budget"),
      requirements: formData.get("requirements"),
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error("Failed to submit");
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
        {title}
      </button>
    );
  }

  if (status === "success") {
    return (
      <div style={{ padding: "1.5rem", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10B981", borderRadius: "var(--radius-md)", textAlign: "center" }}>
        <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Request Sent Successfully!</h3>
        <p style={{ fontSize: "0.875rem" }}>The property owner has been notified and will contact you shortly.</p>
        <button onClick={() => setIsOpen(false)} style={{ marginTop: "1rem", color: "var(--text-main)", textDecoration: "underline" }}>Close</button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontWeight: 600 }}>{title}</h3>
        <button onClick={() => setIsOpen(false)} style={{ color: "var(--text-muted)", fontSize: "1.25rem" }}>&times;</button>
      </div>
      
      {status === "error" && (
        <div style={{ padding: "0.75rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", borderRadius: "var(--radius-md)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          Something went wrong. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input type="text" name="studentName" required placeholder="Full Name" style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", width: "100%" }} />
        <input type="email" name="studentEmail" required placeholder="Email Address" style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", width: "100%" }} />
        <input type="tel" name="studentPhone" required placeholder="Phone Number" style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", width: "100%" }} />
        <input type="text" name="budget" placeholder="Monthly Budget (e.g. $1000)" style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", width: "100%" }} />
        <textarea name="requirements" placeholder="Any specific requirements or messages for the owner?" rows={3} style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", width: "100%", fontFamily: "inherit" }}></textarea>
        <button type="submit" className="btn-primary" disabled={status === "loading"} style={{ width: "100%", justifyContent: "center" }}>
          {status === "loading" ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}

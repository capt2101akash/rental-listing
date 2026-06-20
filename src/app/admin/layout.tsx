import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  return (
    <div className="container" style={{ padding: "2rem 0", display: "flex", gap: "2rem", minHeight: "80vh" }}>
      <aside style={{ width: "250px", flexShrink: 0 }}>
        <div className="glass-panel" style={{ padding: "1.5rem", position: "sticky", top: "100px" }}>
          <h2 className="heading-md text-gradient" style={{ marginBottom: "1.5rem" }}>Admin Console</h2>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link href="/admin" style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", fontWeight: 500, backgroundColor: "var(--background)", border: "1px solid var(--border)", display: "block" }}>Overview</Link>
            <Link href="/admin/requests" style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", fontWeight: 500, backgroundColor: "var(--background)", border: "1px solid var(--border)", display: "block" }}>Signup Requests</Link>
            <Link href="/admin/properties" style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", fontWeight: 500, backgroundColor: "var(--background)", border: "1px solid var(--border)", display: "block" }}>All Properties</Link>
          </nav>
        </div>
      </aside>
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}

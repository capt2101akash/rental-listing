import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const pendingRequests = await prisma.signUpRequest.count({ where: { status: "PENDING" } });
  const totalOwners = await prisma.user.count({ where: { role: "OWNER" } });
  const totalProperties = await prisma.property.count();

  return (
    <div>
      <h1 className="heading-lg" style={{ marginBottom: "2rem" }}>Admin Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ color: "var(--text-muted)", fontSize: "0.875rem", textTransform: "uppercase" }}>Pending Signups</h3>
          <div className="heading-lg text-gradient">{pendingRequests}</div>
        </div>
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ color: "var(--text-muted)", fontSize: "0.875rem", textTransform: "uppercase" }}>Registered Owners</h3>
          <div className="heading-lg text-gradient">{totalOwners}</div>
        </div>
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ color: "var(--text-muted)", fontSize: "0.875rem", textTransform: "uppercase" }}>Total Properties</h3>
          <div className="heading-lg text-gradient">{totalProperties}</div>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AcknowledgeButton } from "@/components/AcknowledgeButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const properties = await prisma.property.findMany({
    where: { ownerId: userId },
    include: { rooms: true, bookings: true }
  });

  const totalProperties = properties.length;
  let availableRooms = 0;
  let upcomingViewings = 0;

  properties.forEach(p => {
    availableRooms += p.rooms.filter(r => !r.isRented).length;
    if (!p.isRented && p.rooms.length === 0) availableRooms += 1; // Count whole house as 1 available space if no rooms
    upcomingViewings += p.bookings.filter(b => b.status === "PENDING" || b.status === "CONFIRMED").length;
  });

  const pendingBookings = properties
    .flatMap(p => p.bookings)
    .filter(b => b.status === "PENDING")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="container" style={{ padding: "4rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="heading-lg">Owner Dashboard</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/dashboard/properties" className="btn-secondary">Manage Properties</Link>
          <Link href="/dashboard/calendar" className="btn-primary">View Calendar</Link>
        </div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ color: "var(--text-muted)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Total Properties</h3>
          <div className="heading-lg text-gradient">{totalProperties}</div>
        </div>
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ color: "var(--text-muted)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Available Rooms</h3>
          <div className="heading-lg text-gradient">{availableRooms}</div>
        </div>
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ color: "var(--text-muted)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Upcoming Viewings</h3>
          <div className="heading-lg text-gradient">{upcomingViewings}</div>
        </div>
      </div>
      
      <h2 className="heading-md" style={{ marginBottom: "1rem" }}>Recent Activity</h2>
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        {pendingBookings.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>No pending requests to acknowledge.</p>
        ) : (
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {pendingBookings.map(b => {
              return (
                <li key={b.id} style={{ paddingBottom: "1rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontWeight: 500 }}>Viewing request from {b.studentEmail}</p>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{b.createdAt.toLocaleDateString()} - Status: <span style={{ color: "#F59E0B" }}>{b.status}</span></p>
                  </div>
                  <AcknowledgeButton bookingId={b.id} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

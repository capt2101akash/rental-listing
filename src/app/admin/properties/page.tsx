import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export default async function AdminPropertiesPage() {
  // Fetch properties and owners independently so Prisma doesn't use an INNER JOIN
  // which completely hides orphaned properties at the SQL level.
  const rawProperties = await prisma.property.findMany();
  const ownerIds = [...new Set(rawProperties.map(p => p.ownerId))];
  const owners = await prisma.user.findMany({ where: { id: { in: ownerIds } } });
  
  const properties = rawProperties.map(prop => {
    const owner = owners.find(o => o.id === prop.ownerId) || null;
    return { ...prop, owner };
  });

  async function deletePropertyAdmin(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session || (session?.user as any)?.role !== "ADMIN") return;
    
    const id = formData.get("id") as string;
    await prisma.property.delete({ where: { id } });
    revalidatePath("/admin/properties");
  }

  return (
    <div>
      <h1 className="heading-lg" style={{ marginBottom: "2rem" }}>All Properties</h1>
      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
              <th style={{ padding: "1rem" }}>Address</th>
              <th style={{ padding: "1rem" }}>Owner Email</th>
              <th style={{ padding: "1rem" }}>Status</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(prop => {
              const isOrphaned = !prop.owner;
              return (
                <tr key={prop.id} style={{ borderBottom: "1px solid var(--border)", backgroundColor: isOrphaned ? "rgba(239, 68, 68, 0.05)" : "transparent" }}>
                  <td style={{ padding: "1rem", fontWeight: 500 }}>
                    {prop.address}
                    {isOrphaned && <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#EF4444", fontWeight: 600, padding: "0.1rem 0.4rem", border: "1px solid #EF4444", borderRadius: "99px" }}>ORPHANED</span>}
                  </td>
                  <td style={{ padding: "1rem", color: isOrphaned ? "#EF4444" : "var(--text-muted)" }}>
                    {isOrphaned ? "No Owner Found" : prop.owner?.email}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {prop.isRented ? "Rented" : "Available"}
                  </td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  <form action={deletePropertyAdmin} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={prop.id} />
                    <button type="submit" style={{ color: "#EF4444", fontWeight: 500 }}>Delete (Admin)</button>
                  </form>
                </td>
              </tr>
              );
            })}
            {properties.length === 0 && (
              <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No properties listed.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";

export default async function SettingsPage({ searchParams }: { searchParams: { error?: string, success?: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/login");
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) return <div>User not found</div>;

  async function updateSettings(formData: FormData) {
    "use server";
    
    // Verify session dynamically inside the action
    const session = await getServerSession(authOptions);
    if (!session) {
      redirect("/auth/login");
    }
    const currentUserId = (session.user as any).id;
    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
    if (!currentUser) throw new Error("User not found");

    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    
    const updateData: any = { phone, address };

    if (currentPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, currentUser.passwordHash);
      if (!isValidPassword) {
        redirect("/settings?error=Invalid current password");
      }
      
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: currentUserId },
        data: { phone, address, passwordHash: newPasswordHash }
      });
      redirect("/settings?success=Profile and password updated successfully");
    } else {
      await prisma.user.update({
        where: { id: currentUserId },
        data: { phone, address }
      });
      redirect("/settings?success=Profile updated successfully");
    }
  }

  return (
    <div className="container" style={{ padding: "4rem 0", maxWidth: "800px" }}>
      <h1 className="heading-lg" style={{ marginBottom: "2rem" }}>Account Settings</h1>
      
      {searchParams.error && (
        <div style={{ padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", borderRadius: "var(--radius-md)", marginBottom: "2rem" }}>
          {searchParams.error}
        </div>
      )}
      
      {searchParams.success && (
        <div style={{ padding: "1rem", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10B981", borderRadius: "var(--radius-md)", marginBottom: "2rem" }}>
          {searchParams.success}
        </div>
      )}

      <div className="glass-panel" style={{ padding: "3rem" }}>
        <form action={updateSettings} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Email Address</label>
            <input type="email" disabled defaultValue={user.email} style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "rgba(0,0,0,0.05)", color: "var(--text-muted)" }} />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Email cannot be changed directly.</p>
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Phone Number</label>
            <input type="tel" name="phone" defaultValue={user.phone || ""} style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text-main)" }} />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "var(--text-secondary)" }}>Property Address (or primary location)</label>
            <AddressAutocomplete name="address" defaultValue={user.address || ""} style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text-main)" }} />
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem", marginTop: "1rem" }}>
            <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Change Password</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>Leave these fields blank if you do not want to change your password.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Current Password</label>
                <input type="password" name="currentPassword" placeholder="••••••••" style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text-main)" }} />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>New Password</label>
                <input type="password" name="newPassword" placeholder="••••••••" minLength={6} style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text-main)" }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

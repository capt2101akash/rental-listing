import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/login");
  }
  
  if ((session.user as any).role === "ADMIN") {
    redirect("/admin");
  }
  
  if ((session.user as any).role !== "OWNER") {
    redirect("/auth/login");
  }
  
  return <>{children}</>;
}

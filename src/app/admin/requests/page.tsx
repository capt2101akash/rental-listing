import { prisma } from "@/lib/prisma";
import RequestsTable from "./RequestsTable";

export default async function AdminRequestsPage() {
  const requests = await prisma.signUpRequest.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1 className="heading-lg" style={{ marginBottom: "2rem" }}>Signup Requests</h1>
      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <RequestsTable initialRequests={requests} />
      </div>
    </div>
  );
}

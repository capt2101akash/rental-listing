import Link from 'next/link';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AddPropertyForm } from '@/components/AddPropertyForm';
import { ManagePropertiesClient } from '@/components/ManagePropertiesClient';

export default async function ManagePropertiesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return <div style={{ padding: "4rem", textAlign: "center" }}>Unauthorized. Please log in as an owner.</div>;
  }

  const properties = await prisma.property.findMany({
    where: { ownerId: userId },
    include: { rooms: true }
  });

  return (
    <div className="container" style={{ padding: "4rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="heading-lg">Manage Properties</h1>
      </div>
      
      <ManagePropertiesClient properties={properties} />

      <div style={{ marginTop: "4rem" }}>
        <h2 className="heading-md" style={{ marginBottom: "1.5rem" }}>Add New Property</h2>
        <AddPropertyForm />
      </div>
    </div>
  );
}

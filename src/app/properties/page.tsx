import { prisma } from '@/lib/prisma';
import { PropertiesFilterClient } from '@/components/PropertiesFilterClient';

export const dynamic = 'force-dynamic';

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    include: { rooms: true, media: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container" style={{ padding: "4rem 0", maxWidth: "1200px" }}>
      <div style={{ marginBottom: "3rem" }}>
        <h1 className="heading-xl">Find Your Next <span className="text-gradient">Home</span></h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.125rem", marginTop: "0.5rem" }}>
          Filter by walking distance to CSUN, budget, and room type.
        </p>
      </div>
      
      <PropertiesFilterClient initialProperties={properties} />
    </div>
  );
}

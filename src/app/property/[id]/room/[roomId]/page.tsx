import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { BookingForm } from '@/components/BookingForm';

export default async function RoomDetailsPage({ params }: { params: Promise<{ id: string, roomId: string }> }) {
  const { roomId } = await params;
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { property: true, media: true }
  });

  if (!room) return notFound();

  const roomImages = room.media || [];

  return (
    <div className="container" style={{ padding: "4rem 0", maxWidth: "800px" }}>
      <Link href={`/property/${room.propertyId}`} style={{ display: "inline-block", marginBottom: "2rem", color: "var(--text-muted)", fontWeight: 500 }}>
        &larr; Back to Property
      </Link>
      
      <div className="glass-panel" style={{ padding: "2.5rem" }}>
        {roomImages.length > 0 ? (
          <div style={{ display: "flex", gap: "1rem", overflowX: "auto", marginBottom: "2rem", paddingBottom: "1rem" }}>
            {roomImages.map((img) => (
              <img key={img.id} src={img.url} alt="Room media" style={{ borderRadius: "var(--radius-lg)", height: "350px", objectFit: "cover", flexShrink: 0, minWidth: "300px" }} />
            ))}
          </div>
        ) : (
          <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", height: "350px", marginBottom: "2rem", backgroundColor: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
            [No Images Available]
          </div>
        )}
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div style={{ flex: "1 1 300px", minWidth: "min(100%, 250px)" }}>
            <h1 className="heading-lg" style={{ marginBottom: "0.5rem" }}>Room Details</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>at {room.property.address}</p>
            <div style={{ color: "var(--text-main)", fontSize: "1.05rem", lineHeight: 1.8, whiteSpace: "pre-wrap", backgroundColor: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              {room.description}
            </div>
          </div>
          <div style={{ textAlign: "right", flex: "1 1 200px" }}>
            <div className="heading-md text-gradient">${room.rent}/mo</div>
            <span style={{ 
              display: "inline-block",
              marginTop: "0.5rem",
              fontSize: "0.75rem", 
              padding: "0.25rem 0.75rem", 
              borderRadius: "999px",
              backgroundColor: room.isRented ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
              color: room.isRented ? "#EF4444" : "#10B981",
              fontWeight: 600
            }}>
              {room.isRented ? "Rented" : "Available Now"}
            </span>
            {room.isSharing && (
              <div style={{ marginTop: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "999px", backgroundColor: "#10B981", color: "white", fontWeight: 600 }}>
                  Available for Sharing
                </span>
              </div>
            )}
            
            {room.leaseTerm && (
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                {room.leaseTerm.split(", ").map((term: string) => (
                  <span key={term} style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "var(--radius-md)", backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-main)" }}>
                    {term}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h3 style={{ fontWeight: 600, fontSize: "1.25rem" }}>Interested in this room?</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {room.isRented ? (
              <button className="btn-primary" style={{ padding: "1rem" }} disabled>
                <span style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>Request to Lease</span>
                <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Room is currently rented</span>
              </button>
            ) : (
              <BookingForm propertyId={room.propertyId} roomId={room.id} title="Request to Lease" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

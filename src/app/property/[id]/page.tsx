import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { BookingForm } from '@/components/BookingForm';

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: { 
      media: true,
      rooms: {
        include: { media: true }
      }
    }
  });

  if (!property) return notFound();

  const mainImage = property.media && property.media.length > 0 ? property.media[0].url : null;

  return (
    <div className="container" style={{ padding: "4rem 0" }}>
      <Link href="/properties" style={{ display: "inline-block", marginBottom: "2rem", color: "var(--text-muted)", fontWeight: 500 }}>
        &larr; Back to Properties
      </Link>
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        {/* Left Side: Property Image and Description */}
        <div style={{ flex: "2 1 400px", minWidth: "min(100%, 400px)", display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", height: "300px", position: "relative", backgroundColor: "var(--border)" }}>
              {mainImage ? (
                <img src={mainImage} alt={property.address} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                  <span>[No Image Available]</span>
                </div>
              )}
            </div>
            
            <div>
              <h1 className="heading-lg" style={{ marginBottom: "0.5rem" }}>{property.address}</h1>
              
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                {property.rentWholeHouse && (
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, backgroundColor: "#10B981", color: "white", padding: "0.25rem 0.5rem", borderRadius: "var(--radius-md)" }}>
                    Whole Property
                  </span>
                )}
                {property.rentIndividually && (
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, backgroundColor: "#10B981", color: "white", padding: "0.25rem 0.5rem", borderRadius: "var(--radius-md)" }}>
                    Individual Rooms
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem", fontSize: "1rem", fontWeight: 500, color: "var(--text-main)" }}>
                {property.bedrooms ? <span>🛏 {property.bedrooms} Bedrooms</span> : null}
                {property.bathrooms ? <span>🛁 {property.bathrooms} Bathrooms</span> : null}
              </div>

              <div style={{ color: "var(--text-muted)", fontSize: "1.1rem", lineHeight: 1.8, whiteSpace: "pre-wrap", backgroundColor: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                {property.description}
              </div>
            </div>
            
            {property.rentWholeHouse && (
              <div style={{ marginTop: "1rem" }}>
                <div style={{ backgroundColor: "var(--background)", padding: "1.5rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ fontWeight: 600 }}>Whole House Rent:</span>
                    {property.wholeHouseRent ? (
                      <span className="heading-md text-gradient">${property.wholeHouseRent}/mo</span>
                    ) : (
                      <span className="heading-md text-gradient">N/A</span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                    Interested in renting the entire property? Contact us or submit a request directly.
                  </p>
                </div>
                
                <BookingForm propertyId={property.id} title="Request Whole House Lease" />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Rooms Dialogs / Cards */}
        <div style={{ flex: "1 1 350px", minWidth: "min(100%, 300px)", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {property.rentIndividually ? (
            <>
              <h2 className="heading-md">Available Rooms</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {property.rooms.map((room: any) => {
                  const roomImage = room.media && room.media.length > 0 ? room.media[0].url : null;
                  return (
                    <Link href={`/property/${property.id}/room/${room.id}`} key={room.id} style={{ pointerEvents: room.isRented ? 'none' : 'auto', opacity: room.isRented ? 0.6 : 1, textDecoration: 'none' }}>
                      <div className="card glass-panel" style={{ padding: "1rem", display: "flex", gap: "1.5rem", alignItems: "center", transition: "transform 0.2s ease", cursor: "pointer" }}>
                        {/* Thumbnail */}
                        <div style={{ width: "120px", height: "120px", flexShrink: 0, borderRadius: "var(--radius-md)", overflow: "hidden", backgroundColor: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {roomImage ? (
                            <img src={roomImage} alt={room.description} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", padding: "0.5rem" }}>No Image</span>
                          )}
                        </div>

                        {/* Room Details */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                          <h3 style={{ 
                            fontSize: "1rem", 
                            fontWeight: 500, 
                            marginBottom: "1rem", 
                            color: "var(--text-main)",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: "1.5"
                          }}>
                            {room.description}
                          </h3>
                          
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                            <span style={{ color: "var(--primary)", fontWeight: 700, fontSize: "1.125rem" }}>${room.rent}/mo</span>
                            <span style={{ 
                              fontSize: "0.75rem", 
                              padding: "0.25rem 0.6rem", 
                              borderRadius: "999px",
                              backgroundColor: room.isRented ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                              color: room.isRented ? "#EF4444" : "#10B981",
                              fontWeight: 600
                            }}>
                              {room.isRented ? "Rented" : "Available"}
                            </span>
                          </div>
                          
                          {(room.leaseTerm || room.isSharing) && (
                            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                              {room.leaseTerm && room.leaseTerm.split(", ").map((term: string) => (
                                <span key={term} style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: "var(--radius-md)", backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                                  {term}
                                </span>
                              ))}
                              {room.isSharing && (
                                <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: "999px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10B981", fontWeight: 600 }}>
                                  Sharing Allowed
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {property.rooms.length === 0 && (
                  <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                    No individual rooms listed for this property.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="glass-panel" style={{ padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
                This property is only available as a whole-house rental.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from 'next/link';

type Property = any; // Will use inferred types, avoiding strict typings for speed

export function PropertiesFilterClient({ initialProperties }: { initialProperties: Property[] }) {
  const [maxDistance, setMaxDistance] = useState<number>(45); // 0-45+ minutes
  const [maxPrice, setMaxPrice] = useState<number>(10000); // 0-10000+ dollars
  const [roomType, setRoomType] = useState<"ANY" | "PRIVATE" | "SHARED">("ANY");

  // Filtering Logic
  const filteredProperties = useMemo(() => {
    return initialProperties.filter((property) => {
      // 1. Distance Filter
      if (property.walkingMinutesToCsun !== null && property.walkingMinutesToCsun > maxDistance && maxDistance < 45) {
        return false; // exclude if it's further than maxDistance (and max isn't 45+)
      }

      const hasPerfectMatch = () => {
        if (property.rentWholeHouse && property.wholeHouseRent) {
          if (roomType !== "SHARED" && (property.wholeHouseRent <= maxPrice || maxPrice >= 10000)) return true;
        }
        if (property.rentIndividually && property.rooms) {
          return property.rooms.some((r: any) => {
            if (r.isRented) return false;
            if (roomType === "PRIVATE" && r.isSharing) return false;
            if (roomType === "SHARED" && !r.isSharing) return false;
            if (r.rent > maxPrice && maxPrice < 10000) return false;
            return true;
          });
        }
        return false;
      }

      return hasPerfectMatch();
    });
  }, [initialProperties, maxDistance, maxPrice, roomType]);

  return (
    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start" }}>
      
      {/* Sidebar Filters */}
      <aside className="glass-panel sticky-desktop-only" style={{ flex: "1 1 300px", minWidth: "280px", maxWidth: "100%", padding: "1.5rem", position: "sticky", top: "2rem", zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
          <h2 style={{ fontWeight: 600, fontSize: "1.25rem" }}>Filters</h2>
          <button onClick={() => { setMaxDistance(45); setMaxPrice(10000); setRoomType("ANY"); }} style={{ fontSize: "0.875rem", color: "var(--primary)", fontWeight: 500 }}>Reset</button>
        </div>

        {/* Distance Filter */}
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", fontWeight: 500 }}>
            <span>Walking to CSUN</span>
            <span style={{ color: "var(--primary)", fontWeight: 600 }}>{maxDistance >= 45 ? "Any" : `< ${maxDistance} mins`}</span>
          </label>
          <input 
            type="range" 
            min="5" 
            max="45" 
            step="5"
            value={maxDistance} 
            onChange={(e) => setMaxDistance(parseInt(e.target.value))} 
            style={{ width: "100%", accentColor: "var(--primary)", cursor: "pointer" }} 
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
            <span>5m</span>
            <span>45m+</span>
          </div>
        </div>

        {/* Price Filter */}
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", fontWeight: 500 }}>
            <span>Max Price / mo</span>
            <span style={{ color: "var(--primary)", fontWeight: 600 }}>{maxPrice >= 10000 ? "$10,000+" : `$${maxPrice}`}</span>
          </label>
          <input 
            type="range" 
            min="300" 
            max="10000" 
            step="100"
            value={maxPrice} 
            onChange={(e) => setMaxPrice(parseInt(e.target.value))} 
            style={{ width: "100%", accentColor: "var(--primary)", cursor: "pointer" }} 
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
            <span>$300</span>
            <span>$10,000+</span>
          </div>
        </div>

        {/* Room Type Toggle */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: 500 }}>Room Type</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {(["ANY", "PRIVATE", "SHARED"] as const).map(type => (
              <label key={type} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", border: "1px solid", borderColor: roomType === type ? "var(--primary)" : "var(--border)", backgroundColor: roomType === type ? "rgba(16, 185, 129, 0.05)" : "var(--surface)", borderRadius: "var(--radius-md)", cursor: "pointer", transition: "all 0.2s" }}>
                <input 
                  type="radio" 
                  name="roomType" 
                  value={type} 
                  checked={roomType === type} 
                  onChange={() => setRoomType(type)} 
                  style={{ accentColor: "var(--primary)", width: "1.25rem", height: "1.25rem" }} 
                />
                <span style={{ fontWeight: roomType === type ? 600 : 500 }}>
                  {type === "ANY" ? "Any Type" : type === "PRIVATE" ? "Private Room" : "Shared Room"}
                </span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content: Properties Grid */}
      <main style={{ flex: "3 1 600px", minWidth: "min(100%, 300px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <p style={{ color: "var(--text-muted)", fontWeight: 500 }}>Showing {filteredProperties.length} propert{filteredProperties.length === 1 ? 'y' : 'ies'}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: "2rem" }}>
          {filteredProperties.map((property) => {
            const mainImage = property.media && property.media.length > 0 ? property.media[0].url : null;
            
            return (
              <Link href={`/property/${property.id}`} key={property.id} style={{ pointerEvents: property.isRented ? 'none' : 'auto', opacity: property.isRented ? 0.6 : 1 }}>
                <div className="card glass-panel" style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", position: "relative", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  {property.isRented && (
                    <div style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 10, backgroundColor: "#EF4444", color: "white", padding: "0.5rem 1rem", borderRadius: "var(--radius-md)", fontWeight: "bold", fontSize: "0.875rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                      Fully Rented
                    </div>
                  )}
                  <div style={{ backgroundColor: "var(--border)", height: "200px", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", overflow: "hidden", position: "relative" }}>
                    {mainImage ? (
                      <img src={mainImage} alt={property.address} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span>[No Image Available]</span>
                    )}
                    
                    {/* Floating Distance Badge */}
                    {property.walkingMinutesToCsun !== null && (
                      <div style={{ position: "absolute", bottom: "0.5rem", left: "0.5rem", backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", color: "white", padding: "0.25rem 0.5rem", borderRadius: "var(--radius-md)", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        🚶‍♂️ {property.walkingMinutesToCsun} min walk to CSUN
                      </div>
                    )}
                  </div>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem", lineHeight: 1.4 }}>{property.address}</h2>
                <p style={{ color: "var(--text-muted)", flex: 1, marginBottom: "1rem", fontSize: "0.875rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{property.description}</p>
                
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  {property.bedrooms ? <span>🛏 {property.bedrooms} Beds</span> : null}
                  {property.bathrooms ? <span>🛁 {property.bathrooms} Baths</span> : null}
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                  <div>
                    {property.rentIndividually && property.rooms && property.rooms.length > 0 ? (
                      <span style={{ fontWeight: 600, color: "var(--primary)" }}>From ${Math.min(...property.rooms.filter((r:any) => !r.isRented).map((r:any) => r.rent)) || 0}/mo</span>
                    ) : property.wholeHouseRent ? (
                      <span style={{ fontWeight: 600, color: "var(--primary)" }}>${property.wholeHouseRent}/mo</span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>Price N/A</span>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {property.rentWholeHouse && (
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-main)", padding: "0.25rem 0.5rem", borderRadius: "var(--radius-md)" }}>
                        Whole Prop
                      </span>
                    )}
                    {property.rentIndividually && (
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10B981", padding: "0.25rem 0.5rem", borderRadius: "var(--radius-md)" }}>
                        Rooms
                      </span>
                    )}
                  </div>
                </div>
                </div>
              </Link>
            );
          })}
          {filteredProperties.length === 0 && (
            <div style={{ gridColumn: "1 / -1", padding: "4rem", textAlign: "center", color: "var(--text-muted)", backgroundColor: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>🔍</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.5rem" }}>No properties match your filters</h3>
              <p>Try increasing your max price or walking distance to see more results.</p>
              <button onClick={() => { setMaxDistance(45); setMaxPrice(10000); setRoomType("ANY"); }} className="btn-secondary" style={{ marginTop: "1.5rem" }}>Clear Filters</button>
            </div>
          )}
        </div>
      </main>
      
    </div>
  );
}

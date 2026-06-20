"use client";

import { useState, useMemo } from "react";
import Link from 'next/link';
import { Filter, X } from 'lucide-react';

type Property = any; // Will use inferred types, avoiding strict typings for speed

export function PropertiesFilterClient({ initialProperties }: { initialProperties: Property[] }) {
  const [maxDistance, setMaxDistance] = useState<number>(45); // 0-45+ minutes
  const [maxPrice, setMaxPrice] = useState<number>(10000); // 0-10000+ dollars
  const [roomType, setRoomType] = useState<"ANY" | "PRIVATE" | "SHARED">("ANY");
  
  // Mobile filter modal state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start", position: "relative" }}>
      
      {/* Mobile Filter Toggle Button */}
      <div className="mobile-filter-toggle" style={{ width: "100%", display: "none", marginBottom: "1rem" }}>
        <button 
          onClick={() => setIsFilterOpen(true)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "1rem", backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", fontWeight: 600, fontSize: "1rem", boxShadow: "var(--shadow-sm)", minHeight: "44px" }}
        >
          <Filter size={20} />
          Filters
        </button>
      </div>

      {/* Sidebar Filters */}
      <aside className={`glass-panel filter-sidebar ${isFilterOpen ? 'open' : ''}`} style={{ flex: "1 1 300px", minWidth: "280px", maxWidth: "100%", padding: "1.5rem", position: "sticky", top: "5rem", zIndex: 100 }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
          <h2 style={{ fontWeight: 600, fontSize: "1.25rem" }}>Filters</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button onClick={() => { setMaxDistance(45); setMaxPrice(10000); setRoomType("ANY"); }} style={{ fontSize: "0.875rem", color: "var(--primary)", fontWeight: 500, minHeight: "44px", padding: "0 0.5rem" }}>Reset</button>
            
            {/* Close button for mobile modal */}
            <button className="mobile-filter-close" onClick={() => setIsFilterOpen(false)} style={{ display: "none", color: "var(--text-main)", background: "var(--border)", borderRadius: "50%", padding: "0.25rem" }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="filter-scrollable-content">
          {/* Distance Filter */}
          <div style={{ marginBottom: "2.5rem" }}>
            <label style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", fontWeight: 500 }}>
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
              style={{ width: "100%", accentColor: "var(--primary)", cursor: "pointer", height: "1.5rem" }} 
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              <span>5m</span>
              <span>45m+</span>
            </div>
          </div>

          {/* Price Filter */}
          <div style={{ marginBottom: "2.5rem" }}>
            <label style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", fontWeight: 500 }}>
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
              style={{ width: "100%", accentColor: "var(--primary)", cursor: "pointer", height: "1.5rem" }} 
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              <span>$300</span>
              <span>$10,000+</span>
            </div>
          </div>

          {/* Room Type Toggle */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "1rem", fontWeight: 500 }}>Room Type</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {(["ANY", "PRIVATE", "SHARED"] as const).map(type => (
                <label key={type} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", border: "1px solid", borderColor: roomType === type ? "var(--primary)" : "var(--border)", backgroundColor: roomType === type ? "rgba(210, 32, 48, 0.05)" : "var(--surface)", borderRadius: "var(--radius-md)", cursor: "pointer", transition: "all 0.2s", minHeight: "44px" }}>
                  <input 
                    type="radio" 
                    name="roomType" 
                    value={type} 
                    checked={roomType === type} 
                    onChange={() => setRoomType(type)} 
                    style={{ accentColor: "var(--primary)", width: "1.25rem", height: "1.25rem" }} 
                  />
                  <span style={{ fontWeight: roomType === type ? 600 : 500, fontSize: "1rem" }}>
                    {type === "ANY" ? "Any Type" : type === "PRIVATE" ? "Private Room" : "Shared Room"}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          <button 
            className="mobile-filter-apply" 
            onClick={() => setIsFilterOpen(false)} 
            style={{ display: "none", width: "100%", padding: "1rem", backgroundColor: "var(--primary)", color: "white", borderRadius: "var(--radius-lg)", fontWeight: 600, marginTop: "2rem", minHeight: "44px" }}
          >
            Show {filteredProperties.length} Properties
          </button>
        </div>
      </aside>

      {/* Main Content: Properties Grid */}
      <main style={{ flex: "3 1 600px", minWidth: "min(100%, 300px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <p style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: "1.125rem" }}>Showing {filteredProperties.length} propert{filteredProperties.length === 1 ? 'y' : 'ies'}</p>
        </div>

        <div className="properties-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: "2rem" }}>
          {filteredProperties.map((property) => {
            const mainImage = property.media && property.media.length > 0 ? property.media[0].url : null;
            
            return (
              <Link href={`/property/${property.id}`} key={property.id} style={{ pointerEvents: property.isRented ? 'none' : 'auto', opacity: property.isRented ? 0.6 : 1, display: "block" }}>
                <div className="card glass-panel property-card" style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
                  {property.isRented && (
                    <div style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 10, backgroundColor: "var(--secondary)", color: "white", padding: "0.5rem 1rem", borderRadius: "var(--radius-md)", fontWeight: "bold", fontSize: "0.875rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                      Fully Rented
                    </div>
                  )}
                  
                  <div style={{ backgroundColor: "var(--border)", height: "220px", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", overflow: "hidden", position: "relative" }}>
                    {mainImage ? (
                      <img src={mainImage} alt={property.address} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }} />
                    ) : (
                      <span>[No Image Available]</span>
                    )}
                    
                    {/* Floating Distance Badge */}
                    {property.walkingMinutesToCsun !== null && (
                      <div style={{ position: "absolute", bottom: "0.75rem", left: "0.75rem", backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", color: "white", padding: "0.35rem 0.75rem", borderRadius: "var(--radius-md)", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                        🚶‍♂️ {property.walkingMinutesToCsun} min walk
                      </div>
                    )}
                  </div>
                  
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem", lineHeight: 1.3 }}>{property.address}</h2>
                  
                  {/* Beautifully formatted truncated description */}
                  <div className="property-description" style={{ color: "var(--text-muted)", flex: 1, marginBottom: "1.25rem", fontSize: "0.95rem", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {property.description}
                  </div>
                  
                  <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", color: "var(--text-main)", fontSize: "0.9rem", fontWeight: 500 }}>
                    {property.bedrooms ? <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>🛏 {property.bedrooms} Beds</span> : null}
                    {property.bathrooms ? <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>🛁 {property.bathrooms} Baths</span> : null}
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
                    <div>
                      {property.rentIndividually && property.rooms && property.rooms.length > 0 ? (
                        <span style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--primary)" }}>From ${Math.min(...property.rooms.filter((r:any) => !r.isRented).map((r:any) => r.rent)) || 0}/mo</span>
                      ) : property.wholeHouseRent ? (
                        <span style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--primary)" }}>${property.wholeHouseRent}/mo</span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Price N/A</span>
                      )}
                    </div>
                    
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {property.rentWholeHouse && (
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-main)", padding: "0.35rem 0.6rem", borderRadius: "var(--radius-md)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          House
                        </span>
                      )}
                      {property.rentIndividually && (
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, backgroundColor: "rgba(210, 32, 48, 0.1)", color: "var(--primary)", padding: "0.35rem 0.6rem", borderRadius: "var(--radius-md)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
            <div style={{ gridColumn: "1 / -1", padding: "4rem", textAlign: "center", color: "var(--text-muted)", backgroundColor: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>🔍</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.5rem" }}>No properties match your filters</h3>
              <p style={{ maxWidth: "400px", lineHeight: 1.6 }}>Try increasing your max price or walking distance to see more results.</p>
              <button onClick={() => { setMaxDistance(45); setMaxPrice(10000); setRoomType("ANY"); }} className="btn-outline-pill" style={{ marginTop: "1.5rem", minHeight: "44px" }}>Clear Filters</button>
            </div>
          )}
        </div>
      </main>
      
    </div>
  );
}

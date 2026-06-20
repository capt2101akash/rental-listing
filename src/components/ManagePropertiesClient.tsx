"use client";

import { useState } from "react";
import { updateRoomDetails, toggleRoomRented, deleteProperty } from "@/app/actions/property";

type Room = any; // Will infer from Prisma or use basic type
type Property = any;

const LEASE_TERMS = ["6 Months", "1 Year", "Month-to-Month"];

export function ManagePropertiesClient({ properties }: { properties: Property[] }) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form state for editing a room
  const [editDesc, setEditDesc] = useState("");
  const [editRent, setEditRent] = useState(0);
  const [editSharing, setEditSharing] = useState(false);
  const [editLeaseTerms, setEditLeaseTerms] = useState<string[]>([]);

  const openModal = (prop: Property) => {
    setSelectedProperty(prop);
  };

  const closeModal = () => {
    setSelectedProperty(null);
    setEditingRoomId(null);
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    setIsDeleting(id);
    try {
      const res = await deleteProperty(id);
      if (!res?.success) throw new Error(res?.error || "Failed to delete property.");
      if (selectedProperty?.id === id) closeModal();
    } catch (err: any) {
      alert(err.message || "Failed to delete property.");
    } finally {
      setIsDeleting(null);
    }
  };

  const startEditRoom = (room: Room) => {
    setEditingRoomId(room.id);
    setEditDesc(room.description);
    setEditRent(room.rent);
    setEditSharing(room.isSharing);
    setEditLeaseTerms(room.leaseTerm ? room.leaseTerm.split(", ") : []);
  };

  const cancelEdit = () => {
    setEditingRoomId(null);
  };

  const toggleLeaseTerm = (term: string) => {
    setEditLeaseTerms(prev => 
      prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]
    );
  };

  const saveRoomEdit = async () => {
    if (!editingRoomId || !selectedProperty) return;
    setIsUpdating(true);
    try {
      const leaseTermString = editLeaseTerms.join(", ");
      const res = await updateRoomDetails(editingRoomId, editDesc, editRent, editSharing, leaseTermString);
      if (!res?.success) throw new Error(res?.error || "Failed to save room details.");
      
      // Update local state so UI reflects changes immediately without full refresh
      const updatedProps = properties.map(p => {
        if (p.id === selectedProperty.id) {
          return {
            ...p,
            rooms: p.rooms.map((r: any) => 
              r.id === editingRoomId 
                ? { ...r, description: editDesc, rent: editRent, isSharing: editSharing, leaseTerm: leaseTermString } 
                : r
            )
          };
        }
        return p;
      });
      setSelectedProperty(updatedProps.find(p => p.id === selectedProperty.id) || null);
      setEditingRoomId(null);
    } catch (err: any) {
      alert(err.message || "Failed to save room details.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleRented = async (roomId: string, currentStatus: boolean) => {
    if (!selectedProperty) return;
    setIsUpdating(true);
    try {
      const res = await toggleRoomRented(roomId, selectedProperty.id, !currentStatus);
      if (!res?.success) throw new Error(res?.error || "Failed to update rental status.");
      // Wait for server revalidation to refresh data automatically via Next.js router
    } catch (err: any) {
      alert(err.message || "Failed to update rental status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Keep selectedProperty in sync with properties array from server
  const currentSelectedProperty = selectedProperty ? properties.find(p => p.id === selectedProperty.id) : null;

  return (
    <>
      <div className="glass-panel" style={{ overflowX: "auto", overflowY: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
              <th style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Property Address</th>
              <th style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Rooms</th>
              <th style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "1rem 1.5rem", fontWeight: 600, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(p => {
              const availableRooms = p.rooms.filter((r: any) => !r.isRented).length;
              const rowStyle = {
                borderBottom: "1px solid var(--border)", 
                cursor: "pointer", 
                transition: "background-color 0.2s",
                opacity: p.isRented ? 0.6 : 1,
                backgroundColor: p.isRented ? "rgba(0,0,0,0.02)" : "transparent"
              };
              return (
                <tr key={p.id} onClick={() => openModal(p)} style={rowStyle} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = p.isRented ? 'rgba(0,0,0,0.02)' : 'transparent'}>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: 500 }}>{p.address}</td>
                  <td style={{ padding: "1rem 1.5rem", color: "var(--text-muted)" }}>{p.rooms.length} Rooms ({availableRooms} Available)</td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "999px", backgroundColor: p.isRented ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", color: p.isRented ? "#EF4444" : "#10B981", fontWeight: 600 }}>
                      {p.isRented ? "Fully Rented" : "Active"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteProperty(p.id); }} disabled={isDeleting === p.id} style={{ color: "#EF4444", fontWeight: 500, opacity: isDeleting === p.id ? 0.5 : 1 }}>
                      {isDeleting === p.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              )
            })}
            {properties.length === 0 && (
              <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No properties listed.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {currentSelectedProperty && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "1rem" }} onClick={closeModal}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "800px", maxHeight: "90vh", overflowY: "auto", padding: "2rem", backgroundColor: "var(--background)" }} onClick={e => e.stopPropagation()}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
              <div>
                <h2 className="heading-md">{currentSelectedProperty.address}</h2>
                <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
                  {currentSelectedProperty.isRented ? "Property is Fully Rented" : "Manage Room Availability"}
                </p>
              </div>
              <button onClick={closeModal} style={{ padding: "0.5rem", fontSize: "1.25rem", color: "var(--text-muted)" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {currentSelectedProperty.rooms.length === 0 ? (
                <p style={{ color: "var(--text-muted)", textAlign: "center" }}>No individual rooms listed for this property.</p>
              ) : (
                currentSelectedProperty.rooms.map((room: any) => (
                  <div key={room.id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", backgroundColor: room.isRented ? "rgba(0,0,0,0.03)" : "transparent", opacity: room.isRented ? 0.7 : 1, transition: "opacity 0.2s" }}>
                    
                    {editingRoomId === room.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>Description</label>
                          <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--surface)" }} />
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>Rent ($/mo)</label>
                            <input type="number" value={editRent} onChange={e => setEditRent(parseFloat(e.target.value))} style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--surface)" }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>Available for Sharing</label>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "40px" }}>
                              <input type="checkbox" checked={editSharing} onChange={e => setEditSharing(e.target.checked)} /> Yes
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>Lease Terms (Multi-Select)</label>
                          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                            {LEASE_TERMS.map(term => (
                              <label key={term} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", padding: "0.5rem 1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", backgroundColor: editLeaseTerms.includes(term) ? "rgba(16, 185, 129, 0.1)" : "transparent", borderColor: editLeaseTerms.includes(term) ? "#10B981" : "var(--border)" }}>
                                <input type="checkbox" checked={editLeaseTerms.includes(term)} onChange={() => toggleLeaseTerm(term)} style={{ display: "none" }} />
                                {term}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                          <button onClick={saveRoomEdit} disabled={isUpdating} className="btn-primary" style={{ padding: "0.5rem 1.5rem" }}>{isUpdating ? "Saving..." : "Save Changes"}</button>
                          <button onClick={cancelEdit} disabled={isUpdating} className="btn-secondary" style={{ padding: "0.5rem 1.5rem" }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h4 style={{ fontWeight: 600, fontSize: "1.125rem", marginBottom: "0.5rem" }}>{room.description}</h4>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                            <span><strong>Rent:</strong> ${room.rent}/mo</span>
                            <span><strong>Lease:</strong> {room.leaseTerm || "Not specified"}</span>
                            <span><strong>Sharing:</strong> {room.isSharing ? "Yes" : "No"}</span>
                          </div>
                          {room.isRented && (
                            <span style={{ display: "inline-block", fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "var(--radius-md)", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", fontWeight: 600 }}>
                              Rented
                            </span>
                          )}
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                          {!room.isRented && (
                            <button onClick={() => startEditRoom(room)} className="btn-secondary" style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}>Edit Details</button>
                          )}
                          <button 
                            onClick={() => handleToggleRented(room.id, room.isRented)} 
                            disabled={isUpdating}
                            style={{ 
                              padding: "0.4rem 1rem", 
                              fontSize: "0.875rem", 
                              borderRadius: "var(--radius-md)", 
                              fontWeight: 600,
                              backgroundColor: room.isRented ? "var(--surface)" : "#10B981", 
                              color: room.isRented ? "var(--text-main)" : "white",
                              border: room.isRented ? "1px solid var(--border)" : "none",
                              transition: "all 0.2s"
                            }}
                          >
                            {room.isRented ? "Unmark Rented" : "Mark as Rented"}
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

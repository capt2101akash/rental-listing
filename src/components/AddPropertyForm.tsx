"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { addCompleteProperty } from "@/app/actions/property";

export function AddPropertyForm() {
  const router = useRouter();
  const [numRooms, setNumRooms] = useState(0);
  const [rentWholeHouse, setRentWholeHouse] = useState(false);
  const [rentIndividually, setRentIndividually] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      // Check for 10MB file size limit
      let hasLargeFile = false;
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
      for (const [key, value] of Array.from(formData.entries())) {
        if (value instanceof File && value.size > MAX_FILE_SIZE) {
          hasLargeFile = true;
          break;
        }
      }
      
      if (hasLargeFile) {
        throw new Error("One or more files exceed the 10 MB limit. Please upload smaller files.");
      }

      if (rentWholeHouse) formData.set("rentWholeHouse", "on");
      if (rentIndividually) formData.set("rentIndividually", "on");
      
      const result = await addCompleteProperty(formData);
      if (!result?.success) {
        throw new Error(result?.error || "Failed to add property.");
      }
      
      setSuccess(true);
      form.reset();
      setNumRooms(0);
      setRentWholeHouse(false);
      setRentIndividually(false);
      
      // Redirect to properties dashboard to see the newly added property
      router.push("/dashboard/properties");
    } catch (err: any) {
      setError(err.message || "Failed to add property.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: "2rem", marginBottom: "2rem" }}>
      <h3 style={{ marginBottom: "1.5rem", fontWeight: 600, fontSize: "1.25rem", color: "var(--text-main)" }}>Add New Property</h3>
      
      {error && <div style={{ padding: "1rem", backgroundColor: "#FEE2E2", color: "#B91C1C", borderRadius: "0.5rem", marginBottom: "1.5rem" }}>{error}</div>}
      {success && <div style={{ padding: "1rem", backgroundColor: "#D1FAE5", color: "#065F46", borderRadius: "0.5rem", marginBottom: "1.5rem" }}>Property successfully added!</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Step 1: Property Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h4 style={{ fontWeight: 600, color: "var(--primary)", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>Step 1: Property Details</h4>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Property Address <span style={{color: "var(--primary)"}}>*</span></label>
            <AddressAutocomplete name="address" required placeholder="Start typing address..." style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Description <span style={{color: "var(--primary)"}}>*</span></label>
            <textarea name="description" required placeholder="e.g. Beautiful 3 bedroom house near CSUN..." style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", minHeight: "100px", fontFamily: "inherit" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Total Bedrooms</label>
              <input type="number" name="bedrooms" min="1" step="1" placeholder="e.g. 3" style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Total Bathrooms</label>
              <input type="number" name="bathrooms" min="1" step="0.5" placeholder="e.g. 2" style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Main Property Image</label>
            <input type="file" name="propertyImage" accept="image/*" style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px dashed var(--border)", backgroundColor: "var(--surface)" }} />
          </div>
        </div>

        {/* Step 2: Rental Preferences */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h4 style={{ fontWeight: 600, color: "var(--primary)", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>Step 2: Rental Preferences</h4>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>How do you plan to list this property? (You can select both)</p>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500, cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={rentWholeHouse} 
                onChange={(e) => setRentWholeHouse(e.target.checked)} 
                style={{ width: "1.25rem", height: "1.25rem", accentColor: "var(--primary)" }} 
              />
              Rent Whole Property
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500, cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={rentIndividually} 
                onChange={(e) => setRentIndividually(e.target.checked)} 
                style={{ width: "1.25rem", height: "1.25rem", accentColor: "var(--primary)" }} 
              />
              Rent Individual Rooms
            </label>
          </div>
        </div>

        {/* Whole House Rent Input */}
        {rentWholeHouse && (
          <div style={{ padding: "1.5rem", backgroundColor: "var(--surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Whole House Rent / mo <span style={{color: "var(--primary)"}}>*</span></label>
            <input 
              type="number" 
              name="wholeHouseRent" 
              required={rentWholeHouse && !rentIndividually}
              min="0" 
              placeholder="$0.00" 
              style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", fontSize: "1.1rem" }} 
            />
          </div>
        )}

        {/* Dynamic Room Generator Trigger */}
        {rentIndividually && (
          <div style={{ padding: "1.5rem", backgroundColor: "var(--surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>How many individual rooms are available for rent? <span style={{color: "var(--primary)"}}>*</span></label>
            <input 
              type="number" 
              name="numRooms" 
              required={rentIndividually}
              min="1" 
              max="10" 
              value={numRooms} 
              onChange={(e) => setNumRooms(parseInt(e.target.value) || 0)} 
              style={{ width: "150px", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", fontSize: "1.1rem" }} 
            />
          </div>
        )}

        {/* Step 3: Dynamic Room Forms */}
        {rentIndividually && numRooms > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h4 style={{ fontWeight: 600, color: "var(--primary)", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>Step 3: Room Details</h4>
            
            {Array.from({ length: numRooms }).map((_, i) => (
              <div key={i} style={{ padding: "1.5rem", backgroundColor: "var(--surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h5 style={{ fontWeight: 600 }}>Room {i + 1}</h5>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>Description <span style={{color: "var(--primary)"}}>*</span></label>
                    <input type="text" name={`room_${i}_description`} required placeholder="e.g. Master Bedroom with En-suite" style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>Monthly Rent <span style={{color: "var(--primary)"}}>*</span></label>
                    <input type="number" name={`room_${i}_rent`} required min="0" placeholder="$0.00" style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }} />
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>Lease Terms Allowed (Select multiple)</label>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {["6 Months", "1 Year", "Month-to-Month"].map(term => (
                      <label key={term} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", padding: "0.5rem 1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", backgroundColor: "var(--background)" }}>
                        <input type="checkbox" name={`room_${i}_leaseTerm`} value={term} />
                        {term}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>Room Media (Images / Videos)</label>
                    <input type="file" name={`room_${i}_media`} accept="image/*,video/*" multiple style={{ width: "100%", padding: "0.6rem", borderRadius: "var(--radius-md)", border: "1px dashed var(--border)", backgroundColor: "var(--background)" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "0.5rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" }}>
                      <input 
                        type="checkbox" 
                        name={`room_${i}_isSharing`} 
                        style={{ width: "1.25rem", height: "1.25rem", accentColor: "var(--primary)" }} 
                      />
                      Available for Room Sharing (e.g., dual occupancy)
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: "1rem", fontSize: "1.1rem", marginTop: "1rem", opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? "Saving & Uploading..." : "Publish Property Listing"}
        </button>

      </form>
    </div>
  );
}

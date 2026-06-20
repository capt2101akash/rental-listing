"use client";
import { useEffect, useRef } from "react";

interface AddressAutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  onPlaceSelected?: (address: string) => void;
}

export function AddressAutocomplete({ 
  name, 
  onPlaceSelected,
  ...props
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    // Ensure the Google Maps script is fully loaded before initializing
    if (typeof window === "undefined" || !(window as any).google || !(window as any).google.maps) {
      console.warn("Google Maps API not loaded. Address Autocomplete disabled.");
      return;
    }

    if (inputRef.current) {
      autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        // You can restrict bounds or countries here if needed
        // componentRestrictions: { country: "us" }
      });

      // Listen for when the user selects a place from the dropdown
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (place && place.formatted_address && inputRef.current) {
          // Update the underlying input directly
          inputRef.current.value = place.formatted_address;
          
          // Trigger the custom callback instead of dispatching a native 'input' event.
          // Dispatching a native 'input' event is what was causing Google Maps to perform a fresh search on the full address!
          if (onPlaceSelected) {
            onPlaceSelected(place.formatted_address);
          }

          inputRef.current.blur();
        }
      });

      // Prevent the form from submitting when a user presses "Enter" on a dropdown suggestion
      inputRef.current.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && document.querySelector(".pac-container")) {
          // Prevent form submission if the dropdown is open
        }
      });
    }
  }, [onPlaceSelected]);

  return (
    <input 
      ref={inputRef} 
      type="text" 
      name={name} 
      {...props}
    />
  );
}

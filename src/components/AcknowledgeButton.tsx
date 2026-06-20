"use client";

import { useFormStatus } from "react-dom";
import { acknowledgeBooking } from "@/app/actions/booking";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="btn-primary" 
      style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", opacity: pending ? 0.7 : 1 }}
    >
      {pending ? "Acknowledging..." : "Acknowledge"}
    </button>
  );
}

export function AcknowledgeButton({ bookingId }: { bookingId: string }) {
  const handleAcknowledge = async () => {
    try {
      const res = await acknowledgeBooking(bookingId);
      if (!res?.success) {
        throw new Error(res?.error || "Failed to acknowledge request.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred while acknowledging the request.");
    }
  };

  return (
    <form action={handleAcknowledge}>
      <SubmitButton />
    </form>
  );
}

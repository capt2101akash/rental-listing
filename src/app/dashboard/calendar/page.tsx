import CalendlyEmbed from "@/components/Scheduling/CalendlyEmbed";

export default function CalendarPage() {
  return (
    <div className="container" style={{ padding: "4rem 0" }}>
      <h1 className="heading-lg" style={{ marginBottom: "2rem" }}>Booking Calendar</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
        Below is your Calendly integration showing all upcoming viewing appointments.
      </p>
      
      <div className="glass-panel" style={{ height: "700px", overflow: "hidden" }}>
        <CalendlyEmbed url="https://calendly.com/YOUR_CALENDLY_LINK" />
      </div>
    </div>
  );
}

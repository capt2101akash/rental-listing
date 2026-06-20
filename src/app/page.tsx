import Link from "next/link";

export default function Home() {
  return (
    <div className="container" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
      <div className="glass-panel animate-fade-in" style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1 className="heading-xl">
          Find Your Perfect <span className="text-gradient">Student Home</span>
        </h1>
        <p style={{ marginTop: "1.5rem", fontSize: "1.125rem", color: "var(--text-muted)", maxWidth: "600px", marginInline: "auto" }}>
          Browse premium student housing properties in California. Request viewings, start leases, and secure your next home with ease.
        </p>
        <div style={{ marginTop: "2.5rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/properties" className="btn-primary">
            Browse Properties
          </Link>
          <Link href="/auth/login" className="btn-secondary">
            Property Owner Login
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";

export default function CalendlyEmbed({ url }: { url: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Dynamically load Calendly widget script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (!mounted) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading Calendar...</div>;

  return (
    <div 
      className="calendly-inline-widget" 
      data-url={url} 
      style={{ minWidth: "320px", height: "100%", width: "100%" }} 
    />
  );
}

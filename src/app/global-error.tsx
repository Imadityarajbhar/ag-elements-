"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught an error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "sans-serif", backgroundColor: "#fffbfc", color: "#1d1b20" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "20px", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>A Critical Error Occurred</h1>
          <p style={{ marginBottom: "2rem", color: "#49454f" }}>The application encountered an unrecoverable error. We apologize for the inconvenience.</p>
          <button 
            onClick={reset}
            style={{ padding: "12px 24px", backgroundColor: "#65558f", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" }}
          >
            Refresh Application
          </button>
          <a 
            href="/"
            style={{ marginTop: "1rem", color: "#65558f", textDecoration: "none" }}
          >
            Return to Homepage
          </a>
        </div>
      </body>
    </html>
  );
}

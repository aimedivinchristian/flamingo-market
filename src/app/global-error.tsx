"use client";
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en"><body style={{ fontFamily: "sans-serif", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div><h1>Something went wrong</h1><p style={{ color: "#888" }}>Please try again.</p><button onClick={reset} style={{ background: "#e8267a", color: "#fff", border: 0, borderRadius: 99, padding: "12px 28px", fontWeight: 700 }}>Reload</button></div>
    </body></html>
  );
}

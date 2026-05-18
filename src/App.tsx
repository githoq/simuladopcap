/**
 * RED SCREEN TEST — BUILD VERIFICATION
 * If this appears on Vercel → new build is working correctly.
 * If the old page still shows → Vercel is NOT using this code.
 *
 * After confirming red screen on production, restore App.tsx.BACKUP
 */
export default function App() {
  return (
    <div style={{
      background: "red",
      color: "white",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "monospace",
      gap: "16px",
    }}>
      <div style={{ fontSize: "80px", fontWeight: "bold" }}>✅</div>
      <div style={{ fontSize: "40px", fontWeight: "bold" }}>
        NOVA BUILD FUNCIONANDO
      </div>
      <div style={{ fontSize: "18px", opacity: 0.8 }}>
        {new Date().toISOString()}
      </div>
      <div style={{ fontSize: "14px", opacity: 0.6 }}>
        main.tsx → App.tsx → RED SCREEN TEST
      </div>
    </div>
  );
}

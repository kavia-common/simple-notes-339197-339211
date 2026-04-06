import React, { useState } from "react";
import { createRoot } from "react-dom/client";

/**
 * A minimal counter app.
 * This is intentionally self-contained so the repository has a working `index.js`
 * demonstrating state updates and UI rendering.
 */
function CounterApp() {
  const [count, setCount] = useState(0);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Counter</h1>
        <p style={styles.subtitle}>A simple React counter implemented in index.js</p>
      </header>

      <main style={styles.main}>
        <div style={styles.counterCard} role="group" aria-label="Counter controls">
          <div style={styles.countLabel} aria-live="polite">
            {count}
          </div>

          <div style={styles.buttonRow}>
            <button
              type="button"
              onClick={() => setCount((c) => c - 1)}
              style={{ ...styles.button, ...styles.buttonSecondary }}
              aria-label="Decrement"
            >
              −
            </button>

            <button
              type="button"
              onClick={() => setCount(0)}
              style={{ ...styles.button, ...styles.buttonNeutral }}
              aria-label="Reset"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() => setCount((c) => c + 1)}
              style={{ ...styles.button, ...styles.buttonPrimary }}
              aria-label="Increment"
            >
              +
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f9fafb",
    color: "#111827",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Arial, "Noto Sans", "Liberation Sans", sans-serif',
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "24px 20px 12px",
    borderBottom: "1px solid #e5e7eb",
    background: "#ffffff",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  subtitle: {
    margin: "6px 0 0",
    fontSize: "13px",
    color: "#64748b",
  },
  main: {
    flex: 1,
    display: "grid",
    placeItems: "center",
    padding: "24px 16px",
  },
  counterCard: {
    width: "min(420px, 100%)",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "22px",
    boxShadow: "0 6px 24px rgba(17, 24, 39, 0.08)",
  },
  countLabel: {
    fontSize: "56px",
    fontWeight: 800,
    textAlign: "center",
    margin: "4px 0 16px",
    color: "#111827",
  },
  buttonRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1.4fr 1fr",
    gap: "10px",
  },
  button: {
    border: "1px solid transparent",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.02s ease, filter 0.15s ease",
  },
  buttonPrimary: {
    background: "#3b82f6",
    color: "#ffffff",
  },
  buttonSecondary: {
    background: "#06b6d4",
    color: "#ffffff",
  },
  buttonNeutral: {
    background: "#f3f4f6",
    color: "#111827",
    borderColor: "#e5e7eb",
  },
};

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error('Root element "#root" not found. Ensure your HTML has <div id="root"></div>.');
}

createRoot(rootEl).render(
  <React.StrictMode>
    <CounterApp />
  </React.StrictMode>,
);

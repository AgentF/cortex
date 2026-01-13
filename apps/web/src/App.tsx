import { useState, useEffect } from "react";
import type { Document } from "@cortex/shared"; // THE CRITICAL IMPORT
import "./App.css";

function App() {
  const [doc, setDoc] = useState<Document | null>(null);

  useEffect(() => {
    // Simulate Network Latency (100ms)
    // This moves the update to the next tick, preventing the "Synchronous" warning.
    const timer = setTimeout(() => {
      const mockData: Document = {
        id: "frontend-001",
        title: "Cortex UI Initialized",
        content:
          "The Vite subsystem is successfully reading from the Shared Monorepo Library.",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setDoc(mockData);
    }, 100);

    return () => clearTimeout(timer); // Cleanup is good habit
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "left" }}>
      <h1>
        System Status: <span style={{ color: "green" }}>ONLINE</span>
      </h1>
      <hr />
      {doc ? (
        <div>
          <h2>Active Document: {doc.title}</h2>
          <p>
            <strong>ID:</strong> {doc.id}
          </p>
          <div
            style={{
              background: "#333",
              color: "#fff",
              padding: "1rem",
              borderRadius: "8px",
              marginTop: "1rem",
            }}
          >
            {doc.content}
          </div>
          <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#666" }}>
            Validated via @cortex/shared
          </p>
        </div>
      ) : (
        <p>Connecting to Neural Link...</p>
      )}
    </div>
  );
}

export default App;

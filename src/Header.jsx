import React from "react";

export default function Header() {
  return (
    <header style={{
      background: "#0055A2", // SJSU blue
      padding: "18px 0 6px 0",
      borderBottom: "4px solid #FFC72A", // SJSU yellow
      marginBottom: "12px"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "22px"
      }}>
        {/* Graduation cap emoji (left) */}
        <span
          role="img"
          aria-label="Graduation Cap"
          style={{ fontSize: "2.1em" }}
        >
          🎓
        </span>
        <h1 style={{
          margin: 0,
          fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif",
          fontWeight: 700,
          fontSize: "2.1em",
          letterSpacing: "1.5px",
          color: "#FFC72A" // SJSU yellow
        }}>
          GraduationScope
        </h1>
        {/* Telescope emoji (right) */}
        <span
          role="img"
          aria-label="Telescope"
          style={{ fontSize: "2.1em" }}
        >
          🔭
        </span>
      </div>
      <hr style={{
        margin: "8px auto 4px auto",
        width: "80%",
        border: "0",
        borderTop: "2px solid #FFC72A"
      }} />
      
    </header>
  );
}

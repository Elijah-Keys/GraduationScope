import React from "react";
import { Link } from "react-router-dom";

export default function Survey() {
  const isMobile = window.innerWidth <= 700;

  return (
    <div
      style={{
        marginTop: isMobile ? 150 : 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: isMobile ? "0 12px" : "0",
        boxSizing: "border-box",
        paddingBottom: isMobile ? 80 : 160 // ← add this for space above footer
      }}
    >
      <iframe
        src="https://docs.google.com/forms/d/e/1FAIpQLSfnc_hvCsRbq1knauU-4HU9R3QS7rr4oUFRQHSGSU7KO0FkVg/viewform?embedded=true"
        width="100%"
        height={isMobile ? 600 : 700}
        frameBorder="0"
        marginHeight="0"
        marginWidth="0"
        title="Survey"
        style={{
          maxWidth: isMobile ? 360 : 700,
          borderRadius: 8,
          border: "1px solid #ddd",
          background: "#fff"
        }}
      >
        Loading…
      </iframe>
    </div>
  );
}

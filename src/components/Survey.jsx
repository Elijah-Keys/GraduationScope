import React from "react";
import { Link } from "react-router-dom";

export default function Survey() {
  const isMobile = window.innerWidth <= 700;

  return (
    <div
      style={{
        marginTop: isMobile ? 150 : 120, // adjust as needed
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: isMobile ? "0 12px" : "0",
        boxSizing: "border-box",
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
          background: "#fff",
        }}
      >
        Loading…
      </iframe>

      {/* Render Back to Home button only if NOT on mobile */}
      {!isMobile && (
        <div
          style={{
            marginTop: 40,
            textAlign: "center",
            width: "100%",
            maxWidth: 280,
            marginLeft: -70, 
            paddingBottom: 60,
          }}
        >
          <Link
            to="/"
            style={{
              display: "inline-block",
              padding: "14px 28px",
              backgroundColor: "#1976d2",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "1em",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "background-color 0.3s",
              width: "100%",
              textAlign: "center",
            
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1565c0")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1976d2")}
            aria-label="Back to Home"
          >
            Back to Home
          </Link>
        </div>
      )}
    </div>
  );
}

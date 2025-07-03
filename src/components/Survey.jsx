// src/components/Survey.jsx
import React from "react";

export default function Survey() {
  return (
    <div style={{ marginTop: "120px", display: "flex", justifyContent: "center" }}>
      <iframe
        src="https://docs.google.com/forms/d/e/1FAIpQLSfnc_hvCsRbq1knauU-4HU9R3QS7rr4oUFRQHSGSU7KO0FkVg/viewform?embedded=true"
        width="100%"
        height="700"
        frameBorder="0"
        marginHeight="0"
        marginWidth="0"
        title="Survey"
        style={{ maxWidth: 700, borderRadius: 8, border: "1px solid #ddd", background: "#fff" }}
      >
        Loading…
      </iframe>
    </div>
  );
}

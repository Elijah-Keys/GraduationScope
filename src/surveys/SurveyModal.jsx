// src/surveys/SurveyModal.jsx
import React from "react";

export default function SurveyModal({ open, onClose, onTake, title, subtitle }) {
  if (!open) return null;

  return (
    <div style={overlayStyles}>
      <div style={cardStyles}>
        <h3 style={{ margin: 0 }}>{title || "Quick survey"}</h3>
        <p style={{ marginTop: 8 }}>
          {subtitle || "Are you enjoying GraduationScope"}
        </p>
    
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            onClick={onTake}
            style={{
              background: "#20A7EF",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 14px",
              cursor: "pointer"
            }}
          >
            Take survey and enter
          </button>
          <button
            onClick={onClose}
            style={{
              background: "#eee",
              color: "#222",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "10px 14px",
              cursor: "pointer"
            }}
          >
            Maybe later
          </button>
        </div>

       
      </div>
    </div>
  );
}

const overlayStyles = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999
};

const cardStyles = {
  width: "min(92vw, 460px)",
  background: "#fff",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 8px 30px rgba(0,0,0,0.2)"
};

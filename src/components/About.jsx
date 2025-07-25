import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div style={{ marginTop: "120px", maxWidth: 700, margin: "120px auto", textAlign: "left" }}>
      <h1 style={{ textAlign: "center" }}>About Graduation Scope</h1>
      <p>
        This platform was built by a student, for students. As a current SJSU student, I’ve experienced firsthand how confusing and time-consuming it can be to choose the right classes, track GE requirements, and figure out which professors are worth your time. That’s why I created this tool — to help students pick classes smarter, manage their credits clearly, and access professor ratings all in one place. It’s fast, efficient, and designed to save you stress every semester.
      </p>
      <p style={{ textAlign: "center" }}>
        For questions or suggestions, please contact us using the link below.
      </p>
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Link
          to="/"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#1976d2",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "1em",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1565c0")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1976d2")}
          aria-label="Back to Home"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

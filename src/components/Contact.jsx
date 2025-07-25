import emailjs from '@emailjs/browser';
import React, { useRef, useState, useEffect } from 'react'; 
import { Link } from "react-router-dom";

export default function Contact() {
  const form = useRef();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Reactive isMobile state with resize listener
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 700);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs.sendForm('Graduation Scope Service', 'template_2e20ull', form.current, {
      publicKey: 'eLJ_fjy9QHfq2df2_',
    })
    .then(() => {
      setSuccess(true);
      form.current.reset();
      setTimeout(() => setSuccess(false), 2000);
    }, (error) => {
      alert('Failed to send: ' + error.text);
    });
  };

  return (
    <div
      className="contact-root"
      style={{
        marginTop: isMobile ? "90px" : "120px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "70vh",
        position: "relative",
        padding: isMobile ? "0 12px" : "0",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{
        fontSize: isMobile ? "1.8rem" : "2.5rem",
        marginBottom: isMobile ? "1rem" : "2rem",
        textAlign: "center",
        letterSpacing: "1px"
      }}>
        Contact Us
      </h1>

      {/* SUCCESS OVERLAY */}
      {success && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(255,255,255,0.95)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10
        }}>
          <div style={{
            background: "#fff",
            color: "#14213d",
            padding: isMobile ? "1.5em 2em" : "2em 3em",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            textAlign: "center",
            fontSize: isMobile ? "1rem" : "1.3em",
            fontWeight: 600,
          }}>
            Thank you for helping to improve Graduation Scope!<br />
            Your Feedback is valuable to us.
          </div>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{
          color: "#d32f2f",
          background: "#ffeaea",
          padding: isMobile ? "0.5em 1em" : "0.75em 1.5em",
          borderRadius: "6px",
          marginBottom: isMobile ? "0.75em" : "1em",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "0.5em",
          fontSize: isMobile ? "0.9rem" : "1rem",
          maxWidth: isMobile ? "280px" : "auto",
          textAlign: "center",
        }}>
          <span style={{ fontSize: isMobile ? "1.2em" : "1.5em", color: "#1976d2" }}>⚠️</span>
          {error}
        </div>
      )}

      <form
        ref={form}
        onSubmit={sendEmail}
        style={{
          width: "100%",
          maxWidth: isMobile ? 320 : 480,
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? "1em" : "1.5em",
          fontSize: isMobile ? "1rem" : "1.25rem",
        }}
      >
        <label style={{ fontWeight: 500, fontSize: isMobile ? "1rem" : "1.25rem" }}>Name</label>
        <input
          type="text"
          name="user_name"
          required
          style={{
            padding: isMobile ? "0.5em" : "0.8em",
            fontSize: isMobile ? "1rem" : "1.1rem",
            borderRadius: "6px",
            border: "1px solid #aaa"
          }}
        />
        <label style={{ fontWeight: 500, fontSize: isMobile ? "1rem" : "1.25rem" }}>Email</label>
        <input
          type="email"
          name="user_email"
          required
          style={{
            padding: isMobile ? "0.5em" : "0.8em",
            fontSize: isMobile ? "1rem" : "1.1rem",
            borderRadius: "6px",
            border: "1px solid #aaa"
          }}
        />
        <label style={{ fontWeight: 500, fontSize: isMobile ? "1rem" : "1.25rem" }}>Message</label>
        <textarea
          name="message"
          required
          rows={isMobile ? 4 : 6}
          style={{
            padding: isMobile ? "0.5em" : "0.8em",
            fontSize: isMobile ? "1rem" : "1.1rem",
            borderRadius: "6px",
            border: "1px solid #aaa",
            resize: "vertical"
          }}
        />
        <button
          type="submit"
          style={{
            padding: isMobile ? "0.7em" : "0.9em",
            fontSize: isMobile ? "1rem" : "1.2rem",
            borderRadius: "6px",
            background: "#14213d",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>

      {/* Back to Home button: Render only on desktop */}
      {!isMobile && (
        <div style={{ 
          marginTop:40,              
          textAlign: "center",
          width: "100%",
          maxWidth: 280,
        marginLeft: -60,
          paddingBottom: 60       
        }}>
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
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1565c0")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1976d2")}
            aria-label="Back to Home"
          >
            Back to Home
          </Link>
        </div>
      )}
    </div>
  );
}

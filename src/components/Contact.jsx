// src/components/Contact.jsx

import emailjs from '@emailjs/browser';
import React, { useRef, useState } from 'react'; 

export default function Contact() {
  const form = useRef();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs.sendForm('Graduation Scope Service', 'template_2e20ull', form.current, {
      publicKey: 'eLJ_fjy9QHfq2df2_',
    })
   .then(() => {
  setSuccess(true); // show thank you message
  form.current.reset();
  setTimeout(() => setSuccess(false), 2000); // hide after 2 seconds
    }, (error) => {
      alert('Failed to send: ' + error.text);
    });
  };

   return (
    <div
      style={{
        marginTop: "120px", // pushes everything down below header
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "70vh",
        position: "relative",
      }}
    >
      <h1 style={{
        fontSize: "2.5rem",
        marginBottom: "2rem",
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
          padding: "2em 3em",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2.5em", marginBottom: "0.5em" }}></div>
          <div style={{ fontSize: "1.3em", fontWeight: 600 }}>
            Thank you for helping to improve Graduation Scope!<br />
           Your Feedback is valuable to us.
          </div>
        </div>
      </div>
    )}

    {/* ERROR MESSAGE */}
    {error && (
      <div style={{
        color: "#d32f2f",
        background: "#ffeaea",
        padding: "0.75em 1.5em",
        borderRadius: "6px",
        marginBottom: "1em",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: "0.5em"
      }}>
        <span style={{ fontSize: "1.5em", color: "#1976d2" /* blue, or any color */ }}>⚠️</span>
        {error}
      </div>
    )}
      <form
        ref={form}
        onSubmit={sendEmail}
        style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: "1.5em",
          fontSize: "1.25rem"
        }}
      >
        <label style={{fontWeight: 500}}>Name</label>
        <input
          type="text"
          name="user_name"
          required
          style={{
            padding: "0.8em",
            fontSize: "1.1rem",
            borderRadius: "6px",
            border: "1px solid #aaa"
          }}
        />
        <label style={{fontWeight: 500}}>Email</label>
        <input
          type="email"
          name="user_email"
          required
          style={{
            padding: "0.8em",
            fontSize: "1.1rem",
            borderRadius: "6px",
            border: "1px solid #aaa"
          }}
        />
        <label style={{fontWeight: 500}}>Message</label>
        <textarea
          name="message"
          required
          rows={6}
          style={{
            padding: "0.8em",
            fontSize: "1.1rem",
            borderRadius: "6px",
            border: "1px solid #aaa",
            resize: "vertical"
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.9em",
            fontSize: "1.2rem",
            borderRadius: "6px",
            background: "#14213d",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
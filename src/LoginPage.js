import React, { useState } from "react";

export default function LoginPage({ onLogin}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 const handleSubmit = (e) => {
  e.preventDefault();
  onLogin({ email, password }); // This will trigger the redirect logic in App.js
};

    return (
    <div
      style={{
        maxWidth: 400,
        margin: "100px auto 0 auto", // Moves form down
        padding: 32,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
      }}
    >
      <h2 style={{ fontSize: "2.2rem", marginBottom: 32 }}>Log In</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", fontSize: "1.2rem", padding: 16, marginBottom: 20 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", fontSize: "1.2rem", padding: 16, marginBottom: 24 }}
        />
        <button
          type="submit"
          style={{ width: "100%", fontSize: "1.2rem", padding: 16 }}
        >
          Log In
        </button>
      </form>
    </div>
  );
}
import React from "react";

export default function About() {
  const baseStyle = { fontWeight: 500, lineHeight: 1.6 };

  return (
    <>
      <div
        className="about-root"
        style={{
          margin: "118px auto",
          maxWidth: 700,
          width: "100%",
          textAlign: "left",
          boxSizing: "border-box",     // ensure padding doesn't expand width
          ...baseStyle,
        }}
      >
        <h1 style={{ textAlign: "center", fontWeight: 500 }}>About Graduation Scope</h1>

        <p style={baseStyle}>
          I’m a student, and I built Graduation Scope to make school stuff easier and faster. The goal is simple:
          save time, reduce stress, and give students what we actually want—a convenient way to pick the right
          classes, track GE requirements clearly, and check professor ratings all in one place.
        </p>

        <p style={{ textAlign: "center", ...baseStyle }}>
          For questions or suggestions, please contact us by scrolling to the bottom of the home page.
        </p>

        <p style={baseStyle}>
          Tools used for code: ChatGPT 4 (not as useful), Perplexity, ChatGPT 5 (super useful),
          Grok 3, and Lovable.dev.
        </p>

        <p style={baseStyle}>
          Other tools used: Content Drips, Mobbin, Canva.
        </p>

        <p style={baseStyle}>
          Founders: Elijah Keys, Nuru Kyubwa, Christian Perez, Deangelo Keys, Wema Kyubwa.
        </p>
      </div>

      <style>{`
        .about-root { 
          font-size: 1rem;
          padding-inline: 12px;   /* small default side padding */
        }
        .about-root h1 { font-size: 2rem; }

        /* Mobile: smaller text + bigger side padding */
        @media (max-width: 700px) {
          .about-root { 
            font-size: 0.75rem;
            margin: 84px auto;
            padding-inline: 24px;  /* ← add comfy left/right space */
          }
          .about-root h1 { 
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}

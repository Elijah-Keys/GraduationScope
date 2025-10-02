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
          boxSizing: "border-box",
          ...baseStyle,
        }}
      >
        <h1 style={{ textAlign: "center", fontWeight: 500 }}>About Graduation Scope</h1>

        <p style={baseStyle}>
          Hi, I’m Elijah, a student at San Jose State. I built Graduation Scope to make school stuff easier and faster. The goal is simple:
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

        <p style={baseStyle}>Other tools used: Content Drips, Mobbin, Canva.</p>

        <p style={baseStyle}>
          Co-Founders: Christian Perez
        </p>

        {/* Founding Team */}
        <section className="team-section">
          <h2 style={{ textAlign: "center", fontWeight: 600, marginTop: 28, marginBottom: 14 }}>
            Founding Team
          </h2>

          <div className="team-grid">
            {/* Elijah */}
            <div className="team-card">
              <img
                className="team-avatar"
                src="/images/Elijah.jpg"
                alt="Elijah Keys"
                loading="lazy"
              />
              <div className="team-name">Elijah Keys</div>
              <a
                className="team-link"
                href="https://www.linkedin.com/in/elijah-keys-16a974320/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn →
              </a>
            </div>

            {/* Nuru */}
            <div className="team-card">
              <img
                className="team-avatar"
                src="/images/Nuru.jpg"
                alt="Nuru Kyubwa"
                loading="lazy"
              />
              <div className="team-name">Nuru Kyubwa</div>
              <a
                className="team-link"
                href="https://www.linkedin.com/in/nuru-kyubwa-60377431a/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn →
              </a>
            </div>
          </div>
        </section>

        {/* Team Members */}
        <section className="team-section">
          <h2 style={{ textAlign: "center", fontWeight: 600, marginTop: 28, marginBottom: 14 }}>
            Team Members
          </h2>

          <div className="team-grid">
            {/* Thomas */}
            <div className="team-card">
              <img
                className="team-avatar"
                src="/images/Thomas.jpg"  /* place file at public/images/Thomas.jpg */
                alt="Thomas Walls"
                loading="lazy"
              />
              <div className="team-name">Thomas Walls</div>
              <div className="team-role">Social Engagement Director</div>
              <a
                className="team-link"
                href="https://www.linkedin.com/in/thomas-walls-297320383/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn →
              </a>
            </div>

            {/* Nuamin */}
            <div className="team-card">
              <img
                className="team-avatar"
                src="/images/Nuamin.jpg"
                alt="Nuamin Hailemariam"
                loading="lazy"
              />
              <div className="team-name">Nuamin Hailemariam</div>
              <div className="team-role">Social Media Manager</div>
              <a
                className="team-link"
                href="https://www.linkedin.com/in/nuamin-hailemariam-7b3232352/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn →
              </a>
            </div>

            {/* Wema */}
            <div className="team-card">
          <img className="team-avatar" src="/images/Wema.jpg" alt="Wema Kyubwa" />
              <div className="team-name">Wema Kyubwa</div>
              <div className="team-role">Human Resource Mangement</div>
              <a
                className="team-link"
                href="https://www.instagram.com/wema__k/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram →
              </a>
            </div>

            {/* Deangelo */}
            <div className="team-card">
              <img
                className="team-avatar"
                src="/images/Deangelo.jpg"
                alt="Deangelo Keys"
                loading="lazy"
              />
              <div className="team-name">Deangelo Keys</div>
              <div className="team-role">Consulting Manger</div>
              <a
                className="team-link"
                href="https://www.instagram.com/deangelokeys11/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram →
              </a>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .about-root { 
          font-size: 1rem;
          padding-inline: 12px;
        }
        .about-root h1 { font-size: 2rem; }

        .team-section { margin-top: 8px; }
        .team-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--team-gap);
          margin-top: 10px;
        }
        .team-card {
          background: #fff;
          border: 1px solid #e7e7e7;
          border-radius: 14px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .team-avatar {
          width: 120px;
          height: 120px;
          border-radius: 999px;
          object-fit: cover;
          object-position: center;
          border: 1px solid #e5e7eb;
          margin-bottom: 10px;
          background: #f3f4f6;
        }
        .team-name {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .team-role {
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 6px;
        }
        .team-link {
          font-weight: 500;
          color: #2563eb;
          text-decoration: none;
        }
        .team-link:hover { text-decoration: underline; }

        :root { --team-gap: 18px; }

        /* center a single card row */
        .team-row-center {
          display: flex;
          justify-content: center;
        }

        /* make single card equal to one column of the two-up grid */
        .team-equal {
          width: calc((100% - var(--team-gap)) / 2);
        }

        @media (max-width: 700px) {
          .team-equal { width: 100%; }
        }

        /* Mobile */
        @media (max-width: 700px) {
          .about-root { 
            font-size: 0.75rem;
            margin: 84px auto;
            padding-inline: 24px;
          }
          .about-root h1 { font-size: 1.5rem; }
          .team-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .team-avatar { width: 100px; height: 100px; }
        }
      `}</style>
    </>
  );
}

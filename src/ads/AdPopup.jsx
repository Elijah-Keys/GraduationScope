// src/ads/AdPopup.jsx
import React, { useEffect } from "react";

export default function AdPopup({ ad, onClose, onAction }) {
  const close = () => onClose?.();

  // Run unconditionally, guard inside
  useEffect(() => {
    if (!ad) return;
    const onKey = e => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ad]);

  // Early return AFTER hooks
  if (!ad) return null;

  // If you want the image to act like the primary CTA
  const ImgWrap = ({ children }) =>
    ad.href ? (
      <a
        href={ad.href}
        target="_blank"
        rel="noreferrer"
        onClick={() => onAction?.("primary")}
        style={{ display: "block" }}
      >
        {children}
      </a>
    ) : (
      <>{children}</>
    );

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={e => { if (e.target === e.currentTarget) close(); }}
      style={styles.backdrop}
    >
      <div style={styles.card}>
        <button aria-label="Close ad" onClick={close} style={styles.x}>×</button>

        {ad.image && (
          <ImgWrap>
            <img
              src={ad.image}
              alt={ad.title || "Ad"}
              style={styles.img}
              loading="lazy"
            />
          </ImgWrap>
        )}

        <div style={{ padding: "14px 16px 0" }}>
          {ad.title && <h3 style={styles.title}>{ad.title}</h3>}
          {ad.text && <p style={styles.text}>{ad.text}</p>}
        </div>

        <div style={styles.row}>
          {ad.ctaText && ad.href && (
            <a
              href={ad.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => onAction?.("primary")}
              style={{ textDecoration: "none", flex: 1 }}
            >
              <button style={styles.primary}>{ad.ctaText}</button>
            </a>
          )}
          {ad.secondaryCtaText && ad.secondaryHref && (
            <a
              href={ad.secondaryHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => onAction?.("secondary")}
              style={{ textDecoration: "none", flex: 1 }}
            >
              <button style={styles.secondary}>{ad.secondaryCtaText}</button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// keep your existing styles object below


const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "grid",
    placeItems: "center",
    zIndex: 2147483647
  },
  card: {
    width: "min(440px, 92vw)",
    background: "#0f172a",
    color: "#fff",
    borderRadius: 16,
    boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
    overflow: "hidden",
    position: "relative",
    paddingBottom: 16,
    border: "1px solid rgba(255,255,255,0.06)"
  },
  x: {
    position: "absolute",
    top: 8,
    right: 10,
    fontSize: 22,
    lineHeight: 1,
    background: "transparent",
    color: "#fff",
    border: 0,
    cursor: "pointer"
  },
  img: {
    width: "100%",
    height: 240,
    objectFit: "cover",
    display: "block"
  },
  title: {
    margin: "0 0 6px",
    fontSize: 20,
    fontWeight: 800
  },
  text: {
    margin: "0 0 12px",
    color: "#e5e7eb",
    fontSize: 14,
    lineHeight: 1.4
  },
  row: {
    display: "flex",
    gap: 10,
    padding: "0 16px"
  },
  primary: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: 0,
    cursor: "pointer",
    fontWeight: 800,
    background: "#20A7EF",
    color: "#081018"
  },
  secondary: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#111827",
    color: "#e5e7eb",
    cursor: "pointer",
    fontWeight: 700
  }
};

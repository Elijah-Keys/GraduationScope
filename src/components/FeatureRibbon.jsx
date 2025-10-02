import React from "react";
import { FiSearch } from "react-icons/fi";
import { LuTarget } from "react-icons/lu";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

/**
 * White “chips” on transparent container so it inherits the parent navy background.
 * Divider is OFF by default (no hairline above the ribbon).
 */
export default function FeatureRibbon({
  brandBlue = "#7589F3",
  dividerOpacity = 0.18,
  showDivider = false, // <-- default off
}) {
  const chipStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
    fontWeight: 700,
    fontSize: 14,
    color: "#111827",
    whiteSpace: "nowrap",
  };

  return (
    <div
      aria-label="Graduation Scope mini features"
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "0 12px",
        margin: "0 0 10px",      // <-- no top margin (prevents seam)
        background: "transparent",
      }}
    >
      {/* divider is optional; default hidden */}
      {showDivider && (
        <div
          style={{
            width: "min(1200px, 100%)",
            height: 4,
            margin: "0 auto 12px",
            borderRadius: 999,
            background: `rgba(255,255,255,${dividerOpacity})`,
          }}
        />
      )}

      {/* chip row */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            ...chipStyle,
            borderRadius: 10,
            padding: "6px 10px",
            fontWeight: 800,
            letterSpacing: "0.06em",
            fontSize: 12,
            textTransform: "uppercase",
          }}
        >
          Built for Students
        </div>

        <div style={chipStyle}>
          <LuTarget style={{ color: brandBlue }} />
          Smart GE tracking
        </div>

        <div style={chipStyle}>
          <FiSearch style={{ color: brandBlue }} />
          Find easy-fit classes
        </div>

        <div style={chipStyle}>
          <IoMdCheckmarkCircleOutline style={{ color: "#22c55e" }} />
          Clear progress at a glance
        </div>
      </div>
    </div>
  );
}

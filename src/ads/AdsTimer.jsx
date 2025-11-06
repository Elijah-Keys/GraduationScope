// src/ads/AdTimers.jsx
import React, { useEffect, useRef, useState } from "react";
import AdPopup from "./AdPopup";
import { logAd, shouldShow, markShown } from "./AdTracker";

export default function AdTimers({
  userId,
  firstAd,
  secondAd,
  firstDelaySec = 120,
  gapAfterFirstSec = 300,
  cooldownDays = 3,            // show each ad again only after N days
  countIdleWhileTesting = false
}) {
  const uid = userId || "anon";

  const [showFirst, setShowFirst] = useState(false);
  const [showSecond, setShowSecond] = useState(false);

  const activeSec = useRef(0);
  const lastActivity = useRef(Date.now());
  const intervalId = useRef(null);

  const sessFirstKey = `adSess_${uid}_firstShown`;
  const sessSecondKey = `adSess_${uid}_secondShown`;
  const sessFirstAtKey = `adSess_${uid}_firstAt`;
  const firstShownAtRef = useRef(null);

  const testing = countIdleWhileTesting || firstDelaySec <= 15;

  useEffect(() => {
    if (testing) {
      console.log("[AdTimers] dev reset of session gates");
      sessionStorage.removeItem(sessFirstKey);
      sessionStorage.removeItem(sessSecondKey);
      sessionStorage.removeItem(sessFirstAtKey);
      activeSec.current = 0;
      setShowFirst(false);
      setShowSecond(false);
    }
  }, [testing, sessFirstKey, sessSecondKey]);

  // dev helpers
  useEffect(() => {
    window.__ads = window.__ads || {};
    window.__ads.show1 = () => setShowFirst(true);
    window.__ads.show2 = () => setShowSecond(true);
    window.__ads.reset = () => {
      sessionStorage.removeItem(sessFirstKey);
      sessionStorage.removeItem(sessSecondKey);
      sessionStorage.removeItem(sessFirstAtKey);
      activeSec.current = 0;
      setShowFirst(false);
      setShowSecond(false);
      console.log("[AdTimers] reset");
    };
    return () => {
      if (window.__ads) {
        delete window.__ads.show1;
        delete window.__ads.show2;
        delete window.__ads.reset;
      }
    };
  }, [sessFirstKey, sessSecondKey]);

  useEffect(() => {
    const bump = () => { lastActivity.current = Date.now(); };
    const events = ["pointermove", "keydown", "wheel", "scroll", "touchstart", "click"];
    events.forEach(e => window.addEventListener(e, bump));

    intervalId.current = setInterval(() => {
      const visible = countIdleWhileTesting ? true : document.visibilityState === "visible";
      const recentlyActive = countIdleWhileTesting || Date.now() - lastActivity.current < 30000;

      if (visible && recentlyActive) {
        activeSec.current += 1;

        // FIRST popup gate
        if (!showFirst
            && !sessionStorage.getItem(sessFirstKey)
            && activeSec.current >= firstDelaySec) {

          const passCooldown = firstAd?.id ? shouldShow(firstAd.id, cooldownDays) : true;
          if (!passCooldown) {
            sessionStorage.setItem(sessFirstKey, "skip");
          } else {
            setShowFirst(true);
            sessionStorage.setItem(sessFirstKey, "1");
            sessionStorage.setItem(sessFirstAtKey, String(activeSec.current));
            firstShownAtRef.current = activeSec.current;
            if (firstAd?.id) markShown(firstAd.id);
            logAd?.("view", firstAd?.id || "ad1", { uid, t: activeSec.current });
            return; // do not evaluate second on same tick
          }
        }

        // SECOND popup gate: waits full gap after first actually appeared
        const firstAtFromSess = Number(sessionStorage.getItem(sessFirstAtKey));
        const firstAt = Number.isFinite(firstAtFromSess) ? firstAtFromSess : firstShownAtRef.current;
        const waitedSinceFirst = firstAt != null ? activeSec.current - firstAt : 0;

        if (!showSecond
            && !sessionStorage.getItem(sessSecondKey)
            && firstAt != null
            && waitedSinceFirst >= gapAfterFirstSec
            && !showFirst) {

          const passCooldown2 = secondAd?.id ? shouldShow(secondAd.id, cooldownDays) : true;
          if (!passCooldown2) {
            sessionStorage.setItem(sessSecondKey, "skip");
          } else {
            setShowSecond(true);
            sessionStorage.setItem(sessSecondKey, "1");
            if (secondAd?.id) markShown(secondAd.id);
            logAd?.("view", secondAd?.id || "ad2", { uid, t: activeSec.current });
          }
        }
      }
    }, 1000);

    console.log("[AdTimers] interval started");
    return () => {
      events.forEach(e => window.removeEventListener(e, bump));
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, [
    uid,
    firstAd, secondAd,
    showFirst, showSecond,
    firstDelaySec, gapAfterFirstSec,
    cooldownDays,
    countIdleWhileTesting
  ]);

  return (
    <>
      {showFirst && (
        <AdPopup
          ad={firstAd}
          onClose={() => {
            setShowFirst(false);
            logAd?.("close", firstAd?.id || "ad1", { uid, t: activeSec.current });
          }}
          onAction={(which) => {
            logAd?.("click", firstAd?.id || "ad1", { uid, which, t: activeSec.current });
          }}
        />
      )}

      {showSecond && !showFirst && (
        <AdPopup
          ad={secondAd}
          onClose={() => {
            setShowSecond(false);
            logAd?.("close", secondAd?.id || "ad2", { uid, t: activeSec.current });
          }}
          onAction={(which) => {
            logAd?.("click", secondAd?.id || "ad2", { uid, which, t: activeSec.current });
          }}
        />
      )}
    </>
  );
}

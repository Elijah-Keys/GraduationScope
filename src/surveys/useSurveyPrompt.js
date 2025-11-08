// src/surveys/useSurveyPrompt.js
import { useEffect, useRef, useState } from "react";

export function useSurveyPrompt({
  userId = "anon",
  initialDelaySec = 30,
  cooldownHours = 168,
  forceTest = false
}) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const LAST_KEY = `gs_survey_last_${userId}`;
  const STATUS_KEY = `gs_survey_status_${userId}`; // taken or dismissed

  useEffect(() => {
    if (forceTest) {
      setOpen(true);
      return;
    }

    const last = parseInt(localStorage.getItem(LAST_KEY) || "0", 10);
    const now = Date.now();
    const coolMs = cooldownHours * 60 * 60 * 1000;

    if (last && now - last < coolMs) return;

    timerRef.current = setTimeout(() => {
      setOpen(true);
    }, Math.max(0, initialDelaySec) * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, initialDelaySec, cooldownHours, forceTest]);

  function stamp(status) {
    localStorage.setItem(LAST_KEY, String(Date.now()));
    if (status) localStorage.setItem(STATUS_KEY, status);
  }

  function dismiss() {
    stamp("dismissed");
    setOpen(false);
  }

  function take(url) {
    stamp("taken");
    setOpen(false);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  return { open, dismiss, take };
}

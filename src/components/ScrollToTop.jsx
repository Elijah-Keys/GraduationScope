import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Scroll to top on SPA navigations.
 * - Always scroll on PUSH/REPLACE (clicking links, programmatic nav)
 * - Keep scroll on POP (back/forward) so the browser history feels natural.
 *   If you prefer *always* scroll, remove the action check.
 */
export default function ScrollToTop({ behavior = "smooth" }) {
  const { pathname, search } = useLocation();
  const action = useNavigationType(); // "PUSH" | "REPLACE" | "POP"

  useEffect(() => {
    if (action === "POP") return; // keep position on back/forward
    // wait a tick so the new page layout is rendered
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior });
    });
  }, [pathname, search, action, behavior]);

  return null;
}


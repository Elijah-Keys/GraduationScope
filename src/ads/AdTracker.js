// src/ads/AdTracker.js
export async function logAd(evt, adId, meta = {}) {
  const BASE = process.env.REACT_APP_AD_API_BASE;

  // never use the bare "location" global
  const page = {
    href: window.location.href,
    path: window.location.pathname,
    search: window.location.search,
    ref: document.referrer || null,
    ua: navigator.userAgent
  };

  const body = { event: evt, adId, meta: { ...meta, page }, ts: Date.now() };

  try {
    if (BASE) {
      await fetch(`${BASE}/api/ad-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify(body)
      });
    } else if (window.gtag) {
      // dev fallback into GA if no backend set
      window.gtag("event", `ad_${evt}`, { ad_id: adId, ...meta, ...page });
    }
  } catch {}
}

export function shouldShow(adId, days = 3) {
  const key = `ad_seen_${adId}`;
  const last = localStorage.getItem(key);
  if (!last) return true;
  return Date.now() - Number(last) > days * 24 * 60 * 60 * 1000;
}

export function markShown(adId) {
  localStorage.setItem(`ad_seen_${adId}`, String(Date.now()));
}

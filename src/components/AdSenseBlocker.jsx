import React, { useEffect, useContext, useRef } from "react";
import { PremiumContext } from "../PremiumContext";

export default function AdSenseBlock({ slot = "auto", style = { display: "block" } }) {
  const { premium, loading } = useContext(PremiumContext);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (loading || premium) return;

    if (!document.querySelector('script[data-adsbygoogle]')) {
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5122240564600967";
      s.crossOrigin = "anonymous";
      s.setAttribute("data-adsbygoogle", "1");
      s.onload = () => { try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {} };
      document.head.appendChild(s);
    } else if (!pushedRef.current) {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
      pushedRef.current = true;
    }
  }, [premium, loading]);

  if (loading || premium) return null;

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-5122240564600967"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

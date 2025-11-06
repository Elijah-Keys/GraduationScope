import React, { useEffect } from "react";
import { logAd } from "./AdTracker";
export default function AdBanner({ ad }) {
  useEffect(() => { logAd("impression", ad.id, { kind: "banner" }); }, [ad.id]);
  const onClick = () => logAd("click", ad.id, { kind: "banner" });
  return (
    <a onClick={onClick} href={ad.href}
       style={{display:"block",background:ad.bg||"#F1F5F9",color:ad.textColor||"#111",
               padding:"14px 16px",borderRadius:12,textDecoration:"none",border:"1px solid rgba(0,0,0,0.08)"}}>
      <strong style={{display:"block",fontSize:16}}>{ad.title}</strong>
      <span style={{opacity:0.9}}>{ad.text}</span>
      <span style={{float:"right",fontWeight:600,padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,0.7)",marginLeft:10}}>
        {ad.ctaText}
      </span>
    </a>
  );
}

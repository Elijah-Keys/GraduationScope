import React from "react";
import AdPopup from "./ads/AdPopup";
const promo = {
  id: "gs-premium-nov",
  title: "Go ad free with Premium",
  text: "Unlock faster search and personalized picks",
  ctaText: "Try Premium",
  href: "/premium?src=ad_gs_premium_nov",
  image: "/img/premium-card.png"
};
export default function ExampleAds() {
  return <AdPopup ad={promo} delayMs={1200} frequencyDays={0} />;
}

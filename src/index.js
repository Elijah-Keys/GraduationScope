
import React from "react";
 import ReactDOM from "react-dom/client";
 import "./index.css";
 import App from "./App";
 import reportWebVitals from "./reportWebVitals";
 import { BrowserRouter } from "react-router-dom";
 import ScrollToTop from "./components/ScrollToTop";
 import "intro.js/introjs.css";
import { PremiumProvider } from "./PremiumContext";

 const container = document.getElementById("root");
 if (container) {
   ReactDOM.createRoot(container).render(
     <React.StrictMode>
       <BrowserRouter>
         <ScrollToTop />  
        <PremiumProvider>
          <App />
        </PremiumProvider>
       </BrowserRouter>
     </React.StrictMode>
   );
 }
// Remove any bare ');' text node that gets appended after #root
(() => {
  const root = document.getElementById('root');

  const sweep = () => {
    if (!root) return;
    // remove every text sibling after #root that equals ');'
    for (let n = root.nextSibling; n; n = n.nextSibling) {
      if (n.nodeType === 3 && n.textContent && n.textContent.trim() === ');') {
        n.remove();
      }
    }
  };

  // one-time before React mounts
  sweep();

  // watch ONLY direct children of <body>, never inside #root
  new MutationObserver(muts => {
    for (const m of muts) {
      for (const node of m.addedNodes) {
        if (node !== root && node.nodeType === 3 && node.textContent && node.textContent.trim() === ');') {
          node.remove();
        }
      }
    }
  }).observe(document.body, { childList: true }); // no subtree
})();

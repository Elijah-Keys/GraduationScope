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
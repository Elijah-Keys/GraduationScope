import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import "intro.js/introjs.css";

const container = document.getElementById("root");
if (container) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <BrowserRouter>
          {/* This watches route changes and scrolls up */}
        <ScrollToTop />
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  // When you are on a static HTML page that has no #root
  console.warn("No #root found. Skipping React mount.");
}

reportWebVitals();

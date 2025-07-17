// BackgroundRotator.jsx
import React, { useState, useEffect } from "react";

const images = [
  "/img/bg1.jpg",
  "/img/bg2.jpg",
  "/img/bg3.jpg"
];

export default function BackgroundRotator({ children }) {
  const [index, setIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);

    const interval = setInterval(() => {
      if (isDesktop) {
        setIndex(i => (i + 1) % images.length);
      }
    }, 5000); // Change every 5 seconds

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, [isDesktop]);

  return (
    <div
      className="w-full h-screen bg-cover bg-center transition-all duration-1000 ease-in-out"
      style={{
        backgroundImage: `url(${images[index]})`
      }}
    >
      <div className="w-full h-full bg-black bg-opacity-40 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

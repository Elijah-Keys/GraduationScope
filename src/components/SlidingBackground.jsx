import React, { useEffect, useState } from "react";

const images = [
  "/hero1.jpg",
  "/hero2.jpg",
  "/hero3.jpg",
  "/hero4.jpg"
];

export default function SlidingBackground({ children }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % images.length);
    }, 5000); // every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Slides container */}
      <div
        className="flex transition-transform duration-1000 ease-in-out h-full"
        style={{
          width: `${images.length * 100}%`,
          transform: `translateX(-${index * 100}vw)`
        }}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`bg-${i}`}
            className="w-screen h-screen object-cover flex-shrink-0"
          />
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

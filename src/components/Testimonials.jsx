import React from "react";
import "./Testimonials.css";

const testimonialsData = [
  {
    name: "Jane Doe",
    role: "Product Manager",
    photo: "/testimonials/jane.jpg",
    quote: "This app transformed how I track my classes. Highly recommend!",
  },
  {
    name: "John Smith",
    role: "Student",
    photo: "/testimonials/john.jpg",
    quote: "Easy to use and very intuitive. Helped me graduate on time.",
  },
  {
    name: "Emily Johnson",
    role: "Advisor",
    photo: "/testimonials/emily.jpg",
    quote: "A must-have tool for students and advisors alike.",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <h2 className="testimonials-title">What Our Users Say</h2>
      <div className="testimonials-container">
        {testimonialsData.map(({ name, role, photo, quote }, idx) => (
          <div key={idx} className="testimonial-card">
            <img src={photo} alt={`${name}'s photo`} className="testimonial-photo" />
            <p className="testimonial-quote">"{quote}"</p>
            <p className="testimonial-name">{name}</p>
            <p className="testimonial-role">{role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

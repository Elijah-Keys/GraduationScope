import React, { useEffect, useMemo } from "react";

// Inject FAQPage JSON-LD into <head>
function injectJsonLd(faqs) {
  const existing = document.getElementById("faq-jsonld");
  if (existing) existing.remove();

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "faq-jsonld";
  script.text = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(([q, a]) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a.replace(/\n/g, " ") }
    }))
  });
  document.head.appendChild(script);
}

const baseStyles = `
.faq-wrap{
  max-width:900px;
  margin:0 auto;
  padding:120px 24px 32px; /* top ~80px, bottom ~32px */
}
.faq-header{font-size:1.75rem;font-weight:800;margin:8px 0 16px}
.faq-sub{color:#444;margin-bottom:16px}
.faq-item{border:1px solid #e3e3e3;border-radius:12px;margin-bottom:12px;background:#fff;overflow:hidden}
.faq-item summary{cursor:pointer;list-style:none;padding:14px 16px;font-weight:700;color:#1a1a1a;outline:none}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item .body{padding:0 16px 16px 16px;color:#222;line-height:1.55}
`;

export default function ChicoFAQ() {
  // Page <title> and description
  useEffect(() => {
    document.title = "Chico State GE FAQ | GraduationScope";
    const meta =
      document.querySelector('meta[name="description"]') ||
      document.createElement("meta");
    meta.name = "description";
    meta.content =
      "Chico State GE questions answered: easiest classes, Area C rules, online options, transfer credits, and progress tracking.";
    if (!meta.parentNode) document.head.appendChild(meta);
  }, []);

  // Plain-text Q&A (no links)
  const faqs = useMemo(
    () => [
      [
        "What are the easiest GE classes at Chico State?",
        "Students often mention THEA 251, MUSC 290, and JOUR 255 as lighter options. Compare recent feedback and syllabi to gauge workload."
      ],
      [
        "How do I fulfill Area C (Arts & Humanities) at Chico?",
        "You need both C1 (Arts) and C2 (Humanities). Plan at least one course from each and confirm the latest approved list in the catalog."
      ],
      [
        "Who are the best reviewed professors for GE?",
        "Look for instructors with clear rubrics, structured assignments, and consistent feedback. Ask peers and check recent term evaluations."
      ],
      [
        "How do I complete Area D (Social Sciences) fast?",
        "You generally need two courses. Start early and choose sections that fit your schedule and workload balance."
      ],
      [
        "How do I track GE completion at Chico?",
        "Use your degree progress report and maintain a checklist of completed areas. Update it each term after grades post."
      ],
      [
        "Which online GE classes are available?",
        "Many GE offerings have online or asynchronous sections. Verify that the online section is the approved course for your GE area."
      ],
      [
        "What is the difference between lower-division and upper-division GE?",
        "Lower-division GE is typically taken in the first two years; upper-division GE is taken later and may assume more writing or research."
      ],
      [
        "Can transfer GE credits count at Chico?",
        "Yes, within policy limits. Review your transfer evaluation and confirm which GE areas received credit."
      ],
      [
        "What is the hardest GE requirement at Chico?",
        "Students often report upper-division science as more demanding due to labs, readings, or exams. Plan it alongside lighter courses."
      ],
      [
        "What GE pairs well for a business major at Chico?",
        "ECON, JOUR, and certain COMM courses often complement the business curriculum and help balance quantitative courses."
      ]
    ],
    []
  );

  // Inject JSON-LD and clean up on unmount
  useEffect(() => {
    injectJsonLd(faqs);
    return () => {
      const node = document.getElementById("faq-jsonld");
      if (node) node.remove();
    };
  }, [faqs]);

  return (
    <main className="faq-wrap">
      <style>{baseStyles}</style>
      <h1 className="faq-header">Chico State GE FAQ</h1>
      <p className="faq-sub">
        Fast answers to common questions. Fully indexable for SEO.
      </p>

      {faqs.map(([q, a], i) => (
        <details key={i} className="faq-item">
          <summary>{q}</summary>
          <div className="body">
            <p>{a}</p>
          </div>
        </details>
      ))}
    </main>
  );
}

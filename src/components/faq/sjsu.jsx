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

export default function SJSUFAQ() {
  // Page <title> and description
  useEffect(() => {
    document.title = "SJSU GE FAQ | GraduationScope";
    const meta =
      document.querySelector('meta[name="description"]') ||
      document.createElement("meta");
    meta.name = "description";
    meta.content =
      "Answers to SJSU GE questions: easiest classes, double counting, online options, and tracking progress.";
    if (!meta.parentNode) document.head.appendChild(meta);
  }, []);

  // Plain-text Q&A (no links)
  const faqs = useMemo(
    () => [
      [
        "What are the easiest GE classes at SJSU?",
        "Many students cite COMM 20, MUSC 10, and AAS 33. Check current semester chatter and compare instructors to find lighter options."
      ],
      [
        "How do I fulfill Area A at SJSU?",
        "You must complete A1, A2, and A3 (Oral Communication, Written Communication, and Critical Thinking). Review the current catalog to see approved courses."
      ],
      [
        "Can a class double count for different areas?",
        "Some courses overlap with limits. Always confirm double-counting rules in the current catalog or degree audit before relying on them."
      ],
      [
        "How do I track my GE progress?",
        "Use your campus degree progress report and keep a checklist of areas completed and remaining."
      ],
      [
        "Which professors are easiest for GE at SJSU?",
        "Students often prefer instructors with clear grading rubrics and lighter workloads. Ask peers and review recent course feedback."
      ],
      [
        "Do online GE classes count the same as in person?",
        "Yes, online sections generally count the same toward GE completion when they are the approved course."
      ],
      [
        "What is the fastest path to finish GE?",
        "Plan early, consider summer or intersession terms, and prioritize areas that allow overlap—within policy limits."
      ],
      [
        "How do I know if a class I took fulfills a GE?",
        "Look up the course in your degree audit; it will show which requirement it satisfies once posted to your record."
      ],
      [
        "Which SJSU GE areas are usually hardest?",
        "Many students report Areas B (Science & Math) and D (Social Sciences) as more challenging due to workload or sequencing."
      ],
      [
        "How should I build a balanced schedule?",
        "Mix lighter GE with heavier major courses, spread labs and writing-intensive classes across terms, and avoid stacking too many high-workload classes at once."
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
      <h1 className="faq-header">SJSU GE FAQ</h1>
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

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

export default function BerkeleyFAQ() {
  // Page <title> and description
  useEffect(() => {
    document.title = "UC Berkeley Breadth FAQ | GraduationScope";
    const meta =
      document.querySelector('meta[name="description"]') ||
      document.createElement("meta");
    meta.name = "description";
    meta.content =
      "UC Berkeley breadth questions answered: easiest classes, double counting, lighter science options, and progress tracking.";
    if (!meta.parentNode) document.head.appendChild(meta);
  }, []);

  // Plain-text Q&A (no links)
  const faqs = useMemo(
    () => [
      [
        "What are the easiest breadth classes at UC Berkeley?",
        "Students often mention Psych 1 and some ESPM and Theater options as lighter. Compare recent syllabi and feedback to gauge workload."
      ],
      [
        "How do I track my breadth progress?",
        "Use your degree progress report and keep a simple checklist showing completed groups and remaining ones."
      ],
      [
        "Which classes double count for multiple breadths?",
        "Some overlap is allowed with limits. Confirm the current overlap policy in the catalog or with an advisor before planning around it."
      ],
      [
        "Which professors are best for easy grades?",
        "Look for instructors with clear rubrics, steady pacing, and transparent expectations. Ask peers and review recent course feedback."
      ],
      [
        "How can I finish Social and Behavioral Sciences quickly?",
        "Start early and choose sections that fit your schedule and learning style. Many students pick introductory Sociology or related options."
      ],
      [
        "What are lighter science breadth options?",
        "Students often find certain ESPM or Geography courses more approachable. Review prerequisites and sample assessments."
      ],
      [
        "Do P/NP classes count for breadth?",
        "They can with restrictions. Verify P/NP limits and exceptions for your college before choosing that grading basis."
      ],
      [
        "How should freshmen choose breadth classes?",
        "Balance difficulty and time windows, avoid stacking multiple writing-heavy or lab-intensive courses in the same term."
      ],
      [
        "What is the difference between core and breadth at Berkeley?",
        "Core or major requirements are specific to your program. Breadth expands exposure across fields. Track both separately."
      ],
      [
        "How do I finish two or three breadths fast?",
        "Plan early, use allowable overlap, and distribute heavier courses across terms to keep workload reasonable."
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
      <h1 className="faq-header">UC Berkeley Breadth FAQ</h1>
      <p className="faq-sub">
        Quick answers to common questions. Fully indexable for SEO.
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

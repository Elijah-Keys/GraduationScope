import React, { useMemo } from "react";

export default function FAQSJSU() {
  // Q&A content
  const faqs = useMemo(
    () => [
      [
        "What is GraduationScope for SJSU",
        "It helps SJSU students find easier GE options, plan balanced terms, and track progress."
      ],
      [
        "Which GE areas must I complete at SJSU",
        "Area A1, A2, A3 plus Areas B, C, D, E and F. Always confirm the latest catalog."
      ],
      [
        "How does the easiest class finder work",
        "It blends instructor ratings, workload signals, and your day and time preferences to rank choices that meet GE rules."
      ],
      [
        "Can classes double count at SJSU",
        "Some courses can overlap with limits. Check your catalog and degree audit before relying on overlap."
      ],
      [
        "Do online GE classes count the same",
        "Yes when the section is the approved course. Verify in the schedule notes and catalog."
      ],
      [
        "How do I see my GE progress",
        "Use your MySJSU degree progress report and the GraduationScope tracker to see percent complete and what is left."
      ],
      [
        "When should I take writing and labs",
        "Many students spread writing heavy and lab heavy courses across terms to avoid overload."
      ],
      [
        "What is a smart way to build a term",
        "Mix one lighter GE with major core or math and science. Avoid stacking multiple high workload classes at once."
      ],
      [
        "How do I choose good professors",
        "Look for recent student feedback that mentions clear rubrics, timely responses, and transparent grading."
      ],
      [
        "Do AP or IB credits satisfy GE",
        "Often yes. Credit and placement rules vary. Confirm with SJSU articulation and your advisor."
      ],
      [
        "Does Summer or Winter help me finish faster",
        "Short sessions can clear single GE areas and keep momentum without overloading Fall or Spring."
      ],
      [
        "Which areas do students say feel hardest",
        "Many report Areas B and D can be tougher due to labs or reading load. Your experience may vary by instructor."
      ],
      [
        "How do I avoid schedule conflicts",
        "Filter by preferred days and times, then check for overlap before you enroll."
      ],
      [
        "Can transfer students use GraduationScope",
        "Yes. Use it for planning and pair it with your official evaluation to confirm what still applies."
      ],
      [
        "How do I get the most value",
        "Use the checklist first, run recommendations, add picks to Classes Taken, and watch the progress bar climb."
      ]
    ],
    []
  );

  // Build JSON-LD from the same Q&A so schema always matches the page
  const faqLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(([q, a]) => ({
        "@type": "Question",
        "name": q,
        "acceptedAnswer": { "@type": "Answer", "text": a }
      }))
    }),
    [faqs]
  );

  return (
    <main className="faq-wrap">
      {/* React 19 hoists these into <head> */}
      <title>SJSU GE FAQ | GraduationScope</title>
      <meta
        name="description"
        content="SJSU GE questions answered. Areas A through F, easier options, double counting, online sections, and planning tips."
      />
      <link rel="canonical" href="https://www.graduationscope.com/faq/sjsu" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <style>{`
        .faq-wrap{max-width:900px;margin:0 auto;padding:120px 24px 32px}
        .faq-header{font-size:1.75rem;font-weight:800;margin:8px 0 16px}
        .faq-sub{color:#444;margin-bottom:16px}
        .faq-item{border:1px solid #e3e3e3;border-radius:12px;margin-bottom:12px;background:#fff;overflow:hidden}
        .faq-item summary{cursor:pointer;list-style:none;padding:14px 16px;font-weight:700;color:#1a1a1a;outline:none}
        .faq-item summary::-webkit-details-marker{display:none}
        .faq-item .body{padding:0 16px 16px;color:#222;line-height:1.55}
      `}</style>

      <h1 className="faq-header">SJSU GE FAQ</h1>
      <p className="faq-sub">Fast answers for San José State students.</p>

      {faqs.map(([q, a], i) => (
        <details key={i} className="faq-item">
          <summary>{q}</summary>
          <div className="body"><p>{a}</p></div>
        </details>
      ))}
    </main>
  );
}

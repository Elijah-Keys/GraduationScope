import React, { useMemo } from "react";

export default function FAQChico() {
  // Q&A content
  const faqs = useMemo(
    () => [
      ["What is GraduationScope for Chico State",
       "It helps Chico students find easier GE options, plan balanced terms, and track progress."],
      ["How do I fulfill Area C at Chico",
       "You need both C1 Arts and C2 Humanities. Pick at least one from each and confirm the current approved list."],
      ["What are lighter GE classes students mention",
       "Students often cite options like THEA, MUSC, and JOUR survey courses as lighter. Check recent syllabi and feedback to gauge workload."],
      ["How do I track GE completion",
       "Use your degree progress report and the GraduationScope tracker to see percent complete and what remains."],
      ["Can a class double count for multiple areas",
       "Some overlap is allowed with limits. Confirm rules in the catalog or with an advisor before planning around overlap."],
      ["Do online or asynchronous GE sections count the same",
       "Yes when the section is the approved course. Verify notes in the schedule and catalog."],
      ["What is the difference between lower division and upper division GE",
       "Lower division is usually taken early. Upper division expects more writing or research. Plan heavier ones with lighter companions."],
      ["Which GE areas feel harder for many students",
       "Upper division science can feel heavier due to labs or exams. Balance it with a lighter pair."],
      ["How do I choose good professors",
       "Look for clear rubrics, timely feedback, and transparent grading. Pair that with times that fit your life."],
      ["Do transfer GE credits count at Chico",
       "Often yes within policy limits. Confirm with your transfer evaluation and advisor."],
      ["Does Summer or Winter help me finish faster",
       "Yes. Short sessions can clear single GE areas and free space in Fall or Spring."],
      ["How do I get the most value",
       "Run the checklist, use recommendations, add picks to Classes Taken, and watch the progress bar move."]
    ],
    []
  );

  // JSON-LD from the same Q&A
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
      <title>Chico State GE FAQ | GraduationScope</title>
      <meta
        name="description"
        content="Chico State GE questions answered. Area C rules, easier options, online sections, transfer credits, and planning tips."
      />
      <link rel="canonical" href="https://www.graduationscope.com/faq/chico" />
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

      <h1 className="faq-header">Chico State GE FAQ</h1>
      <p className="faq-sub">Quick answers for Chico students.</p>

      {faqs.map(([q, a], i) => (
        <details key={i} className="faq-item">
          <summary>{q}</summary>
          <div className="body"><p>{a}</p></div>
        </details>
      ))}
    </main>
  );
}

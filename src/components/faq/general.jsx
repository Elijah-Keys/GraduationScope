import React, { useMemo } from "react";

export default function FAQGeneral() {
  // Single source of truth for Q&A
  const faqs = useMemo(
    () => [
      ["What is GraduationScope?",
       "GraduationScope is a free tool that helps students find easier classes, track GE progress, and plan faster paths to graduation."],
      ["Which universities are supported?",
       "San José State (SJSU), UC Berkeley, and Chico State are supported today, with more schools added based on demand."],
      ["How does the easiest-class finder work?",
       "It combines instructor ratings, workload and difficulty signals to surface lower-effort options that still meet your GE needs."],
      ["Can I track my graduation/GE progress?",
       "Yes. The tracker shows percent complete and remaining areas so you know exactly what’s left."],
      ["What makes GraduationScope different?",
       "It unifies checklist, progress, and recommendations in one place and is tuned for speed and clarity on mobile."],
      ["Does it cost anything?",
       "It’s free (ad-supported). A premium ad-free version is being explored."],
      ["Is this useful for transfer students?",
       "Yes, but always confirm your school’s transfer credit evaluation for final applicability."],
      ["How accurate are professor/difficulty scores?",
       "They’re aggregated from student reviews and other signals; treat them as directional, and check recent course info when possible."],
      ["Do AP/IB credits count toward GE?",
       "Often yes, but it depends on your university. Always verify with your school’s credit policy."],
      ["Can classes double-count for multiple areas?",
       "Sometimes, with limits. Check your catalog or degree audit to confirm overlap rules for your program."],
      ["When should I take GE courses?",
       "Many students clear easier GEs earlier and save capacity for major-heavy terms. Avoid stacking multiple writing-heavy or lab-heavy courses."],
      ["How do I pick good professors?",
       "Look for clear rubrics, consistent feedback, and recent positive student comments. Balance ratings with time and workload fit."],
      ["Is it mobile-friendly?",
       "Yes. Search, track, and plan from your phone; components are built with responsive layouts."],
      ["Can I request my university?",
       "Yes. Student requests are prioritized. The more demand, the sooner it’s added."],
      ["How do I get the most value?",
       "Use all three. Run the checklist, pick easier fits via recommendations, then watch your progress bar climb each term."]
    ],
    []
  );

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
      <title>General FAQ | GraduationScope</title>
      <meta
        name="description"
        content="Answers to common questions about finding easier classes and tracking GE progress at SJSU, Chico, and Berkeley."
      />
      <link rel="canonical" href="https://www.graduationscope.com/faq/general" />
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

      <h1 className="faq-header">General FAQ</h1>
      <p className="faq-sub">What is GraduationScope and how can it help you graduate faster?</p>

      {faqs.map(([q, a], i) => (
        <details key={i} className="faq-item">
          <summary>{q}</summary>
          <div className="body"><p>{a}</p></div>
        </details>
      ))}
    </main>
  );
}

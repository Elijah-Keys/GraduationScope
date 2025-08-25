import React, { useMemo } from "react";

export default function FAQBerkeley() {
  // Q&A content
  const faqs = useMemo(
    () => [
      ["What is GraduationScope for UC Berkeley",
       "It helps Berkeley students find easier breadth options, plan balanced terms, and track progress."],
      ["Which breadth groups must I complete",
       "Seven groups across Arts and Literature, Biological Science, Historical Studies, International Studies, Philosophy and Values, Physical Science, and Social and Behavioral Sciences. Confirm your college rules."],
      ["How does the easiest class finder work",
       "It blends instructor ratings, workload signals, and your time preferences to rank options that meet breadth rules."],
      ["Can a class double count for multiple requirements",
       "Some overlap is allowed with limits. Check your college policy and degree progress report before relying on overlap."],
      ["Do online or asynchronous classes count the same",
       "If the section is the approved course they generally count. Verify notes in the schedule and catalog."],
      ["How do I track breadth progress",
       "Use your degree progress report and GraduationScope to see percent complete and what remains."],
      ["When should I take writing heavy and lab heavy courses",
       "Spread them across terms. Do not stack multiple high workload classes in one term if avoidable."],
      ["Which areas do students say feel harder",
       "Physical and some Biological Science can feel heavier due to labs and problem sets. Your experience varies by instructor."],
      ["What are lighter science options students mention",
       "Students often cite some ESPM and Geography courses as more approachable. Check recent syllabi and assessments."],
      ["How do I pick good professors",
       "Look for clear rubrics, timely feedback, and transparent grading. Pair that with a schedule that fits your day and time needs."],
      ["Do P NP classes satisfy breadth",
       "Sometimes with restrictions. Confirm P NP rules for your college before choosing that grading basis."],
      ["Can transfer students use GraduationScope",
       "Yes. Plan with it and confirm applicability with your official evaluation."],
      ["How do I build a balanced schedule",
       "Mix one lighter breadth with major core or math science. Avoid stacking multiple heavy projects or labs at once."],
      ["Does Summer help me finish faster",
       "Yes. Summer can clear a single breadth group and free up space in Fall or Spring."],
      ["How do I get the most value",
       "Run the checklist, use recommendations, add picks to Classes Taken, and watch the progress bar move."]
    ],
    []
  );

  // JSON-LD built from the same Q&A so schema matches the content
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
      <title>UC Berkeley Breadth FAQ | GraduationScope</title>
      <meta
        name="description"
        content="Berkeley breadth questions answered. Easier options, double counting, lighter science picks, and planning tips."
      />
      <link rel="canonical" href="https://www.graduationscope.com/faq/berkeley" />
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

      <h1 className="faq-header">UC Berkeley Breadth FAQ</h1>
      <p className="faq-sub">Quick answers for Berkeley students.</p>

      {faqs.map(([q, a], i) => (
        <details key={i} className="faq-item">
          <summary>{q}</summary>
          <div className="body"><p>{a}</p></div>
        </details>
      ))}
    </main>
  );
}

import React, { useMemo } from "react";

export default function ChicoAreaC() {
  const UPDATED = "2025-08-25"; // bump when you change content

  const rows = useMemo(
    () => [
      {
        course: "MUSC 290 — World Music",
        subarea: "C1 Arts",
        why: "Survey format; listening-based assessments",
        work: "Listening logs, short quizzes",
        link: "https://catalog.csuchico.edu/courses/musc/"
      },
      {
        course: "THEA 110 — Introduction to Theatre Arts",
        subarea: "C1 Arts",
        why: "Intro survey; performance literacy focus",
        work: "Short responses, attendance, exams",
        link: "https://catalog.csuchico.edu/courses/thea/"
      },
      {
        course: "HUMN 222W — Arts and Ideas: Renaissance to Present",
        subarea: "C2 Humanities",
        why: "Thematic readings; writing with prompts",
        work: "Short papers, reading checks",
        link: "https://catalog.csuchico.edu/colleges-departments/college-humanities-fine-arts/humanities/humanities-ba/humanities-ba.pdf"
      }
    ],
    []
  );

  const articleLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Chico State Area C explained",
      datePublished: "2025-08-25",
      dateModified: UPDATED,
      author: { "@type": "Organization", name: "GraduationScope" },
      publisher: {
        "@type": "Organization",
        name: "GraduationScope",
        logo: { "@type": "ImageObject", url: "https://www.graduationscope.com/logo.png" }
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://www.graduationscope.com/guides/chico-area-c"
      }
    }),
    [UPDATED]
  );

  return (
    <main className="guide-wrap">
      {/* React 19 hoists these to <head> */}
      <title>Chico State Area C explained | GraduationScope</title>
      <meta
        name="description"
        content="How Area C works at Chico State (C1 Arts and C2 Humanities), quick picks students often consider approachable, and official links."
      />
      <link rel="canonical" href="https://www.graduationscope.com/guides/chico-area-c" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />

      <style>{`
        .guide-wrap{max-width:980px;margin:0 auto;padding:120px 24px 40px}
        .guide-h1{font-size:1.9rem;font-weight:800;margin:8px 0 12px}
        .muted{color:#555}
        .tldr{background:#f8f9fb;border:1px solid #e7e7e7;border-radius:12px;padding:12px 14px;margin:12px 0 18px}
        .tldr h2{font-size:1.05rem;margin:0 0 8px}
        .tldr ul{margin:0;padding-left:18px}
        .tldr li{margin:4px 0}
        table{width:100%;border-collapse:collapse;margin:12px 0 18px}
        th,td{border:1px solid #e2e2e2;padding:10px;vertical-align:top}
        th{background:#fafafa;text-align:left;font-weight:700}
        .notes{font-size:0.95rem;line-height:1.6}
        .sources a{color:#1a56db;text-decoration:underline}
      `}</style>

      <h1 className="guide-h1">Chico State Area C explained</h1>
      <p className="muted">Updated on {UPDATED}</p>

      <section className="tldr">
        <h2>TLDR</h2>
        <ul>
          <li>Area C has two parts: C1 Arts and C2 Humanities</li>
          <li>Plan at least one course from each subarea</li>
          <li>Check the current Catalog list to confirm a course still carries C1 or C2</li>
          <li>Balance one “approachable” C course with heavier major classes</li>
        </ul>
      </section>

      <h2>Quick picks students often consider approachable</h2>
      <p className="muted">Offerings and attributes change. Confirm the C1/C2 tag in the current Catalog before enrolling.</p>

      <table>
        <thead>
          <tr>
            <th>Course example</th>
            <th>Subarea</th>
            <th>Why it may feel approachable</th>
            <th>Typical work</th>
            <th>Official link</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.course}</td>
              <td>{r.subarea}</td>
              <td>{r.why}</td>
              <td>{r.work}</td>
              <td><a href={r.link} target="_blank" rel="nofollow noopener">Catalog</a></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>How Area C fits in your GE</h2>
      <p className="notes">
        Chico’s GE uses defined subject areas and upper-division pathways. Newer catalogs list C1 Arts and C2 Humanities under the
        General Education requirements. Always verify your catalog year in your Degree Progress Report, then match courses to C1/C2.
      </p>

      <h2>Sources</h2>
      <ul className="sources">
        <li><a href="https://catalog.csuchico.edu/colleges-departments/undergraduate-education-academic-success/general-education/" target="_blank" rel="nofollow noopener">Chico State General Education (Catalog)</a></li>
        <li><a href="https://catalog.csuchico.edu/colleges-departments/undergraduate-education-academic-success/general-education/general-education.pdf" target="_blank" rel="nofollow noopener">GE course lists (PDF)</a></li>
        <li><a href="https://catalog.csuchico.edu/courses/musc/" target="_blank" rel="nofollow noopener">MUSC courses (Catalog)</a></li>
        <li><a href="https://catalog.csuchico.edu/courses/thea/" target="_blank" rel="nofollow noopener">THEA courses (Catalog)</a></li>
      </ul>
    </main>
  );
}

import React from "react";

export default function SJSUEasiestClasses() {
  const UPDATED = "2025-08-25"; // update when you change content

  return (
    <main className="guide-wrap">
      {/* React 19 moves these into <head> */}
      <title>Easiest Classes at SJSU | GraduationScope</title>
      <meta
        name="description"
        content="A quick shortlist of lighter SJSU GE options, how to choose professors, and planning tips. Updated regularly."
      />
      <link rel="canonical" href="https://www.graduationscope.com/guides/sjsu-easiest-classes" />

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

      <h1 className="guide-h1">Easiest Classes at SJSU</h1>
      <p className="muted">Updated on {UPDATED}</p>

      <section className="tldr">
        <h2>TLDR</h2>
        <ul>
          <li>Pick lighter GE that still fits your remaining areas</li>
          <li>Scan recent student feedback for clear rubrics and steady pacing</li>
          <li>Do not stack multiple writing heavy or lab heavy courses in one term</li>
          <li>Use one lighter GE to balance a major core or math science course</li>
          <li>Confirm final applicability in your degree audit</li>
        </ul>
      </section>

      <h2>Quick picks that students often find lighter</h2>
      <p className="muted">Replace any placeholders after you confirm current term offerings</p>

      <table>
        <thead>
          <tr>
            <th>Class</th>
            <th>GE area</th>
            <th>Why it may feel lighter</th>
            <th>Typical work</th>
            <th>Catalog</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>COMM 20 Public Speaking</td>
            <td>A1</td>
            <td>Structured speech sequence and clear rubrics in many sections</td>
            <td>Short speeches, outlines, peer feedback</td>
            <td><a href="https://example.edu/sjsu-catalog-comm20" target="_blank" rel="nofollow noopener">Official description</a></td>
          </tr>
          <tr>
            <td>MUSC 10 Music Appreciation</td>
            <td>C1</td>
            <td>Concept surveys and listening based assessments</td>
            <td>Listening logs, short quizzes, reflection</td>
            <td><a href="https://example.edu/sjsu-catalog-musc10" target="_blank" rel="nofollow noopener">Official description</a></td>
          </tr>
          <tr>
            <td>AAS 33 Asian Americans in US History</td>
            <td>D</td>
            <td>Reading guided by study questions in many sections</td>
            <td>Weekly readings, discussion posts, short papers</td>
            <td><a href="https://example.edu/sjsu-catalog-aas33" target="_blank" rel="nofollow noopener">Official description</a></td>
          </tr>
        </tbody>
      </table>

      <h2>How to choose the best section</h2>
      <p className="notes">
        Look for recent comments that mention clear grading, timely feedback, and transparent expectations. 
        Check days and times that fit your routine. 
        Pair one lighter GE with a heavier major course for balance.
      </p>

      <h2>Sources you should cite on your site</h2>
      <ul className="sources">
        <li><a href="https://example.edu/sjsu-ge-overview" target="_blank" rel="nofollow noopener">SJSU GE overview</a></li>
        <li><a href="https://example.edu/sjsu-catalog" target="_blank" rel="nofollow noopener">SJSU catalog main page</a></li>
      </ul>

      <p className="muted">Replace example links with the current official catalog or GE pages</p>
    </main>
  );
}

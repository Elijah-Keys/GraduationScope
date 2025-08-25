import React from "react";

export default function BlogPickSJSUGEFast() {
  const UPDATED = "2025-08-25";
  const CANONICAL = "https://www.graduationscope.com/blog/pick-sjsu-ge-fast";

  // JSON-LD for BlogPosting (helps AI + search)
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "How to pick SJSU GE classes in 10 minutes",
    "datePublished": "2025-08-25",
    "dateModified": UPDATED,
    "author": { "@type": "Organization", "name": "GraduationScope" },
    "publisher": {
      "@type": "Organization",
      "name": "GraduationScope",
      "logo": { "@type": "ImageObject", "url": "https://www.graduationscope.com/graduation-scope-logo.png" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": CANONICAL }
  };

  return (
    <main className="post-wrap">
      {/* React 19 hoists these into <head> */}
      <title>How to Pick SJSU GE Classes in 10 Minutes | GraduationScope</title>
      <meta
        name="description"
        content="Use MySJSU (MyProgress/MyPlanner) plus the official Catalog & Class Schedule to pick SJSU GE classes fast. TL;DR, table, and sources."
      />
      <link rel="canonical" href={CANONICAL} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />

      <style>{`
        .post-wrap{max-width:980px;margin:0 auto;padding:120px 24px 40px}
        .post-h1{font-size:1.9rem;font-weight:800;margin:8px 0 16px}
        .muted{color:#555}
        .tldr{background:#f8f9fb;border:1px solid #e7e7e7;border-radius:12px;padding:12px 14px;margin:12px 0 18px}
        .tldr ul{margin:0;padding-left:18px}
        .tldr li{margin:4px 0}
        h2{margin-top:18px}
        a{color:#1a56db;text-decoration:underline}
        table{width:100%;border-collapse:collapse;margin:12px 0 18px}
        th,td{border:1px solid #e2e2e2;padding:10px;vertical-align:top}
        th{background:#fafafa;text-align:left;font-weight:700}
        .capsule{background:#fffdf7;border:1px solid #efe6c7;border-radius:12px;padding:14px;margin:12px 0 18px}
      `}</style>

      <h1 className="post-h1">How to Pick SJSU GE Classes in 10 Minutes</h1>
      <p className="muted">Updated on {UPDATED}</p>

      <section className="tldr">
        <strong>TL;DR</strong>
        <ul>
          <li>Use <em>MyProgress</em> and <em>MyPlanner</em> in MySJSU to see exactly which GE areas you still need.</li>
          <li>Check the official SJSU Catalog and Class Schedule for courses and their GE designations.</li>
          <li>Balance workload: pair one “approachable” GE with heavier major courses.</li>
          <li>Filter the Class Schedule by GE Area; then scan sections that fit your days/times.</li>
        </ul>
      </section>

      <h2>Answer Capsule</h2>
      <div className="capsule">
        <p>
          Start in <strong>MyProgress</strong> inside MySJSU to get a real-time degree audit of completed and remaining GE requirements
          <span> [1]</span>. That gives you the authoritative checklist without guesswork. Next, use the official{" "}
          <strong>Catalog</strong> and the current <strong>Class Schedule</strong> to find courses that satisfy each needed GE area
          <span> [2][3]</span>. For students entering Fall 2025 or later, consult the latest CSU/SJSU GE requirements and
          catalog-year rules when planning; policies can vary by catalog year and college
          <span> [4][5]</span>. The fastest workflow is to filter the online Class Schedule by the GE Area you need and pick a section
          that fits your time constraints <span> [3]</span>. Combine one “approachable” GE with your heavier major course to keep the
          term balanced. Always confirm the GE tag on the section you intend to enroll in and review the syllabus when available.
        </p>
      </div>

      <h2>Quotable Table (examples)</h2>
      <p className="muted">
        These examples are informational—not guarantees—and can vary by instructor/term. Link out to official pages when possible.
      </p>
      <table>
        <thead>
          <tr>
            <th>Course</th>
            <th>GE Area</th>
            <th>Why it may feel approachable</th>
            <th>Typical work</th>
            <th>Official link</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>MUSC 10C — Popular Music in America</td>
            <td>Area C (Arts/Humanities)</td>
            <td>Familiar material (popular music); concept & listening focus</td>
            <td>Listening logs, short quizzes/reflections</td>
            <td><a href="https://catalog.sjsu.edu/" target="_blank" rel="nofollow noopener">Catalog</a></td>
          </tr>
          <tr>
            <td>DANC 10 — Dance Appreciation</td>
            <td>Area C</td>
            <td>Survey of dance forms; appreciation/analysis over performance</td>
            <td>Readings, brief responses, possible performance attendance</td>
            <td><a href="https://catalog.sjsu.edu/" target="_blank" rel="nofollow noopener">Catalog</a></td>
          </tr>
          <tr>
            <td>RTVF 10 — The Art of Film</td>
            <td>Area C</td>
            <td>Intro to film as an art; emphasis on analysis</td>
            <td>Analytical essays, discussion; sometimes a small group project</td>
            <td><a href="https://www.sjsu.edu/filmandtheatre/docs/RTVF-Course-Descriptions-Spring-2022.pdf" target="_blank" rel="nofollow noopener">Dept. course PDF</a></td>
          </tr>
          <tr>
            <td>GEOG 112 — Global Geography (check catalog year)</td>
            <td>Upper-division GE (varies by catalog)</td>
            <td>Contemporary global issues; readings + discussion format</td>
            <td>Short responses or journals, discussion activities</td>
            <td><a href="https://www.sjsu.edu/classes/schedules/" target="_blank" rel="nofollow noopener">Class Schedule</a></td>
          </tr>
          <tr>
            <td>KIN 68 — Sports and Popular Culture</td>
            <td>Area C (topic varies by catalog)</td>
            <td>Media/culture analysis around sport</td>
            <td>Analysis assignments, short writing</td>
            <td><a href="https://catalog.sjsu.edu/" target="_blank" rel="nofollow noopener">Catalog</a></td>
          </tr>
          <tr>
            <td>ENGL 71 — Introduction to Creative Writing</td>
            <td>Area C (often)</td>
            <td>Creative process focus; different assessment style</td>
            <td>Creative drafts, workshops, reflections</td>
            <td><a href="https://catalog.sjsu.edu/" target="_blank" rel="nofollow noopener">Catalog</a></td>
          </tr>
          <tr>
            <td>TA 10 — Theatre Appreciation</td>
            <td>Area C</td>
            <td>Art appreciation & history; emphasis on understanding the medium</td>
            <td>Readings, reflections; potential performance attendance</td>
            <td><a href="https://catalog.sjsu.edu/" target="_blank" rel="nofollow noopener">Catalog</a></td>
          </tr>
        </tbody>
      </table>

      <h2>How to check remaining GE in MySJSU</h2>
      <p>
        Log into MySJSU and open <strong>MyProgress</strong> (Academic Requirements). The audit marks GE areas as
        complete, in-progress, or still needed. Use <strong>MyPlanner</strong> to map future terms with a drag-and-drop view
        based on the same data. This keeps your plan aligned with your catalog year.
      </p>

      <h2>How to use the catalog/schedule filters</h2>
      <p>
        With your needed GE areas in hand, visit the official <strong>Class Schedule</strong> and use the
        <em> GE Area</em> filter to narrow results instantly. Always double-check the GE tag on the exact section before enrolling and
        verify in the <strong>Catalog</strong> when needed.
      </p>

      <h2>How to balance light vs heavy workload</h2>
      <p>
        Pair one “approachable” GE with demanding major courses (labs, capstones, etc.). Read the official course description and—if available—the
        syllabus to understand workload and assessment style. Avoid stacking multiple writing-heavy or lab-heavy courses in one term.
      </p>

      <h2>Transfer/AP/IB caveats</h2>
      <p>
        Ensure external credits (community college, AP/IB) have posted correctly to your record. Unit limits and application to GE areas can vary by
        policy and catalog year. When in doubt, consult the Registrar and your Student Success Center.
      </p>

      <h2>Local/Geo guidance</h2>
      <p>
        SJSU sits in downtown San José, with Student Success Centers, arts venues, and resources within walking distance. Use these supports to
        fine-tune your plan and workload balance.
      </p>

      <h2>Internal links</h2>
      <ul>
        <li><a href="/guides/sjsu-easiest-classes">Easiest Classes at SJSU</a></li>
        <li><a href="/faq/sjsu">SJSU FAQ</a></li>
        <li><a href="/sjsu">SJSU Tracker</a></li>
      </ul>

      <h2>Sources</h2>
      <ol>
        <li><a href="https://one.sjsu.edu/task/all/myprogress" target="_blank" rel="nofollow noopener">MyProgress (MySJSU)</a></li>
        <li><a href="https://catalog.sjsu.edu/" target="_blank" rel="nofollow noopener">SJSU Academic Catalog</a></li>
        <li><a href="https://www.sjsu.edu/classes/schedules/" target="_blank" rel="nofollow noopener">SJSU Class Schedules</a></li>
        <li><a href="https://www.sjsu.edu/general-education/" target="_blank" rel="nofollow noopener">SJSU General Education</a></li>
        <li><a href="https://www.sjsu.edu/general-education/students/which-ge/fall25-and-beyond.php" target="_blank" rel="nofollow noopener">GE: Fall 2025 and beyond</a></li>
      </ol>
    </main>
  );
}

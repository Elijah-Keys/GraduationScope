import React from "react";

export default function BlogPickBerkeleyBreadthFast() {
  const UPDATED = "2025-08-25";
  const CANONICAL = "https://www.graduationscope.com/blog/pick-berkeley-breadth-fast";

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "How to pick UC Berkeley breadth courses in 10 minutes",
    datePublished: "2025-08-25",
    dateModified: UPDATED,
    author: { "@type": "Organization", name: "GraduationScope" },
    publisher: {
      "@type": "Organization",
      name: "GraduationScope",
      logo: { "@type": "ImageObject", url: "https://www.graduationscope.com/graduation-scope-logo.png" }
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": CANONICAL }
  };

  return (
    <main className="post-wrap">
      {/* React 19 hoists these into <head> */}
      <title>How to Pick UC Berkeley Breadth Courses in 10 Minutes | GraduationScope</title>
      <meta
        name="description"
        content="Find Berkeley breadth courses fast: check your degree progress, use the Class Schedule’s Breadth filter, balance workload, and verify tags. TL;DR, table, sources."
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

      <h1 className="post-h1">How to Pick UC Berkeley Breadth Courses in 10 Minutes</h1>
      <p className="muted">Updated on {UPDATED}</p>

      <section className="tldr">
        <strong>TL;DR</strong>
        <ul>
          <li>Check your degree progress tools to see which Breadth groups you still need.</li>
          <li>Use the Berkeley Class Schedule and its <em>Breadth Requirements</em> filter.</li>
          <li>Balance one “approachable” breadth with heavier major courses.</li>
          <li>Confirm the breadth tag on the exact section before enrolling.</li>
        </ul>
      </section>

      <h2>Answer Capsule</h2>
      <div className="capsule">
        <p>
          First, review your remaining breadth requirements using the university’s degree progress tools so you know exactly
          which groups are open. Then search the official <strong>Berkeley Class Schedule</strong> and apply the{" "}
          <em>Breadth Requirements</em> filter to list all approved options for a given group. Cross-check with the <strong>L&S
          Seven-Course Breadth</strong> overview and the Academic Guide to understand group definitions and any college-specific
          policies. Pick a section that fits your days/times, and confirm the breadth tag is present for the exact section you
          plan to take. Pair one “approachable” breadth with heavier major work to keep the term balanced.
        </p>
      </div>

      <h2>Quotable Table (examples)</h2>
      <p className="muted">Instructor, college rules, and term offerings vary. Verify breadth tags in the Schedule each term.</p>
      <table>
        <thead>
          <tr>
            <th>Course</th>
            <th>Breadth group</th>
            <th>Why it may feel approachable</th>
            <th>Typical work</th>
            <th>Official link</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>PSYCH 1 — General Psychology</td>
            <td>Social & Behavioral Sciences</td>
            <td>Intro survey with clear topic structure</td>
            <td>Quizzes/exams, short reflections</td>
            <td><a href="https://classes.berkeley.edu/search/class/?q=PSYCH%201" target="_blank" rel="nofollow noopener">Class Schedule</a></td>
          </tr>
          <tr>
            <td>ESPM 50AC — Culture & Natural Resource Management</td>
            <td>American Cultures + (varies) HS/PV/SBS</td>
            <td>Conceptual framing; guided discussion</td>
            <td>Readings, posts, midterm/final (varies)</td>
            <td><a href="https://classes.berkeley.edu/search/class/?q=ESPM%2050AC" target="_blank" rel="nofollow noopener">Class Schedule</a></td>
          </tr>
          <tr>
            <td>GEOG 4 — World Peoples & Cultural Environments</td>
            <td>International Studies or Social & Behavioral Sciences</td>
            <td>Thematic overview; case-study style</td>
            <td>Short responses, map/reading quizzes</td>
            <td><a href="https://classes.berkeley.edu/search/class/?q=GEOG%204" target="_blank" rel="nofollow noopener">Class Schedule</a></td>
          </tr>
          <tr>
            <td>THEATER 10 — Fundamentals of Acting (check breadth)</td>
            <td>Arts & Literature (varies)</td>
            <td>Practice-based with structured assignments</td>
            <td>Scenes, reflections, participation</td>
            <td><a href="https://classes.berkeley.edu/search/class/?q=THEATER%2010" target="_blank" rel="nofollow noopener">Class Schedule</a></td>
          </tr>
          <tr>
            <td>GEOG 20 — Globalization (check breadth)</td>
            <td>Social & Behavioral Sciences (varies)</td>
            <td>Contemporary topics; accessible readings</td>
            <td>Short essays, discussion</td>
            <td><a href="https://classes.berkeley.edu/search/class/?q=GEOG%2020" target="_blank" rel="nofollow noopener">Class Schedule</a></td>
          </tr>
        </tbody>
      </table>

      <h2>How to check remaining breadth</h2>
      <p>Use your degree progress tools to list open breadth groups; confirm your college’s policies and catalog year.</p>

      <h2>How to use the Schedule filters</h2>
      <p>Open the Class Schedule, select term, apply <em>Breadth Requirements</em>, then refine by days/times. Confirm tags on the section.</p>

      <h2>Balance light vs heavy</h2>
      <p>Pair one “approachable” breadth with major work (labs, design, capstones). Review the syllabus when available.</p>

      <h2>Internal links</h2>
      <ul>
        <li><a href="/guides/berkeley-easiest-classes">Berkeley: Easier Breadth (guide)</a></li>
        <li><a href="/faq/berkeley">Berkeley FAQ</a></li>
        <li><a href="/berkeley">Berkeley Tracker</a></li>
      </ul>

      <h2>Sources</h2>
      <ol>
        <li><a href="https://lsadvising.berkeley.edu/seven-course-breadth" target="_blank" rel="nofollow noopener">L&S Seven-Course Breadth</a></li>
        <li><a href="https://classes.berkeley.edu/" target="_blank" rel="nofollow noopener">Berkeley Class Schedule</a></li>
        <li><a href="https://guide.berkeley.edu/" target="_blank" rel="nofollow noopener">Berkeley Academic Guide</a></li>
      </ol>
    </main>
  );
}

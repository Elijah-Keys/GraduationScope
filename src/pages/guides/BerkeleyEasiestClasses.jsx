import React, { useMemo } from "react";

export default function BerkeleyLighterBreadth() {
  const UPDATED = "2025-08-25"; // bump when you change content

  // Table rows: examples students often consider approachable (varies by instructor/term)
  const rows = useMemo(
    () => [
      {
        course: "PSYCH 1 — General Psychology",
        group: "Social & Behavioral Sciences",
        why: "Intro survey; clear topic structure in many sections",
        work: "Quizzes/exams, short reflections",
        link: "https://classes.berkeley.edu/search/class/?q=PSYCH%201"
      },
      {
        course: "ESPM 50AC — Culture & Natural Resource Management",
        group: "American Cultures + (varies) HS / PV / SBS",
        why: "Conceptual framing; readings with guided discussion",
        work: "Readings, posts, midterm/final (varies)",
        link: "https://classes.berkeley.edu/search/class/?q=ESPM%2050AC"
      },
      {
        course: "GEOG 4 — World Peoples & Cultural Environments",
        group: "International Studies or Social & Behavioral Sciences",
        why: "Thematic overview; case-study style",
        work: "Short responses, map/reading quizzes",
        link: "https://classes.berkeley.edu/search/class/?q=GEOG%204"
      }
    ],
    []
  );

  // Article schema (helps machines understand author + freshness)
  const articleLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "UC Berkeley lighter breadth picks",
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
        "@id": "https://www.graduationscope.com/guides/berkeley-lighter-breadth"
      }
    }),
    [UPDATED]
  );

  return (
    <main className="guide-wrap">
      {/* React 19 hoists these to <head> */}
      <title>UC Berkeley lighter breadth picks | GraduationScope</title>
      <meta
        name="description"
        content="Approachable breadth options at UC Berkeley, how to filter by breadth in the Class Schedule, and planning tips. Includes official links."
      />
      <link rel="canonical" href="https://www.graduationscope.com/guides/berkeley-lighter-breadth" />
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

      <h1 className="guide-h1">UC Berkeley lighter breadth picks</h1>
      <p className="muted">Updated on {UPDATED}</p>

      <section className="tldr">
        <h2>TLDR</h2>
        <ul>
          <li>Complete one approved course in each of the seven L&amp;S breadth groups</li>
          <li>Use the Class Schedule’s “Breadth Requirements” filter to see current options</li>
          <li>Balance one “approachable” breadth with heavier major courses</li>
          <li>Always confirm a section still carries the intended breadth tag before enrolling</li>
        </ul>
      </section>

      <h2>Examples students often find approachable</h2>
      <p className="muted">Instructor/style matters. Verify breadth tags and sections for your term.</p>

      <table>
        <thead>
          <tr>
            <th>Course example</th>
            <th>Breadth group</th>
            <th>Why it may feel approachable</th>
            <th>Typical work</th>
            <th>Official link</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.course}</td>
              <td>{r.group}</td>
              <td>{r.why}</td>
              <td>{r.work}</td>
              <td><a href={r.link} target="_blank" rel="nofollow noopener">Catalog / Schedule</a></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>How to filter by breadth</h2>
      <p className="notes">
        In the Berkeley Class Schedule, select your term and use the <em>Breadth Requirements</em> filter to see all
        approved options for a group (e.g., Social and Behavioral Sciences). Confirm the breadth tag on the section you plan to enroll in.
      </p>

      <h2>Sources</h2>
      <ul className="sources">
        <li><a href="https://lsadvising.berkeley.edu/seven-course-breadth" target="_blank" rel="nofollow noopener">Seven-Course Breadth (L&amp;S Advising)</a></li>
        <li><a href="https://classes.berkeley.edu/" target="_blank" rel="nofollow noopener">Berkeley Class Schedule</a></li>
        <li><a href="https://registrar.berkeley.edu/catalog/" target="_blank" rel="nofollow noopener">Berkeley Catalog</a></li>
      </ul>
    </main>
  );
}

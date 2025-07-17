import React, { useState } from "react";
import { TOPIC_TO_CLASSES } from "./Topic_To_Classes";

// ==========================
// DATA ARRAYS
// ==========================
const ACADEMIC_AREAS = [
  { id: "science", label: "Science 🧪" },
  { id: "business", label: "Business & Economics 📊" },
  { id: "social", label: "Social Sciences 🧑‍🎓" },
  { id: "health", label: "Health ⛑️" },
  { id: "education", label: "Education 📚" },
  { id: "engineering", label: "Engineering 🏗️" },
  { id: "math", label: "Mathematics ➕" },
  { id: "language", label: "Languages & Linguistics 🗣️" },
  { id: "environment", label: "Environmental Studies 🌴" },
  { id: "communication", label: "Communication & Media 📱" },
  { id: "law", label: "Law & Policy 🧑‍⚖️" },
  { id: "history", label: "History & Culture 🌎" },
  { id: "philosophy", label: "Philosophy & Ethics 🔮" },
  { id: "computer", label: "Computer Science 💻" },
  { id: "psychology", label: "Psychology 🧠" },
  { id: "politics", label: "Politics & Government 🏛️" },
  { id: "art_design", label: "Art 🎨" },
  { id: "music", label: "Music 🎶" },
  { id: "sports", label: "Sports 🏀" },
];

const STUDENT_GOALS = [
  { id: "easy", label: "Easiest Classes ✅" },
  { id: "major", label: "Major Oriented 🧘" },
  { id: "professor", label: "Top Professors 🥇" },
  { id: "short", label: "Short Classes ⏱️" },
];

// ==========================
// UTILITY FUNCTIONS
// ==========================
function getEvenPyramidRows(array, rowCount = 4) {
  const rows = Array.from({ length: rowCount }, () => []);
  let i = 0;
  for (const item of array) {
    rows[i % rowCount].push(item);
    i++;
  }
  rows.sort((a, b) => a.length - b.length);
  return rows;
}



const CARD_WIDTH = 155;
const CARD_HEIGHT = 38;
const CARD_STYLE = {
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 10,
  fontWeight: 500,
  textAlign: "center",
  transition: "all 0.14s",
  userSelect: "none",
  fontSize: "1em",
  letterSpacing: "-0.01em",
  lineHeight: 1.15,
  whiteSpace: "normal",
  overflowWrap: "break-word",
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  cursor: "pointer",
  padding: 0,
  margin: 0,
};

function shuffle(array, seed) {
  // Simple seeded shuffle for reproducibility on refresh
  let m = array.length, t, i;
  let s = seed || Math.random();
  while (m) {
    i = Math.floor(Math.abs(Math.sin(s++) * 10000) % m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

// ==========================
// RECOMMENDATION ALGORITHM (Grok 4 Super Heavy)
// ==========================
function recommendClasses({
  classDetails,
  geRequirements,
  selectedAreas,
  selectedGoals,
  numClasses,
  refreshKey,
}) {
  // Build area->set of class names for GE rules
  const areaToClasses = {};
  geRequirements.forEach(areaObj => {
    areaToClasses[areaObj.area] = new Set(areaObj.classes);
  });

  // Helper: find area(s) for a class
  function getAreasForClass(className) {
    return Object.entries(areaToClasses)
      .filter(([area, classSet]) => classSet.has(className))
      .map(([area]) => area);
  }

  // Build topicClassSet from mapping and selectedAreas
  const topicClassSet = new Set();
  selectedAreas.forEach(topic => {
    const classList = TOPIC_TO_CLASSES && TOPIC_TO_CLASSES[topic];
    if (Array.isArray(classList)) {
      classList.forEach(clsName => topicClassSet.add(clsName));
    }
  });

  // Score each class
  const scored = classDetails.map(cls => {
    // 1 if this class is in any selected topic, 0 otherwise
    const topicScore = topicClassSet.has(cls.className) ? 1 : 0;
    let goalScore = 0;
    if (cls.goals) {
      goalScore = selectedGoals.filter(goal => cls.goals.includes(goal)).length;
    }
    const matchScore = topicScore * 2 + goalScore * 1; // Topics weighted more
    const matchedAreas = getAreasForClass(cls.className);
    return { ...cls, matchScore, matchedAreas };
  });

  // Sort and shuffle among top matches for refreshability
  scored.sort((a, b) => b.matchScore - a.matchScore);
  const topScore = scored.length > 0 ? scored[0].matchScore : 0;
  const topClasses = scored.filter(cls => Math.abs(cls.matchScore - topScore) < 0.2);
  shuffle(topClasses, refreshKey);
  const rest = scored.filter(cls => Math.abs(cls.matchScore - topScore) >= 0.2);
  const randomized = [...topClasses, ...rest];

  // Area rules (D, C1/C2, etc.)
  let usedC1 = 0, usedC2 = 0, usedD = 0;
  const usedOther = {};
  const recommendations = [];
  for (const cls of randomized) {
    const areas = cls.matchedAreas;
    let canAdd = false;
    if (areas.includes("D. Social Sciences")) {
      if (usedD < 2) {
        canAdd = true;
        usedD += 1;
      }
    } else if (areas.includes("C1 Arts") || areas.includes("C2 Humanities")) {
      const isC1 = areas.includes("C1 Arts");
      const isC2 = areas.includes("C2 Humanities");
      if ((usedC1 + usedC2) < 3) {
        if (isC1 && usedC1 < 2) {
          canAdd = true;
          usedC1 += 1;
        } else if (isC2 && usedC2 < 2) {
          canAdd = true;
          usedC2 += 1;
        }
      }
    } else {
      const area = areas.find(a =>
        !["D. Social Sciences", "C1 Arts", "C2 Humanities"].includes(a)
      );
      if (area && !usedOther[area]) {
        canAdd = true;
        usedOther[area] = true;
      }
    }
    if (canAdd && !recommendations.some(r => r.className === cls.className)) {
      recommendations.push(cls);
    }
    if (recommendations.length >= numClasses) break;
  }
  // Area C1/C2: ensure at least 1 from each if possible
  if ((usedC1 + usedC2) > 1 && (usedC1 === 0 || usedC2 === 0)) {
    const wantC1 = usedC1 === 0;
    const wantC2 = usedC2 === 0;
    const swapIdx = recommendations.findIndex(
      r => r.matchedAreas.includes("C1 Arts") || r.matchedAreas.includes("C2 Humanities")
    );
    const candidate = randomized.find(
      cls =>
        (wantC1 && cls.matchedAreas.includes("C1 Arts")) ||
        (wantC2 && cls.matchedAreas.includes("C2 Humanities"))
    );
    if (swapIdx !== -1 && candidate) {
      recommendations[swapIdx] = candidate;
    }
  }
  return recommendations;
}

// ==========================
// MAIN COMPONENT
// ==========================
export default function ClassRecommendationPage({ geRequirements, classDetails }) {
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [dropdownValue, setDropdownValue] = useState(3);
  const [recommendations, setRecommendations] = useState([]);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const areaRows = getEvenPyramidRows(ACADEMIC_AREAS, 4);

  // Toggle for areas/goals
  const toggle = (id, type) => {
    if (type === "area") {
      setSelectedAreas((prev) =>
        prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
      );
    } else {
      setSelectedGoals((prev) =>
        prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
      );
    }
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    // Debug log
    // console.log("Get Recommendations clicked", { selectedAreas, selectedGoals });
    const recs = recommendClasses({
      classDetails,
      geRequirements,
      selectedAreas,
      selectedGoals,
      numClasses: dropdownValue,
      refreshKey,
    });
    setRecommendations(recs);
  };

  // Refresh handler
  const handleRefresh = () => {
    const newKey = Date.now();
    setRefreshKey(newKey);
    const recs = recommendClasses({
      classDetails,
      geRequirements,
      selectedAreas,
      selectedGoals,
      numClasses: dropdownValue,
      refreshKey: newKey,
    });
    setRecommendations(recs);
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "0 10px",
        position: "relative",
      }}
    >
      <div style={{ height: 100 }} />

      {/* Dropdown Menu */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 26 }}>
        <span style={{ fontWeight: 600, fontSize: "1.2em", marginRight: 10 }}>
          I want
        </span>
        <select
          value={dropdownValue}
          onChange={e => setDropdownValue(Number(e.target.value))}
          style={{
            fontSize: "1.1em",
            padding: "6px 20px 6px 10px",
            borderRadius: 7,
            border: "1.5px solid #bbb",
            marginRight: 10,
            fontWeight: 500,
            background: "#f8f8fa",
            cursor: "pointer",
            outline: "none",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
          }}
        >
          {[1, 2, 3, 4, 5, 6].map(n => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span style={{ fontWeight: 600, fontSize: "1.2em" }}>
          classes recommended.
        </span>
      </div>

      {/* Academic Areas Section */}
      <div style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontWeight: 700,
            marginBottom: 6,
            textAlign: "left",
            fontSize: "1.45em",
            letterSpacing: "-0.01em",
          }}
        >
          Academic Areas
        </h2>
        <p
          style={{
            color: "#555",
            marginBottom: 20,
            textAlign: "left",
            maxWidth: 600,
            fontSize: "1.01em",
          }}
        >
          Select the subject areas or types of classes you’re interested in.
        </p>
        <div>
          {areaRows.map((row, rowIdx) => (
            <div
              key={`area-row-${rowIdx}`}
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              {row.map((area) => (
                <div
                  key={area.id}
                  onClick={() => toggle(area.id, "area")}
                  style={{
                    ...CARD_STYLE,
                    background: selectedAreas.includes(area.id)
                      ? "#1976d2"
                      : "#f3f3f3",
                    color: selectedAreas.includes(area.id) ? "#fff" : "#222",
                    border: selectedAreas.includes(area.id)
                      ? "2px solid #1976d2"
                      : "2px solid transparent",
                  }}
                >
                  {area.label}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Student Goals Section */}
      <div style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontWeight: 700,
            marginBottom: 14,
            textAlign: "left",
            fontSize: "1.45em",
            letterSpacing: "-0.01em",
          }}
        >
          Student Goals
        </h2>
        <div>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            marginBottom: 10,
          }}>
            {STUDENT_GOALS.map((goal) => (
              <div
                key={goal.id}
                onClick={() => toggle(goal.id, "goal")}
                style={{
                  ...CARD_STYLE,
                  background: selectedGoals.includes(goal.id)
                    ? "#388e3c"
                    : "#f3f3f3",
                  color: selectedGoals.includes(goal.id) ? "#fff" : "#222",
                  border: selectedGoals.includes(goal.id)
                    ? "2px solid #388e3c"
                    : "2px solid transparent",
                }}
              >
                {goal.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit and Refresh Buttons */}
      <div style={{ textAlign: "center" }}>
        <button
          type="submit"
          style={{
            padding: "10px 28px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: "1.05em",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.09)",
            opacity:
              selectedAreas.length === 0 && selectedGoals.length === 0
                ? 0.6
                : 1,
            marginTop: 6,
            marginRight: 10,
          }}
          disabled={selectedAreas.length === 0 && selectedGoals.length === 0}
          onClick={handleSubmit}
        >
          Get Recommendations
        </button>
        {recommendations.length > 0 && (
          <button
            type="button"
            style={{
              padding: "10px 28px",
              background: "#388e3c",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              fontSize: "1.05em",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.09)",
              marginTop: 6,
              marginLeft: 10,
            }}
            onClick={handleRefresh}
          >
            Refresh Recommendations
          </button>
        )}
      </div>
      <div style={{ height: 36 }} />

      {/* Recommendations Table */}
      {recommendations.length > 0 && (
           <div className="rec-results-mobile-padding">
        <div style={{ marginTop: 36 }}>
          <h3 style={{ textAlign: "left", fontWeight: 600, marginBottom: 10 }}>
            Recommended Classes
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f3f3" }}>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Class</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Professor</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>RMP Score</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Difficulty</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Schedule</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Link</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((cls, idx) => (
                <tr key={cls.className + cls.professor + idx}>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>{cls.className}</td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>{cls.professor}</td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {cls.score !== undefined ? cls.score : "N/A"}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {cls.difficulty !== undefined ? cls.difficulty : "N/A"}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {cls.schedule && cls.schedule.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {cls.link && cls.link !== "N/A" ? (
                      <a href={cls.link} target="_blank" rel="noopener noreferrer">RMP</a>
                    ) : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
    <style>
  {`
    @media (max-width: 600px) {
      .rec-results-mobile-padding {
        padding: 38px 6vw 15px 6vw !important;
        /* Top padding: 38px (pushed down: 10px more than before)
           Bottom padding: 15px white space under the table */
      }
      .rec-table-mobile {
        margin-top: 18px !important;
        margin-bottom: 0 !important;
      }
    }
  `}</style>
  </div>)}

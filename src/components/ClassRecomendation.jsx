import React, { useState } from "react";
import { TOPIC_TO_CLASSES } from "./Topic_To_Classes";
import "./ClassRecomendation.css";
import "../pages/GETracker.css";
import { FiSearch } from "react-icons/fi";
import { PiMedal } from "react-icons/pi";
import { BsStars } from "react-icons/bs";
import { HiOutlineAcademicCap } from "react-icons/hi2";
import { GoGoal } from "react-icons/go";

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
];

// ==========================
// MAIN COMPONENT
// ==========================
 const brandBlue = "#7589F3";
 const thStyle = {
  padding: "14px 16px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: "1rem",
  color: "#333",
  backgroundColor: "#F9FAFC",
  border: "1px solid #E0E0E0", // border around each header cell
};

const tdStyle = {
  padding: "14px 16px",
  textAlign: "left",
  fontSize: "0.95rem",
  verticalAlign: "top",
  border: "1px solid #E0E0E0", // border around each data cell
};


export default function ClassRecommendationPage({ geRequirements, classDetails, onDeleteClass, }) {
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [dropdownValue, setDropdownValue] = useState(3);
  const [recommendations, setRecommendations] = useState([]);
  const [refreshKey, setRefreshKey] = useState(Date.now());
const isMobile = window.innerWidth <= 700;
const areaRows = isMobile
  ? getEvenPyramidRows(ACADEMIC_AREAS, 19) // 2 per row on mobile (18 total/9 rows)
  : getEvenPyramidRows(ACADEMIC_AREAS, 4); // 4 per row on desktop


const [search, setSearch] = useState("");
const [classesTaken, setClassesTaken] = useState([
  // ... optionally, hydrating from localStorage or your context!
]);
const handleAddClass = (className, area) => {
  if (!classesTaken.some(obj => obj.className === className && obj.area === area)) {
    setClassesTaken([...classesTaken, { className, area }]);
    setSearch("");
  }
};
const handleRemoveClass = (className, area) => {
  setClassesTaken(classesTaken.filter(
    obj => !(obj.className === className && obj.area === area)
  ));
};
const searchResults = (search.trim().length > 0 && classDetails)
  ? Array.from(
      new Map(
        classDetails
          .filter(cls =>
            cls.className &&
            cls.className.toLowerCase().includes(search.trim().toLowerCase()) &&
            !classesTaken.some(taken => taken.className === cls.className)
          )
          .map(cls => [cls.className, {
            className: cls.className,
            area: (cls.areas && cls.areas[0]) || "Other"
          }])
      ).values()
    )
  : [];


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
  classesTaken
}) {
  console.log("classDetails", classDetails);
  console.log("geRequirements", geRequirements);
  console.log("classesTaken", classesTaken);
  // ...rest of code


  // Compute fulfilled areas
  const classesTakenNames = new Set(classesTaken.map(cls => cls.className));
  const areasTaken = new Set(classesTaken.map(cls => cls.area));

  // For each area, get possible classes
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

  // Score each class, filtering out already-taken classes and fulfilled areas
  const scored = classDetails
    .filter(cls => {
      // 1. Not already taken
      if (classesTakenNames.has(cls.className)) return false;
      // 2. Get area(s) for this class
      const areas = getAreasForClass(cls.className);
      // 3. Does any unfulfilled area remain?
      if (!areas.some(area => !areasTaken.has(area))) return false;
      return true;
    })
    .map(cls => {
      // 1 if this class is in any selected topic, 0 otherwise
      const topicScore = topicClassSet.has(cls.className) ? 1 : 0;
      let goalScore = 0;
      if (cls.goals) {
        goalScore = selectedGoals.filter(goal => cls.goals.includes(goal)).length;
      }
      const matchScore = topicScore * 2 + goalScore * 1;
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

  // Keep track of how many per area, skip areas that are fulfilled
  let usedArea = {};
  const recommendations = [];
  for (const cls of randomized) {
    const unfulfilledForClass = cls.matchedAreas.filter(area => !areasTaken.has(area));
    if (unfulfilledForClass.length === 0) continue; // All areas satisfied

    // (You can expand the logic for area-specific limits as needed, using unfulfilledForClass[0] etc.)
    const area = unfulfilledForClass[0];
    if (!usedArea[area]) usedArea[area] = 0;

    // For C1/C2/D, you might want custom limits STILL, but for now let's just do 1 per area remaining.
    if (usedArea[area] < 1) {
      usedArea[area] += 1;
      recommendations.push(cls);
    }
    if (recommendations.length >= numClasses) break;
  }

  return recommendations;
}

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
      classesTaken
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
      classesTaken
    });
    setRecommendations(recs);
  };
// Example state





return (
  <>
  <div>
    {/* Title: add enough margin to clear the header */}
   <div
  style={{
    margin: isMobile ? "90px auto 12px auto" : "110px auto 12px auto",
    width: "100%",
    textAlign: "center",
    padding: isMobile ? "0 16px" : 0,
    boxSizing: "border-box",
  }}
>
  <h1
    style={{
      fontSize: isMobile ? "2.2rem" : "2.8rem",
      fontWeight: 700,
      color: "#1F2A37",
      marginBottom: 8,
       marginTop: isMobile ? 100 : 0, // ✅ mobile-only push-down
    }}
  >
    Smart Class Recommendations San Jose
  </h1>
  <p
    style={{
      textAlign: "center",
      color: "#6B7280",
      fontSize: "1.1rem",
      maxWidth: 640,
      margin: "0 auto 32px auto",
    }}
  >
    Get personalized course suggestions based on your interests, goals, and academic progress
  </p>
</div>


  <>
   {/* Search Bar Container */}
<div
  style={{
    backgroundColor: "#fff",
    padding: "20px 24px",
    borderRadius: 20,
    boxShadow: "0 6px 18px rgba(58, 96, 255, 0.1)",
    margin: isMobile ? "0 auto 32px auto" : "32px auto 0 auto",
    width: isMobile ? "92vw" : 1200,
    maxWidth: isMobile ? "92vw" : "100%",
    position: "relative",
    userSelect: "none",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
  }}
>
  <input
    type="text"
    placeholder="Search for a class you have already taken, or plan to take."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    aria-label="Search for classes"
    style={{
      width: isMobile ? "88vw" : 1150,
      padding: isMobile ? "10px 10px 10px 38px" : "12px 16px 12px 48px",
      fontSize: isMobile ? "0.85rem" : "1rem",
      borderRadius: 20,
      border: "1.8px solid #bbb",
      boxShadow: "0 2px 5px rgba(58, 96, 255, 0.15)",
      outline: "none",
      userSelect: "text",
      boxSizing: "border-box",
    }}
    onFocus={(e) => (e.target.style.borderColor = brandBlue)}
    onBlur={(e) => (e.target.style.borderColor = "#bbb")}
  />

  <FiSearch
    style={{
      position: "absolute",
      left: isMobile ? 32 : 35,
      top: "50%",
      transform: "translateY(-50%)",
      color: "#999",
      pointerEvents: "none",
      fontSize: isMobile ? 18 : 20,
      userSelect: "none",
    }}
    aria-hidden="true"
  />

  {Array.isArray(searchResults) && searchResults.length > 0 && (
    <ul
      className="ge-search-results"
      style={{
        listStyle: "none",
        margin: 0,
        padding: 8,
        border: "1.8px solid #bbb",
        borderTop: "none",
        maxHeight: 220,
        overflowY: "auto",
        backgroundColor: "#fff",
        position: "absolute",
        width: "100%",
        zIndex: 10,
        borderRadius: "0 0 20px 20px",
        boxShadow: "0 8px 16px rgba(58, 96, 255, 0.2)",
        top: "calc(100% + 4px)",
        left: 0,
        userSelect: "none",
      }}
    >
      {searchResults.map((obj) => (
        <li
          key={obj.className}
          style={{
            padding: "10px 12px",
            cursor: "pointer",
            borderBottom: "1px solid #eee",
            fontWeight: "600",
            color: "#222",
            userSelect: "none",
          }}
          onClick={() => handleAddClass(obj.className, obj.area)}
          onMouseDown={(e) => e.preventDefault()}
        >
          <strong>{obj.className}</strong>{" "}
          <span style={{ color: "#666" }}>({obj.area})</span>
        </li>
      ))}
    </ul>
  )}
</div>

{/* Classes Taken Container */}
<div
  style={{
    width: isMobile ? "92vw" : 1200,
    margin: isMobile ? "0 auto 32px auto" : "32px auto 0",
    backgroundColor: "#fff",
    padding: "20px 24px",
    borderRadius: 20,
    boxShadow: "0 6px 18px rgba(58, 96, 255, 0.1)",
    boxSizing: "border-box",
    userSelect: "text",
  }}
>
  <h2 className="ge-section-title">Classes Taken</h2>

  <ul
    className="ge-classes-taken-list"
    style={{
      padding: 0,
      margin: 0,
      listStyle: "none",
      fontSize: "1rem",
      lineHeight: 1.4,
      color: "#222",
    }}
  >
    {classesTaken.length === 0 ? (
      <li style={{ color: "#aaa", fontStyle: "italic" }}>No classes taken yet.</li>
    ) : (
      classesTaken.map((obj) => (
        <li
          key={obj.className + obj.area}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "6px 0",
            borderBottom: "1px solid #eee",
          }}
        >
          <div>
            <strong>{obj.className}</strong>{" "}
            <span style={{ color: "#555" }}>({obj.area})</span>
          </div>
          <button
           onClick={() => handleRemoveClass(obj.className, obj.area)}
            style={{
              backgroundColor: "#d32f2f",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "6px 14px",
              cursor: "pointer",
              fontWeight: 600,
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a12121")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#d32f2f")}
            type="button"
            aria-label={`Delete ${obj.className} from classes taken`}
          >
            Delete
          </button>
        </li>
      ))
    )}
  </ul>
</div>

      










<div
  style={{
    width: isMobile ? "92vw" : 1250,
    maxWidth: "92vw",
    margin: isMobile ? "0 auto 32px auto" : "32px auto 0",
    userSelect: "text",
    textAlign: "left",
    backgroundColor: "#fff",
    padding: "20px 24px",
    borderRadius: 20,
    boxShadow: "0 6px 18px rgba(58, 96, 255, 0.1)",
    boxSizing: "border-box",
  }}
>

<h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
  <HiOutlineAcademicCap size={24} color="#7589F3" />
  Academic Areas
</h2>


  <p
    style={{
      color: "#555",
      marginBottom: 24,
      fontSize: "1em",
      maxWidth: 600,
    }}
  >
    Select the subjects you’re interested in
  </p>

  <div
    style={{
      display: "grid",
    gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(6, 1fr)",
      gap: 16,
    }}
  >
    {areaRows.flat().map((area) => (
      <div
        key={area.id}
        onClick={() => toggle(area.id, "area")}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "18px 8px",
          borderRadius: 12,
          cursor: "pointer",
          border: selectedAreas.includes(area.id)
            ? "2px solid #1976d2"
            : "1.5px solid #DADDE7",
          background: selectedAreas.includes(area.id) ? "#EDF4FD" : "#fff",
          boxShadow: "0 1px 5px rgba(0,0,0,0.04)",
          transition: "all 0.2s ease",
          fontSize: "1em",
          fontWeight: 500,
          userSelect: "none",
        }}
      >
        <div style={{ fontSize: "1.5em", marginBottom: 6 }}>{area.icon}</div>
        <div>{area.label}</div>
      </div>
    ))}
  </div>
</div>


<div
  style={{
    width: isMobile ? "92vw" : 1250,
    maxWidth: "92vw",
    margin: isMobile ? "0 auto 32px auto" : "32px auto 0",
    userSelect: "text",
    textAlign: "left",
    backgroundColor: "#fff",
    padding: "20px 24px",
    borderRadius: 20,
    boxShadow: "0 6px 18px rgba(58, 96, 255, 0.1)",
    boxSizing: "border-box",
  }}
>

<h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
  <GoGoal size={22} color="#7589F3" />
  Student Goals
</h2>



  <div
    style={{
      display: "grid",
    gridTemplateColumns: isMobile ? "repeat(1, 1fr)" : "repeat(4, 1fr)",
      gap: 20,
      marginTop: 20,
    }}
  >
    {STUDENT_GOALS.map((goal) => (
      <div
        key={goal.id}
        onClick={() => toggle(goal.id, "goal")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          borderRadius: 12,
          cursor: "pointer",
          border: selectedGoals.includes(goal.id)
            ? "2px solid #1976d2"
            : "1.5px solid #DADDE7",
          background: selectedGoals.includes(goal.id)
            ? "#E8F6EF"
            : "#fff",
          boxShadow: "0 1px 5px rgba(0,0,0,0.04)",
          transition: "all 0.2s ease",
          fontSize: "1em",
          fontWeight: 500,
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: "1.4em" }}>{goal.icon}</span>
        <span>{goal.label}</span>
      </div>
    ))}
  </div>
</div>




<div
  style={{
    background: "#fff",
    border: "1.5px solid #DADDE7",
    borderRadius: 16,
    padding: "24px 20px",
    width: isMobile ? "92vw" : 1250,
    maxWidth: "92vw",
    margin: isMobile ? "0 auto 32px auto" : "0 auto",
    marginTop: 40,
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
  }}
>

  <h3
    style={{
      fontSize: "1.1em",
      fontWeight: 600,
      marginBottom: 12,
      color: "#1A1A1A",
    }}
  >
    🎯 Recommendation Count
  </h3>

  <p
    style={{
      marginBottom: 12,
      fontSize: "0.95em",
      fontWeight: 500,
      color: "#4A4A4A",
    }}
  >
    Number of classes: <span style={{ color: "#1AA179", fontWeight: 600 }}>{dropdownValue}</span>
  </p>

  <input
    type="range"
    min={1}
    max={6}
    value={dropdownValue}
    onChange={(e) => setDropdownValue(Number(e.target.value))}
    style={{
      width: "100%",
      accentColor: "#F9C645",
      cursor: "pointer",
      marginBottom: 18,
    }}
  />

<button
  type="button"
  onClick={handleRefresh} // Always refresh recommendations
  style={{
    width: "100%",
    padding: "12px 0",
    backgroundColor: "#1AA179",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: "1.05em",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  }}
>
  Get Recommendations
</button>

</div>


  </>
<div
  style={{
    paddingBottom: isMobile ? 48 : 0, // adds mobile-only bottom spacing
  }}
>
<div
  style={{
    width: isMobile ? "92vw" : 1250,
    maxWidth: "92vw",
    margin: isMobile ? "0 auto 32px auto" : "32px auto 0",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: isMobile ? "20px 18px" : "28px 32px",
    boxShadow: "0 6px 18px rgba(58, 96, 255, 0.08)",
    boxSizing: "border-box",
    textAlign: "center",
  }}
>

  {/* Always show title and icon */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      justifyContent: "center",
      marginBottom: 20,
    }}
  >
    <PiMedal size={22} color="#EDC239" />
    <h3 style={{ fontSize: "1.12rem", fontWeight: 700, margin: 0 }}>
      Personalized Recommendations
    </h3>
  </div>

  {/* Conditional content: show either info or table */}
  {recommendations.length === 0 ? (
    <>
      {/* Centered Icon */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <BsStars size={72} color="#7589F3" />
      </div>

      {/* Headline + paragraph */}
      <div style={{ maxWidth: 500, margin: "0 auto", marginBottom: 24 }}>
        <h4 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 8, color: "#222" }}>
          Ready to Find Your Perfect Classes?
        </h4>
        <p style={{ fontSize: "0.95rem", color: "#444", margin: 0 }}>
          Select your academic interests and goals to receive personalized course recommendations tailored to your needs and preferences.
        </p>
      </div>

      {/* Feature bullets */}
      <ul
        style={{
          listStyle: "none",
          paddingLeft: 0,
          margin: 0,
          fontSize: "0.92rem",
          color: "#444",
          lineHeight: 1.7,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
           gap: isMobile ? 6 : 8,
        }}
      >
        <li>⚡ Instant recommendations</li>
        <li>⭐ Based on professor ratings</li>
        <li>🎯 Aligned to your graduation path</li>
      </ul>
    </>
  ) : (
    <>
      {/* Recommendations Table */}
      <div style={{ marginTop: 30 }}>
        <h3
          style={{
            textAlign: "left",
            fontWeight: 600,
            marginBottom: 18,
            fontSize: "1.32em",
          }}
        >
          Recommended Classes
        </h3>
<div
  style={{
    width: "100%",
    overflowX: isMobile ? "auto" : "visible", // horizontal scroll only on mobile
  }}
>
  <table
    style={{
      minWidth: isMobile ? 600 : "100%", // ensures table doesn't squish too much
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
      background: "#fff",
      border: "1.5px solid #E0E0E0",
      borderRadius: 10,
      overflow: "hidden",
      fontSize: "0.98rem",
      color: "#1A1A1A",
    }}
  >

  <thead style={{ backgroundColor: "#F5F7FA" }}>
    <tr>
      <th style={thStyle}>Class</th>
      <th style={thStyle}>Professor</th>
      <th style={thStyle}>RMP Score</th>
      <th style={thStyle}>Difficulty</th>
      {!isMobile && <th style={thStyle}>Schedule</th>}
      <th style={thStyle}>Link</th>
    </tr>
  </thead>
  <tbody>
    {recommendations.map((cls, idx) => (
      <tr key={cls.className + cls.professor + idx} style={{ borderBottom: "1px solid #EAEAEA" }}>
        <td style={tdStyle}>{cls.className}</td>
        <td style={tdStyle}>{cls.professor}</td>
        <td style={tdStyle}>{cls.score !== undefined ? cls.score : "N/A"}</td>
        <td style={tdStyle}>{cls.difficulty !== undefined ? cls.difficulty : "N/A"}</td>
        {!isMobile && (
          <td style={tdStyle}>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {cls.schedule && cls.schedule.length > 0
                ? cls.schedule.map((s, i) => <li key={i}>{s}</li>)
                : <li style={{ color: "#888" }}>Not listed</li>}
            </ul>
          </td>
        )}
        <td style={tdStyle}>
          {cls.link && cls.link !== "N/A" ? (
            <a
              href={cls.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1976d2", fontWeight: 500 }}
            >
              RMP
            </a>
          ) : (
            "N/A"
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>
</div>
</div>
</> 
)}
</div>
</div>
</div>
</>
  )}
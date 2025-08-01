import React, { useState } from "react";
import { ChicoTOPIC_TO_CLASSES } from "./ChicoTopic_To_Classes";
import "./ChicoClassRecommendation.css";
import "../pages/GETracker.css";
import { Link } from "react-router-dom";
import { IoIosHome } from "react-icons/io";  
import { IoIosArrowBack } from "react-icons/io";
import { FaCircleInfo } from "react-icons/fa6";



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

// ==========================
// MAIN COMPONENT
// ==========================
export default function ClassRecommendationPage({ geRequirements, classDetails,pageTitle }) {
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [dropdownValue, setDropdownValue] = useState(3);
  const [recommendations, setRecommendations] = useState([]);
  const safeRecommendations = React.useMemo(() => {
  return recommendations.map(cls => {
    let sched = cls.schedule;
    if (!Array.isArray(sched)) {
      if (typeof sched === "string" && sched.trim() !== "") {
        sched = [sched.trim()];
      } else {
        sched = [];
      }
    }
    return { ...cls, schedule: sched };
  });
}, [recommendations]);


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
  console.log("PageTitle prop:", pageTitle);
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
    const classList = ChicoTOPIC_TO_CLASSES && ChicoTOPIC_TO_CLASSES[topic];
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

 return recommendations.map(cls => ({
  ...cls,
  schedule: Array.isArray(cls.schedule)
    ? cls.schedule
    : typeof cls.schedule === "string" && cls.schedule.trim() !== ""
      ? [cls.schedule.trim()]
      : [],
}));
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
  <div>
    {/* Title: add enough margin to clear the header */}
    <div
      style={{
        margin: "110px auto 12px auto",      // <---- ADJUST THIS for header height!
        width: "fit-content"
      }}
    >
   <h1 className="ge-rectangle-titleab">Chico Class Recommendations</h1>


    </div>
    {/* Icon Bar: center and control its spacing below the title */}
    <div
      style={{
        margin: "0 auto 44px auto",          // <---- First number moves icon bar down
        width: "fit-content"
      }}
    >
      <div className="ge-title-iconbara" style={{ display: "flex", justifyContent: "center", gap: 16, padding: "10px 0" }}>
      <Link to="/" className="iconbar-link" aria-label="Home">
        <IoIosHome className="iconbar-icon" />
        <span>Home</span>
      </Link>
      <Link to="/chico" className="iconbar-link" aria-label="Back">
        <IoIosArrowBack className="iconbar-icon" />
        <span>Back</span>
      </Link>
      <Link to="/about" className="iconbar-link" aria-label="About">
        <FaCircleInfo className="iconbar-icon" />
        <span>About</span>
      </Link>
    </div>

{isMobile ? (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      padding: "0 10px", // some horizontal padding for small screens
      boxSizing: "border-box",
    }}
  >
    <div
      style={{
        width: "90vw",        // 90% viewport width on mobile
        maxWidth: 700,        // max width limit on larger phones/tablets
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,              // spacing between search and classes taken
      }}
    >
<div className="ge-search-section crp-search-section" style={{ textAlign: 'left' }}>
  <h2
    className="ge-classes-title"
    style={{
      display: 'inline-block',
      background: '#A7AABD',
      borderRadius: '22px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      fontSize: '1.35rem',
      fontWeight: 700,
      margin: '0 0 14px 0',
      padding: '10px 30px',
      color: '#000'
    }}
  >
    Find Classes
  </h2>
  <div
    className="ge-search-label"
    style={{
      textAlign: 'left',
      marginBottom: '12px'
    }}
  >
    Search for a class you have already taken, or plan to take.
  </div>
  


  <div style={{ position: 'relative', width: '100%' }}>
    <input
      type="text"
      placeholder="Search for a class..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="ge-search-input"
    />
  

    {/* Your search results list */}
    {Array.isArray(searchResults) && searchResults.length > 0 && (
      <ul
        className="ge-search-results"
        style={{
          listStyle: 'none',
          margin: 0,
          padding: '8px',
          border: '1px solid #ccc',
          borderTop: 'none',
          maxHeight: 200,
          overflowY: 'auto',
          background: '#fff',
          position: 'absolute',
          width: '100%',
          zIndex: 2,
        }}
      >
        {searchResults.map((obj) => (
          <li
            key={obj.className}
            style={{
              padding: '6px 0',
              cursor: 'pointer',
              borderBottom: '1px solid #eee',
            }}
            onClick={() => handleAddClass(obj.className, obj.area)}
          >
            <strong>{obj.className}</strong>{' '}
            <span style={{ color: '#717171' }}>({obj.area})</span>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>



      {/* Classes Taken Section */}
      <div className="ge-classes-taken-section crp-classes-taken" style={{ width: "100%" }}>
        <h2 className="ge-classes-title" style={{  marginBottom: 12 }}>
          Classes Taken
        </h2>
        <ul className="ge-classes-list" style={{ paddingLeft: 0, marginTop: 0 }}>
          {classesTaken.length === 0 ? (
            <li style={{ color: "#aaa", fontStyle: "italic", padding: "10px 0" }}>
              No classes taken yet.
            </li>
          ) : (
            classesTaken.map((obj) => (
              <li 
                key={obj.className + obj.area} 
                style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}
              >
                <strong>{obj.className}</strong>
                <span style={{ color: "#555" }}>({obj.area})</span>
                <button
                  onClick={() => handleRemoveClass(obj.className, obj.area)}
                  style={{
                    marginLeft: "auto",
                    color: "#fff",
                    background: "#d32f2f",
                    border: "none",
                    borderRadius: 4,
                    padding: "4px 12px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b71c1c")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#d32f2f")}
                  aria-label={`Remove ${obj.className} from classes taken`}
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  </div>
) : (
  <>
    {/* Desktop Search Section */}
   <div className="ge-search-section" style={{ textAlign: 'left' }}>
  <h2 className="ge-classes-title">
    Find Classes
  </h2>
  <div className="ge-search-label">
    Search for a class you have already taken, or plan to take.
  </div>
  <div style={{ position: 'relative', width: '100%' }}>
    <input
      type="text"
      placeholder="Search for a class..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="ge-search-input"
      aria-label="Search classes"
    />
    {Array.isArray(searchResults) && searchResults.length > 0 && (
      <ul className="ge-search-results" role="listbox">
        {searchResults.map((obj) => (
          <li
            key={obj.className}
            onClick={() => handleAddClass(obj.className, obj.area)}
            style={{ padding: '6px 0', cursor: 'pointer', borderBottom: '1px solid #eee' }}
            role="option"
            tabIndex={0}
            onKeyDown={e => { if (e.key === "Enter") handleAddClass(obj.className, obj.area); }}
            aria-selected="false"
          >
            <strong>{obj.className}</strong> <span style={{ color: '#717171' }}>({obj.area})</span>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>


    {/* Desktop Classes Taken Section */}
    <div style={{ margin: "0 auto 36px auto", maxWidth: 600, width: "90%", boxSizing: "border-box" }}>
      <div className="ge-classes-taken-sectiona">
        <h2 className="ge-classes-title" style={{ marginBottom: 12 }}>Classes Taken</h2>
        <ul className="ge-classes-list" style={{ paddingLeft: 0, marginTop: 0 }}>
          {classesTaken.length === 0 ? (
            <li style={{ color: "#aaa", fontStyle: "italic", padding: "10px 0" }}>
              No classes taken yet.
            </li>
          ) : (
            classesTaken.map((obj) => (
              <li key={obj.className + obj.area} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <strong>{obj.className}</strong>
                <span style={{ color: "#555" }}>({obj.area})</span>
                <button
                  onClick={() => handleRemoveClass(obj.className, obj.area)}
                  style={{
                    marginLeft: "auto",
                    color: "#fff",
                    background: "#d32f2f",
                    border: "none",
                    borderRadius: 4,
                    padding: "4px 12px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b71c1c")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#d32f2f")}
                  aria-label={`Remove ${obj.className} from classes taken`}
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  </>
)}












<div className="academic-areas-container"

>
  <h2 className="academic-areas-title">Academic Areas</h2>
  <p
    style={{
      color: "#555",
      marginBottom: 24,
      fontSize: "1.09em",
      textAlign: "left",
      maxWidth: 600,
      marginLeft: 0,
      marginRight: 0,
    }}
  >
    Select the subject areas or types of classes you’re interested in.
  </p>
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: isMobile ? 8 : 14, // space between cards
      justifyContent: "flex-start", // left align rows
      marginTop: 20,
    }}
  >
    {areaRows.flat().map((area) => (
      <div
        key={area.id}
        className={
          "crp-card" + (selectedAreas.includes(area.id) ? " selected" : "")
        }
        onClick={() => toggle(area.id, "area")}
        style={{
          flex: "1 1 calc((100% / 3) - 14px)",  // three items per row (subtract gap)
          minWidth: 0,    // allow shrinking
          maxWidth: "calc((100% / 3) - 14px)", // prevent growing too big
          cursor: "pointer",
          fontWeight: 500,
          padding: "18px 0",  // larger padding for bigger cards
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          border: selectedAreas.includes(area.id)
            ? "3px solid #1976d2"
            : "3px solid #000",
          background: selectedAreas.includes(area.id) ? "#edf3fa" : "#fff",
          color: "#161616",
          transition: "all 0.14s",
          userSelect: "none",
          fontSize: "1.2em",
          letterSpacing: "-0.01em",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60px",  // fixed height for equal card size
          boxSizing: "border-box",
        }}
      >
        {area.label}
      </div>
    ))}
  </div>
</div>


<div
  style={{
    background: "#F7F9FF",
    border: "2px solid #434656",
    borderRadius: 14,
    boxShadow: "0 4px 14px 0 rgba(0,0,0,0.06)",
    padding: isMobile ? "24px 12px" : "36px 38px 32px 38px",
    maxWidth: 1272,
    width: isMobile ? "90vw" : "100%",
    margin: isMobile ? "18px auto" : "0 auto 38px auto",
    textAlign: "left",
    transition: "all 0.3s",
    boxSizing: "border-box",
  }}
>
  <h2 className="student-goals-title">Student Goals</h2>
  <div
    style={{
      display: "flex",
      flexWrap: "nowrap",
      gap: 20,                // increase the gap between cards for more breathing room
      overflowX: "auto",
      marginBottom: 10,
      marginTop: 20,
      paddingBottom: 4,
    }}
  >
    {STUDENT_GOALS.map((goal) => (
      <div
        key={goal.id}
        className={
          "crp-card" + (selectedGoals.includes(goal.id) ? " goal-selected" : "")
        }
        onClick={() => toggle(goal.id, "goal")}
        style={{
          flex: "0 0 280px",
          cursor: "pointer",
          fontWeight: 500,
          padding: "18px 40px",  // increase horizontal padding for wider cards
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          border: selectedGoals.includes(goal.id)
            ? "3px solid #1976d2"
            : "3px solid #000",
          background: selectedGoals.includes(goal.id) ? "#e8f6ef" : "#fff",
          color: "#151515",
          transition: "all 0.14s",
          userSelect: "none",
          fontSize: "1.1em",
          letterSpacing: "-0.01em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "80px",
          boxSizing: "border-box",
          whiteSpace: "nowrap",
        }}
      >
        {goal.label}
      </div>
    ))}
  </div>
</div>



<div
  style={{
    margin: "0 auto 32px auto",
    maxWidth: isMobile ? 675 : 1272,      // Fix max width to 1200 on desktop
    width: isMobile ? "90vw" : "100%",
  }}
>
  <div
    style={{
      background: "#F7F9FF",
      border: "2px solid #434656",
      borderRadius: 14,
      boxShadow: "0 4px 14px 0 rgba(0,0,0,0.06)",
      padding: isMobile ? "24px 12px" : "36px 38px 32px 38px",
      width: "100%",                      // full width of container
      margin: "0 auto",                  // center inside parent container
      textAlign: "center",
      transition: "all 0.3s",
      boxSizing: "border-box",
    }}
  >
    <div
      style={{
        background: "#A7AABD",
        borderRadius: 22,
        display: "inline-block",
        padding: "10px 30px",
        marginBottom: 22,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        fontSize: "1.15em",
        fontWeight: 600,
        color: "#222",
      }}
    >
      <span style={{ fontWeight: 600, fontSize: "1.15em" }}>I want</span>
      <select
        value={dropdownValue}
        onChange={e => setDropdownValue(Number(e.target.value))}
        style={{
          fontSize: "1.1em",
          padding: "6px 20px 6px 10px",
          borderRadius: 7,
          border: "1.5px solid #434656",
          fontWeight: 500,
          background: "#fff",
          cursor: "pointer",
          outline: "none",
          margin: "0 10px",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
        }}
      >
        {[1, 2, 3, 4, 5, 6].map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <span style={{ fontWeight: 600, fontSize: "1.15em" }}>classes recommended.</span>
    </div>
   <div style={{ display: "flex", justifyContent: "center", gap: 18, flexWrap: isMobile ? "wrap" : "nowrap" }}>
  <button
    type="submit"
    style={{
      flex: isMobile ? "0 0 100%" : "1", // full width on mobile, flexible on desktop
      padding: "10px 28px",
      background: "#1976d2",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      fontWeight: "bold",
      fontSize: "1.05em",
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(0,0,0,0.09)",
      opacity: selectedAreas.length === 0 && selectedGoals.length === 0 ? 0.6 : 1,
      minWidth: 200,
      maxWidth: 350,
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
        flex: isMobile ? "0 0 100%" : "1",
        padding: "10px 28px",
        background: "#388e3c",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontWeight: "bold",
        fontSize: "1.05em",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.09)",
        minWidth: 200,
        maxWidth: 350,
      }}
      onClick={handleRefresh}
    >
      Refresh Recommendations
    </button>
  )}
</div>

  </div>
</div>
<div
  style={{
    maxWidth: 900,
    margin: "50px auto 0 auto",
  }}
>
{recommendations.length > 0 && (
  <div style={{ margin: "0 auto 38px auto", maxWidth: 1272, width: "100%" }}>
    <div className="rec-results-mobile-padding">
      <div style={{ marginTop: 10 }}>
        <h3 style={{
          textAlign: "left",
          fontWeight: 600,
          marginBottom: 18,
          fontSize: "1.32em",
          marginLeft: "-150px"
        }}>
          Recommended Classes
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
          }}
        >
  <thead>
    <tr>
      <th>Class</th>
      <th>Professor</th>
      <th>RMP Score</th>
      <th>Difficulty</th>
      {!isMobile && <th>Schedule</th>}
      <th>Link</th>
    </tr>
  </thead>
  <tbody>
  {safeRecommendations.map((cls, idx) => (
      <tr key={cls.className + cls.professor + idx}>
        <td>{cls.className}</td>
        <td>{cls.professor}</td>
        <td>{cls.score !== undefined ? cls.score : "N/A"}</td>
        <td>{cls.difficulty !== undefined ? cls.difficulty : "N/A"}</td>
        {!isMobile && (
          <td>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
  {Array.isArray(cls.schedule) && cls.schedule.length > 0
    ? cls.schedule.map((s, i) => <li key={i}>{s}</li>)
    : typeof cls.schedule === "string" && cls.schedule.trim() !== ""
      ? <li>{cls.schedule}</li>
      : <li style={{ color: "#888" }}>Not listed</li>
  }
</ul>
          </td>
        )}
        <td>
          {cls.link && cls.link !== "N/A" ? (
            <a href={cls.link} target="_blank" rel="noopener noreferrer" style={{ color: "#1976d2", fontWeight: 500 }}>
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
  </div>
)}
</div>
  </div> 
  </div>
)
}
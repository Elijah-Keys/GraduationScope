import Header from "./Header";
import React, { useState } from "react";
import GETracker from "./components/GETracker";
import geRequirements from "./data/geRequirements.json";
import classDetails from "./data/classDetails.json";

const areasToShow = [
  "A1 Oral Communication",
  "A2 Written Communication I",
  "A3 Critical Thinking and Writing",
  "B1 Physical Science",
  "B2 Life Science",
  "B3 Laboratory",
  "Mathematics/Quantitative Reasoning",
  "C1 Arts",
  "C2 Humanities",
  "D. Social Sciences",
  "E. Human Understanding & Development",
  "F. Ethnic Studies",
  "US 1",
  "US 2",
  "US 3"
];

const classToAreas = {
  "AMS 11 - Introduction to American Studies": ["US 2", "US 3"],
  "POLS 15 - Essentials of U.S. & California Government": ["US 2", "US 3", "D Social Sciences"],

  
};

function getAllClasses(geRequirements) {
  const filteredRequirements = areasToShow.map(areaName =>
  geRequirements.find(areaObj => areaObj.area === areaName)
).filter(Boolean); // removes any undefined in case of typos
  let all = [];
  geRequirements.forEach(areaObj => {
    if (Array.isArray(areaObj.classes)) { // Only loop if classes exist
      areaObj.classes.forEach(cls => {
        all.push({ area: areaObj.area, className: cls });
      });
    }
    if (Array.isArray(areaObj.subRequirements)) {
      areaObj.subRequirements.forEach(sub => {
        if (Array.isArray(sub.classes)) {
          sub.classes.forEach(cls => {
            all.push({ area: sub.area, className: cls });
          });
        }
      });
    }
  });
  return all;
}


export default function App() {
  const [search, setSearch] = useState("");
  const [classesTaken, setClassesTaken] = useState([]);
  function onAddClass(className, area) {
    // Prevent more than 3 C1/C2 classes total
    if (
      (area === "C1 Arts" || area === "C2 Humanities") &&
      classesTaken.filter(obj =>
        obj.area === "C1 Arts" || obj.area === "C2 Humanities"
      ).length >= 3
    ) {
      alert("You can only add 3 classes total from C1 Arts and C2 Humanities.");
      return;
    }
    // Prevent duplicates (optional but recommended)
    if (!classesTaken.some(obj => obj.className === className && obj.area === area)) {
      setClassesTaken([...classesTaken, { className, area }]);
    }
  }
    // C1/C2 combined requirement logic
  const c1Taken = classesTaken.filter(obj => obj.area === "C1 Arts").length;
  const c2Taken = classesTaken.filter(obj => obj.area === "C2 Humanities").length;
  const c1c2Total = c1Taken + c2Taken;
  const c1c2Fulfilled = c1c2Total >= 3 && c1Taken >= 1 && c2Taken >= 1;

function onAddClass(className, area) {
  // Prevent more than 3 C1/C2 classes total
  if (
    (area === "C1 Arts" || area === "C2 Humanities") &&
    classesTaken.filter(obj =>
      obj.area === "C1 Arts" || obj.area === "C2 Humanities"
    ).length >= 3
  ) {
    alert("You can only add 3 classes total from C1 Arts and C2 Humanities.");
    return;
  }
  // Prevent duplicates
  if (!classesTaken.some(obj => obj.className === className && obj.area === area)) {
    setClassesTaken([...classesTaken, { className, area }]);
  }
}
function onDeleteClass(classObj) {
  setClassesTaken(prev =>
    prev.filter(obj =>
      !(obj.className === classObj.className && obj.area === classObj.area)
    )
  );
}
  const allClasses = getAllClasses(geRequirements);

  // Map: area -> list of its classes
  const areaToClasses = {};
  geRequirements.forEach(areaObj => {
    areaToClasses[areaObj.area] = areaObj.classes;
  });

  // Classes Taken: show area and className
  const takenClassObjs = allClasses.filter(
  obj => classesTaken.some(taken => taken.className === obj.className)
);
const countClassesForArea = (areaName) => {
  return takenClassObjs.filter(obj => {
    const areas = classToAreas[obj.className] || [];
    return areas.includes(areaName);
  }).length;
};
// --- Area D Logic ---
const DClasses = areaToClasses["D. Social Sciences"] || [];
const takenD = classesTaken.reduce((count, obj) => {
  const areas = classToAreas[obj.className] || [];
  return count + (areas.includes("D. Social Sciences") ? 1 : 0);
}, 0);
let showAreaD = true;
if (takenD >= 2) {
  showAreaD = false;  
}

// --- Area C Logic ---
const C1Classes = areaToClasses["C1 Arts"] || [];
const C2Classes = areaToClasses["C2 Humanities"] || [];
const takenC1 = takenClassObjs.filter(obj => obj.area === "C1 Arts").length;
const takenC2 = takenClassObjs.filter(obj => obj.area === "C2 Humanities").length;
const takenC = takenC1 + takenC2;
let areaCWarning = "";
let showAreaC = true;
if (takenC >= 3) {
  if (takenC1 === 0) {
    areaCWarning = "Warning: You must complete at least one class from C1 Arts.";
    showAreaC = false;
  } else if (takenC2 === 0) {
    areaCWarning = "Warning: You must complete at least one class from C2 Humanities.";
    showAreaC = false;
  } else {
    areaCWarning = "";
    showAreaC = false;
  }
}

const fulfilledAreas = new Set();
classesTaken.forEach(obj => {
  const areas = classToAreas[obj.className] || [];
  areas.forEach(area => fulfilledAreas.add(area));
});

// Search logic
const searchResults = search.length > 0
  ? allClasses.filter(
      obj =>
        obj.className.toLowerCase().includes(search.toLowerCase()) &&
        !classesTaken.some(taken => taken.className === obj.className && taken.area === obj.area)
    )
  : [];


  // Add/remove class handlers
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

return (
  <div style={{ maxWidth: 700, margin: "2rem auto", fontFamily: "Nunito Sans" }}>
     <Header />
     <div style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "18px 0 18px 0",
  gap: "10px"
}}>
  <span style={{
    fontWeight: 700,
    fontSize: "1.08em",
    color: "#0055A2",
    background: "#FFC72A",
    padding: "6px 14px",
    borderRadius: "22px"
  }}>
    $100 Raffle
  </span>
  <span style={{ fontSize: "2em", color: "#0055A2" }}>➡️</span>
  <a
    href="https://docs.google.com/forms/d/1Y1O0rC_F2kYRl3q4VJCNqmv0pGIijDSemQ6cwrrxTNw/viewform"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      fontWeight: 600,
      fontSize: "1.06em",
      color: "#0055A2",
      textDecoration: "underline"
    }}
  >
    Take the quick survey!
  </a>
</div>

    <h1>GE Requirements</h1>
    {/* 3. Instruction above search bar */}
    <div style={{ fontSize: "1em", color: "#444", marginBottom: 6 }}>
      Search for a class you have already taken, or plan to take.
    </div>
    {/* Search Bar */}
      <div style={{ marginBottom: 24, position: "relative" }}>
        <input
          type="text"
          placeholder="Search for a class..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "1rem",
            borderRadius: 4,
            border: "1px solid #ccc"
          }}
        />
        {searchResults.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: "8px",
              border: "1px solid #ccc",
              borderTop: "none",
              maxHeight: 200,
              overflowY: "auto",
              background: "#fff",
              position: "absolute",
              width: "calc(100% - 2px)",
              zIndex: 2
            }}
          >
            {searchResults.map(obj => (
              <li
                key={obj.className}
                style={{
                  padding: "6px 0",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee"
                }}
                onClick={() => handleAddClass(obj.className, obj.area)}
              >
                <strong>{obj.className}</strong>
                <span style={{ color: "#888", marginLeft: 8 }}>
                  ({obj.area})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Classes Taken Section */}
      <div style={{ marginBottom: 32 }}>
        <h2>Classes Taken</h2>
  <ul>
    {classesTaken.length === 0 ? (
      <li style={{ color: "#aaa" }}>No classes taken yet.</li>
    ) : (
      classesTaken.map(obj => (
        <li key={obj.className + obj.area}>
          <strong>{obj.className}</strong>
          <span style={{ marginLeft: 8, color: "#555" }}>
            ({obj.area})
          </span>
          <button
            onClick={() => onDeleteClass(obj)}
            style={{
              marginLeft: 8,
              color: "red",
              background: "none",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "2px 8px",
              cursor: "pointer"
            }}
            title="Delete class"
          >
            Delete
          </button>
        </li>
      ))
    )}
  </ul>


        {/* Area C Warning */}
        <div style={{ marginTop: 16 }}>
          {areaCWarning && (
            <div style={{ color: "#b8860b", fontWeight: "bold" }}>{areaCWarning}</div>
          )}
        </div>
      </div>
      {/* 5. Instruction below all areas (just before GETracker) */}
<div style={{ fontSize: "0.97em", color: "#888", margin: "8px 0 14px 0" }}>
  Click on a class name to see more information.
</div>

      {/* GE Requirements List (sorted alphabetically by area) */}
     <GETracker
  geRequirements={geRequirements}
  classDetails={classDetails}
  onAddClass={onAddClass}
  onDeleteClass={onDeleteClass}   
  classesTaken={classesTaken}
  c1c2Fulfilled={c1c2Fulfilled} // <-- pass as prop
/>
<div
  style={{
    fontSize: "0.95em",
    color: "#666",
    margin: "32px 0 0 0",
    textAlign: "center",
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 10,
    zIndex: 100,
    background: "rgba(255,255,255,0.95)",
    pointerEvents: "none"
  }}
>
  *classes as of June 15th.
</div>
          </div>)}
      
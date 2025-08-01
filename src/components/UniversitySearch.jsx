import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import universities from "../data/universities";
import './UniversitySearch.css';





export default function UniversitySearch() {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Filter results based on search
  const getFilteredResults = (value) => {
    if (!value) return universities;
    return universities.filter(u =>
      u.name.toLowerCase().includes(value.toLowerCase())
    );
  };

  // Handle input change
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setResults(getFilteredResults(value));
    setShowDropdown(true);
  };

  // Handle input focus
  const handleFocus = () => {
    setResults(getFilteredResults(search));
    setShowDropdown(true);
  };

  // Handle input blur (hide dropdown after short delay to allow click)
  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 100);
  };

  // When a result is clicked, navigate to dashboard
 // UniversitySearch.jsx (snippet)
const handleResultClick = (university) => {
  navigate(`/${university.id}`); // dynamically navigates to correct path
};


  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 650 }}>
      <input
        ref={inputRef}
        className="hero-search"
        type="text"
        placeholder="Search universities"
        value={search}
        onChange={handleSearch}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="off"
        style={{ width: "100%" }}
      />
     {showDropdown && (
  <div className="university-dropdown">
          {results.length > 0 ? (
            results.map(u => (
              <div
                key={u.id}
                style={{
                  cursor: "pointer",
                  padding: "16px 24px",
                  borderBottom: "1px solid #eee",
                  color: "#222",
                  fontWeight: 500,
                  transition: "background 0.15s"
                }}
                onMouseDown={() => handleResultClick(u)}
                onMouseOver={e => e.currentTarget.style.background = "#f3f3f3"}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}
              >
                {u.name}
              </div>
            ))
          ) : (
            <div style={{ padding: "16px 24px", color: "#888" }}>
              No results found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

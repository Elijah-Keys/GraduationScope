import React, { useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import universities from "../data/universities";
import "./UniversitySearch.css";

const UniversitySearch = forwardRef((props, ref) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const getFilteredResults = (value) => {
    if (!value) return universities;
    return universities.filter((u) =>
      u.name.toLowerCase().includes(value.toLowerCase())
    );
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setResults(getFilteredResults(value));
    setShowDropdown(true);
  };

  const handleFocus = () => {
    setResults(getFilteredResults(search));
    setShowDropdown(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 100);
  };

  const handleResultClick = (university) => {
    navigate(`/${university.id}`);
  };

  return (
    <div className="uni-search-shell">
      <input
        ref={ref}
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
            results.map((u) => (
              <div
                key={u.id}
                style={{
                  cursor: "pointer",
                  padding: "14px 18px",
                  borderBottom: "1px solid #eee",
                  color: "#222",
                  fontWeight: 500,
                  transition: "background 0.15s",
                }}
                onMouseDown={() => handleResultClick(u)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#f3f3f3")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {u.name}
              </div>
            ))
          ) : (
            <div style={{ padding: "14px 18px", color: "#888" }}>
              No results found.
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default UniversitySearch;

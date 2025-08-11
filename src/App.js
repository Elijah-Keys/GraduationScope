  import Header from "./components/Header";
  import React, { useState, useEffect } from "react";
  import GETracker from "./pages/GETracker";
  import geRequirements from "./data/geRequirements.json";
  import classDetails from "./data/classDetails.json";
  import chicoGeRequirements from './data/ChicogeRequirements.json';
import chicoClassDetails from './data/ChicoclassDetails.json';
  import { Routes, Route } from "react-router-dom";
  import { Link } from "react-router-dom";
  import { Navigate } from "react-router-dom";
  import Home from "./components/Home";
  import { useLocation } from "react-router-dom";
 import { ClassesTakenProvider } from './components/ClassesTakenProvider.jsx';
  // index.js or App.js
  import './global.css';
  import About from "./components/About";
  import Contact from "./components/Contact";
  import Survey from "./components/Survey";
  import { useNavigate } from "react-router-dom"; // Add this import
  import SignUpModal from "./SignUpModal";
  import AccountSettingsPage from "./pages/AccountSettingsPage";
  import Cookies from 'js-cookie';
  import BottomBarA from './components/MobileBottomBar';
  import LoginModal from "./components/SignInModal.jsx";
  import ForgotPasswordPage from "./components/ForgotPassword.jsx";
  import introJs from "intro.js";
  import "intro.js/introjs.css"; // Don't forget to import the CSS!
  import ClassRecommendationPage from "./components/ClassRecomendation.jsx";
import ChicoGETracker from "./pages/ChicoGETracker";
import ChicoClassRecommendationPage from "./components/ChicoClassRecommendation.jsx";
import BerkeleyGETracker from "./pages/BerekeleyGETracker.jsx";
 import BerkeleyGeRequirements from './data/BerkeleygeRequirements.json';
import BerkeleyClassDetails from './data/BerekelyclassDetails.json';
import BerkeleyClassRecommendationPage from "./components/BerkeleyClassRecommendation.jsx";
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



  function ClassRecommendation() {
    return <h1>Class Recommendation Page</h1>;
  }


  export default function App() {
    const [showSignUp, setShowSignUp] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [prefillEmail, setPrefillEmail] = useState("");

    // ...rest of your hooks and logic...
 const loc = useLocation();
    const isHome = loc.pathname === "/" || loc.pathname === "/home";
    const navigate = useNavigate(); // Add this line
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true" ||
    sessionStorage.getItem("isAuthenticated") === "true"
  );

    const [search, setSearch] = useState("");
    const [classesTaken, setClassesTaken] = useState([]);
    // On app load
  useEffect(() => {
    const savedClasses = localStorage.getItem("classesTaken");
    if (savedClasses) {
      setClassesTaken(JSON.parse(savedClasses));
    }
  }, []);

  // Save classes when they change
  useEffect(() => {
    localStorage.setItem("classesTaken", JSON.stringify(classesTaken));
  if (!currentUser) {
    // handle no user case, e.g. return or set default
    return;
  }
  const normalizedEmail = currentUser.trim().toLowerCase();


  }, [classesTaken]);


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
  // In your handleLogin function in App.js
  const handleLogin = ({ email, password, rememberMe }) => {
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (users[email] && users[email].password === password) {
      // Store in localStorage if Remember Me, otherwise sessionStorage
      if (rememberMe) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUser", email);
      } else {
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("currentUser", email);
      }
      setIsAuthenticated(true);
      setCurrentUser(email);
      setClassesTaken(users[email].classesTaken || []);
      setShowLogin(false);
      const recentUniversity = localStorage.getItem("recentUniversity") || "sjsu";
      navigate(`/${recentUniversity}`);
    } else {
      alert("Invalid credentials");
    }
  };



  const handleSignUp = ({ email, password }) => {
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (users[email]) {
      alert("An account with this email already exists.");
      return;
    }
    users[email] = { password, classesTaken: [] };
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("currentUser", email);
    setIsAuthenticated(true);
    setCurrentUser(email);
    setClassesTaken([]); // Start with empty classes
    setShowSignUp(false);
    setSuccessMessage("Successfully signed up!");
    navigate("/"); // Redirect to home

    setTimeout(() => setSuccessMessage(""), 2500); // Hide message after 2.5s
  };

  {successMessage && (
    <div className="success-toast">
      {successMessage}
    </div>
  )}




  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("currentUser");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setClassesTaken([]);
    navigate("/");
  };


  useEffect(() => {
    const syncAuth = () => {
      setIsAuthenticated(localStorage.getItem("isAuthenticated") === "true");
    };
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("currentUser") ||
    sessionStorage.getItem("currentUser") ||
    null
  );
  useEffect(() => {
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem("users") || "{}");
      const normalizedEmail = currentUser.trim().toLowerCase();
      if (users[normalizedEmail]) {
        users[normalizedEmail].classesTaken = classesTaken;
        localStorage.setItem("users", JSON.stringify(users));
      } else {
        // Optionally handle the missing user case
        // setIsAuthenticated(false); setCurrentUser(null);
      }
    }
  }, [classesTaken, currentUser]);

  <div>
    <button onClick={() => setShowSignUp(true)}>Test Open Sign Up</button>
    <button onClick={() => setShowLogin(true)}>Test Open Login</button>
  </div>

    return (
    <>
  <Header
    isAuthenticated={isAuthenticated}
    onLogout={handleLogout}
    onShowSignUp={() => setShowSignUp(true)}
    onShowLogin={() => setShowLogin(true)}
  />
  {showSignUp && (
    <SignUpModal
      onClose={() => setShowSignUp(false)}
      onSignUp={handleSignUp}
      onShowLogin={email => {
        setShowSignUp(false);
        setPrefillEmail(email || "");
        setShowLogin(true);
      }}
    />
  )}
  {showLogin && (
    <LoginModal
      onLogin={handleLogin}
      onClose={() => setShowLogin(false)}
      prefillEmail={prefillEmail}
      onShowSignUp={() => {
        setShowLogin(false);
        setShowSignUp(true);
      }}
    />
  )}

  {showForgotPassword && (
    <ForgotPasswordPage
      onBackToLogin={() => {
        setShowForgotPassword(false);
        setShowLogin(true);
      }}
    />
  )}




    
    <Routes>
      <Route path="/" element={<Home search={search} setSearch={setSearch} />} />
      <Route
        path="/sjsu"
        element={
          <GETracker
            geRequirements={geRequirements}
            classDetails={classDetails}
            onAddClass={onAddClass}
            onDeleteClass={onDeleteClass}
            classesTaken={classesTaken}
            c1c2Fulfilled={c1c2Fulfilled}
            areaCWarning={areaCWarning}
            search={search}
            setSearch={setSearch}
            searchResults={searchResults}
            handleAddClass={handleAddClass}
            university={"sjsu"}
          />
        }
      />
      <Route
    path="/sanjosestate"
    element={
      <GETracker
        geRequirements={geRequirements}
        classDetails={classDetails}
        onAddClass={onAddClass}
        onDeleteClass={onDeleteClass}
        classesTaken={classesTaken}
        c1c2Fulfilled={c1c2Fulfilled}
        areaCWarning={areaCWarning}
        search={search}
        setSearch={setSearch}
        searchResults={searchResults}
        handleAddClass={handleAddClass}
        university={"sjsu"}
      />
    }
  />
  <Route
    path="/chico"
    element={
      <ChicoGETracker
            geRequirements={chicoGeRequirements}
            classDetails={chicoClassDetails}
            onAddClass={onAddClass}
        onDeleteClass={onDeleteClass}
        classesTaken={classesTaken}
        c1c2Fulfilled={c1c2Fulfilled}
        areaCWarning={areaCWarning}
        search={search}
        setSearch={setSearch}
        searchResults={searchResults}
        handleAddClass={handleAddClass}
            university="chico"
      />
    }
  />
      {/* other routes */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/survey" element={<Survey />} />
  <Route path="/chicorecommend" element={
    <ChicoClassRecommendationPage
      geRequirements={chicoGeRequirements}
      classDetails={chicoClassDetails}
       pageTitle="Chico Class Recommendations"
    />} 
  />

  <Route path="/recommend" element={
    <ClassRecommendationPage
      geRequirements={geRequirements}
      classDetails={classDetails}
    />} 
  />
<Route
  path="/berkeley"
  element={
    <BerkeleyGETracker
      geRequirements={BerkeleyGeRequirements}
      classDetails={BerkeleyClassDetails}
      onAddClass={onAddClass}
      onDeleteClass={onDeleteClass}
      classesTaken={classesTaken}
      c1c2Fulfilled={c1c2Fulfilled}
      areaCWarning={areaCWarning}
      search={search}
      setSearch={setSearch}
     
      handleAddClass={handleAddClass}
      university="berkeley"
    />
  }
/>

<Route
  path="/berkeleyrecommend"
  element={
    <ClassRecommendationPage
      geRequirements={BerkeleyGeRequirements}
      classDetails={BerkeleyClassDetails}
      pageTitle="Smart Class Recommendations — Berkeley"
    />
  }
/>

    </Routes>
    {!isHome && <BottomBarA />}
    </>
    );


    return (
      <ClassesTakenProvider>
        <>
          <Header
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            onShowSignUp={() => setShowSignUp(true)}
            onShowLogin={() => setShowLogin(true)}
          />
          {showSignUp && (
            <SignUpModal
              onClose={() => setShowSignUp(false)}
              onSignUp={handleSignUp}
              onShowLogin={email => {
                setShowSignUp(false);
                setPrefillEmail(email || "");
                setShowLogin(true);
              }}
            />
          )}
          {showLogin && (
            <LoginModal
              onLogin={handleLogin}
              onClose={() => setShowLogin(false)}
              prefillEmail={prefillEmail}
              onShowSignUp={() => {
                setShowLogin(false);
                setShowSignUp(true);
              }}
            />
          )}
          {showForgotPassword && (
            <ForgotPasswordPage
              onBackToLogin={() => {
                setShowForgotPassword(false);
                setShowLogin(true);
              }}
            />
          )}
          <Routes>
            <Route path="/" element={<Home search={search} setSearch={setSearch} />} />
            <Route
              path="/sjsu"
              element={
                <GETracker
                  geRequirements={geRequirements}
                  classDetails={classDetails}
                  onAddClass={onAddClass}
                  onDeleteClass={onDeleteClass}
                  classesTaken={classesTaken}
                  c1c2Fulfilled={c1c2Fulfilled}
                  areaCWarning={areaCWarning}
                  search={search}
                  setSearch={setSearch}
                  searchResults={searchResults}
                  handleAddClass={handleAddClass}
                  university={"sjsu"}
                />
              }
            />
            <Route
              path="/sanjosestate"
              element={
                <GETracker
                  geRequirements={geRequirements}
                  classDetails={classDetails}
                  onAddClass={onAddClass}
                  onDeleteClass={onDeleteClass}
                  classesTaken={classesTaken}
                  c1c2Fulfilled={c1c2Fulfilled}
                  areaCWarning={areaCWarning}
                  search={search}
                  setSearch={setSearch}
                  searchResults={searchResults}
                  handleAddClass={handleAddClass}
                  university={"sjsu"}
                />
              }
            />
            {/* other routes */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/account" element={<AccountSettingsPage />} />
            <Route
              path="/recommend"
              element={
                <ClassRecommendationPage
                  geRequirements={geRequirements}
                  classDetails={classDetails}
                />
              }
            />
          </Routes>
          {!isHome && <BottomBarA />}
        </>
      </ClassesTakenProvider>
    );
  }

   
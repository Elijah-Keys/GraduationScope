  import Header from "./components/Header";
  import React, { useState, useEffect } from "react";
  import GETracker from "./pages/GETracker";
  import geRequirements from "./data/geRequirements.json";
import classDetails from "./data/SpringSJSUclassDetails.json";
  import chicoGeRequirements from './data/ChicogeRequirements.json';
import chicoClassDetails from './data/ChicoclassDetails.json';
  import { Routes, Route } from "react-router-dom";
  import { Link } from "react-router-dom";
  import { Navigate } from "react-router-dom";
  import Home from "./components/Home";
  import { useLocation } from "react-router-dom";
import { ClassesTakenProvider } from "./lib/classesTakenStore";
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
import SignInModal from "./components/SignInModal.jsx";
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
import Footer from "./components/Footer.jsx";
import Privacy from "./components/Privacy";
import Terms from "./components/Terms";
import SJSUFAQ from "./components/faq/sjsu";
import BerkeleyFAQ from "./components/faq/berkeley";
import ChicoFAQ from "./components/faq/chico";
import GeneralFAQ from "./components/faq/general";
import SJSUEasiestClasses from "./pages/guides/SJSUEasiestClasses.jsx";
import BerkeleyEasiestClasses from "./pages/guides/BerkeleyEasiestClasses.jsx";
import ChicoEasiestClasses from "./pages/guides/ChicoEasiestClasses.jsx";
import BlogPickSJSUGEFast from "./pages/blog/pick-sjsu-ge-fast.jsx";
import BlogPickBerkeleyBreadthFast from "./pages/blog/pick-berkeley-breadth-fast.jsx";
import BlogPickChicoAreaCFast from "./pages/blog/pick-chico-area-c-fast.jsx";
import Plus from "./pages/Plus";
import { PremiumProvider } from "./PremiumContext";
import santaCruzGeRequirements from "./data/SantaCruzgeRequirements.json";
import santaCruzClassDetails from "./data/SantaCruzclassDetails.json";
import SantaCruzGETracker from "./pages/SantaCruzGETracker";
import { UCSCTOPIC_TO_CLASSES } from "./components/UCSCTopic_To_Classes.jsx";
import UCSCgeRequirements from "./data/SantaCruzgeRequirements.json";
import UCSCClassRecommendationPage from "./components/UCSCClassRecommendation.jsx";
import FooterGuard from "./components/FooterGuard"; // adjust path
import AdTimers from "./ads/AdsTimer.jsx";
// at the top of App.js
import seb1 from "./ads/Seb1.jpg";
import seb2 from "./ads/Seb2.jpg";
// ADD
import SurveyModal from "./surveys/SurveyModal.jsx";
import { useSurveyPrompt } from "./surveys/useSurveyPrompt.js";

// add:
const FIRST_AD = {
  id: "sebblendz-1",
  title: "SebBlendzz at Panther Barbershop",
  text: "Best barber in San Jose",
  image: seb1,
  ctaText: "Book now",
  href: "https://booksy.com/en-us/1493170_sebblendzz_barber-shop_134690_san-jose#ba_s=seo",
  secondaryCtaText: "Instagram",
  secondaryHref: "https://www.instagram.com/sebblendzz/"
};

const SECOND_AD = {
  id: "sebblendz-2",
  title: "Need a fresh cut in San Jose?",
  text: "Tap to book with SebBlendzz",
  image: seb2,
  ctaText: "Book now",
  href: "https://booksy.com/en-us/1493170_sebblendzz_barber-shop_134690_san-jose#ba_s=seo",
  secondaryCtaText: "Instagram",
  secondaryHref: "https://www.instagram.com/sebblendzz/"
};
const SURVEY_URL =
  process.env.REACT_APP_SURVEY_URL || "https://www.graduationscope.com/survey";
  
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
// ⬇️ NEW: remember where the user was when they opened Login
const [returnPath, setReturnPath] = useState(null);

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
    // persist session
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

    // ⬇️ NEW: go back to where the user opened the login
    if (loc.pathname === "/login") {
      if (returnPath) {
        navigate(returnPath, { replace: true });
        setReturnPath(null);
      } else if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/");
      }
    }

  } else {
    alert("Invalid credentials");
  }
};

  // ⬇️ NEW: open Login modal and reflect it in the URL
const openLogin = () => {
  if (!showLogin) setShowLogin(true);

  // remember where the user was BEFORE /login
  if (loc.pathname !== "/login") {
    setReturnPath(loc.pathname + loc.search + loc.hash);
    navigate("/login", { replace: false });
  }
};

// ⬇️ NEW: close Login modal and restore the previous page
const closeLogin = () => {
  setShowLogin(false);
  if (loc.pathname === "/login") {
    if (returnPath) {
      navigate(returnPath, { replace: true });
      setReturnPath(null);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }
};

// ⬇️ NEW: if the user lands on /login directly, show the modal
useEffect(() => {
  if (loc.pathname === "/login") setShowLogin(true);
}, [loc.pathname]);

// if user lands on /login directly, show the modal
useEffect(() => {
  if (loc.pathname === "/login") setShowLogin(true);
}, [loc.pathname]);



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
  // ADD survey prompt hook for testing now
// Survey prompt hook
const { open: surveyOpen, dismiss: surveyDismiss, take: surveyTake } =
  useSurveyPrompt({
    userId: currentUser || "anon",
    initialDelaySec: 120,      // show right away for testing
    cooldownHours: 3,        // no cooldown for testing
    forceTest: false          // force open on load for testing
  });


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
      <ClassesTakenProvider> <>
  <Header
   isAuthenticated={isAuthenticated}
   onLogout={handleLogout}
   onShowSignUp={() => setShowSignUp(true)}
 onShowLogin={openLogin}
 />
 


<AdTimers
  userId={currentUser || "anon"}
  firstAd={FIRST_AD}
  secondAd={SECOND_AD}
  firstDelaySec={30}
  gapAfterFirstSec={280}
  countIdleWhileTesting={true}
/>

    {/* Modals */}
    {showSignUp && (
      <SignUpModal
        onClose={() => setShowSignUp(false)}
        onSignUp={handleSignUp}
        onShowLogin={(email) => {
     setShowSignUp(false);
     if (email) setPrefillEmail(email);
     openLogin();           // <-- not setShowLogin(true)
   }}
      />
    )}
    {showLogin && (
      <SignInModal
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

    {/* ALL routes go inside this one <Routes> */}
    <Routes>
      <Route path="/" element={<Home search={search} setSearch={setSearch} />} />
<Route path="/login" element={<Home search={search} setSearch={setSearch} />} />
 <Route path="/signup" element={<Home search={search} setSearch={setSearch} />} />
      {/* SJSU */}
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
            university="sjsu"
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
            university="sjsu"
          />
        }
      />
<Route path="/plus" element={<Plus />} />

      {/* Chico */}
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
    <Route
  path="/chicorecommend"
  element={
    <ChicoClassRecommendationPage
      geRequirements={chicoGeRequirements}
      classDetails={chicoClassDetails}
      classesTaken={classesTaken}
      onAddClass={handleAddClass}
      onRemoveClass={handleRemoveClass}
      pageTitle="Chico Class Recommendations"
    />
  }
/>

      {/* Berkeley */}
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
    <BerkeleyClassRecommendationPage
      geRequirements={BerkeleyGeRequirements}
      classDetails={BerkeleyClassDetails}
    classesTaken={classesTaken}
     onAddClass={handleAddClass}
     onRemoveClass={handleRemoveClass}
      pageTitle="Smart Class Recommendations — Berkeley"
    />
  }
/>
<Route
  path="/santacruz"
  element={
    <SantaCruzGETracker
      geRequirements={santaCruzGeRequirements}
      classDetails={santaCruzClassDetails}
      onAddClass={onAddClass}
      onDeleteClass={onDeleteClass}
      classesTaken={classesTaken}
      c1c2Fulfilled={c1c2Fulfilled}
      areaCWarning={areaCWarning}
      search={search}
      setSearch={setSearch}
      searchResults={searchResults}
      handleAddClass={handleAddClass}
      university="santacruz"
    />
  }
/>
<Route
  path="/santacruzrecommend"
   element={
  <UCSCClassRecommendationPage
     geRequirements={santaCruzGeRequirements}
     classDetails={santaCruzClassDetails}
     onRemoveClass={handleRemoveClass}
     pageTitle="Smart Class Recommendations — UCSC"
   />
 }
/>


      {/* Generic recommend (SJSU) */}
     <Route
  path="/recommend"
  element={
    <ClassRecommendationPage
      geRequirements={geRequirements}
      classDetails={classDetails}
      classesTaken={classesTaken}
      onAddClass={handleAddClass}
      onRemoveClass={handleRemoveClass}
      pageTitle="Smart Class Recommendations — SJSU"
    />
  }
/>


      {/* Static pages */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/survey" element={<Survey />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/account" element={<AccountSettingsPage />} />
<Route path="/faq/sjsu" element={<SJSUFAQ />} />
<Route path="/faq/berkeley" element={<BerkeleyFAQ />} />
<Route path="/faq/chico" element={<ChicoFAQ />} />
<Route path="/faq/general" element={<GeneralFAQ />} />
<Route path="/guides/sjsu-easiest-classes" element={<SJSUEasiestClasses />} />
<Route path="/guides/berkeley-easiest-classes" element={<BerkeleyEasiestClasses />} />
<Route path="/guides/chico-easiest-classes" element={<ChicoEasiestClasses />} />
<Route path="/blog/pick-sjsu-ge-fast" element={<BlogPickSJSUGEFast />} />
<Route path="/blog/pick-berkeley-breadth-fast" element={<BlogPickBerkeleyBreadthFast />} />
<Route path="/blog/pick-chico-area-c-fast" element={<BlogPickChicoAreaCFast />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

    {/* Outside of <Routes> */}
    <Footer isHome={isHome} />
 
<SurveyModal
  open={surveyOpen}
  onClose={surveyDismiss}
  onTake={() => surveyTake(SURVEY_URL)}
  title="Help us improve GraduationScope!"
  subtitle="Enter our gift card giveaway by taking a quick survey."
/>

      <FooterGuard />
    {!isHome && <BottomBarA />}
  </>
);
</ClassesTakenProvider>
 
)
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
            <SignInModal
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

   
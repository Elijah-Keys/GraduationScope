import React, { createContext, useContext, useState } from "react";

// 1. Create context
const ClassesTakenContext = createContext();

// 2. Provider wrapping the entire app
export function ClassesTakenProvider({ children }) {
  const [classesTaken, setClassesTaken] = useState([]);
  return (
    <ClassesTakenContext.Provider value={{ classesTaken, setClassesTaken }}>
      {children}
    </ClassesTakenContext.Provider>
  );
}

// 3. Use in any component:
export function useClassesTaken() {
const { classesTaken, setClassesTaken } = useContext(ClassesTakenContext);
}
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "gs:classesTaken:v1";
// If you previously used a different key, add it here to migrate once
const LEGACY_KEYS = ["classesTaken", "takenClasses", "gs:classesTaken"];

function normalizeCourseId(course) {
  if (!course) return null;
  // Allow passing a string id directly
  if (typeof course === "string") return course.trim().toUpperCase();

  // Prefer a provided course.id
  let id = course.id;
  if (!id) {
    // Build a stable id from common fields
    const bits = [course.subject, course.number, course.code, course.catalogNumber]
      .filter(Boolean)
      .map(String);
    if (bits.length) id = bits.join("-");
  }
  if (!id) {
    // Fall back to title (last resort)
    id = course.title || course.name || "COURSE";
  }
  return String(id).trim().replace(/\s+/g, "-").toUpperCase();
}

function loadFromStorage() {
  // Try new key
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (_) {}
  }
  // Migrate one legacy key if present
  for (const k of LEGACY_KEYS) {
    const legacy = localStorage.getItem(k);
    if (legacy) {
      try {
        const data = JSON.parse(legacy);
        saveToStorage(data);
        // optional: keep legacy for safety, or remove:
        // localStorage.removeItem(k);
        return data;
      } catch (_) {}
    }
  }
  return { items: {} }; // items: { [id]: { id, title?, subject?, number?, units?, area? } }
}

function saveToStorage(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const ClassesTakenContext = createContext(null);

export function ClassesTakenProvider({ children }) {
  const [items, setItems] = useState(() => {
    const init = loadFromStorage();
    return init.items || {};
  });

  // persist
  useEffect(() => {
    saveToStorage({ items });
  }, [items]);

  // keep multiple tabs in sync
  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const incoming = JSON.parse(e.newValue);
          if (incoming && incoming.items) setItems(incoming.items);
        } catch {}
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const api = useMemo(() => {
    const add = (course) => {
      const id = normalizeCourseId(course);
      if (!id) return;
      setItems((prev) => {
        if (prev[id]) return prev; // no-op
        const snapshot = {
          id,
          title: course.title || course.name || null,
          subject: course.subject || null,
          number: course.number || course.catalogNumber || null,
          area: course.area || null,
          units: course.units || course.credits || null,
        };
        return { ...prev, [id]: snapshot };
      });
    };

    const remove = (courseOrId) => {
      const id = normalizeCourseId(courseOrId);
      if (!id) return;
      setItems((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    };

    const toggle = (course) => {
      const id = normalizeCourseId(course);
      if (!id) return;
      setItems((prev) => (prev[id] ? (() => {
        const next = { ...prev }; delete next[id]; return next;
      })() : { ...prev, [id]: {
        id,
        title: course.title || course.name || null,
        subject: course.subject || null,
        number: course.number || course.catalogNumber || null,
        area: course.area || null,
        units: course.units || course.credits || null,
      }}));
    };

    const has = (courseOrId) => {
      const id = normalizeCourseId(courseOrId);
      return !!(id && items[id]);
    };

    const list = () => Object.values(items).sort((a, b) => a.id.localeCompare(b.id));

    const clear = () => setItems({});

    const importFromArray = (arr) => {
      const next = {};
      for (const c of arr || []) {
        const id = normalizeCourseId(c);
        if (!id) continue;
        next[id] = {
          id,
          title: c.title || c.name || null,
          subject: c.subject || null,
          number: c.number || c.catalogNumber || null,
          area: c.area || null,
          units: c.units || c.credits || null,
        };
      }
      setItems(next);
    };

    const exportArray = () => list();

    return { add, remove, toggle, has, list, clear, importFromArray, exportArray, normalizeCourseId };
  }, [items]);

  return (
    <ClassesTakenContext.Provider value={api}>
      {children}
    </ClassesTakenContext.Provider>
  );
}

export function useClassesTaken() {
  const ctx = useContext(ClassesTakenContext);
  if (!ctx) throw new Error("useClassesTaken must be used within ClassesTakenProvider");
  return ctx;
}

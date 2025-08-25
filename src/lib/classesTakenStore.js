import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gs_classes_taken_v4";
const BUS_EVENT = "gs:classes-taken";

// helper to normalize a unique key per class across all campuses
function norm(s) { return (s || "").toString().trim().toLowerCase(); }
function keyOf(item) {
  if (!item) return "";
  if (typeof item === "string") return norm(item);
  const campus = norm(item.campus) || "any";
  const code = norm(item.code);
  const name = norm(item.className);
  return `${campus}|${code}|${name}`;
}

export function useClassesTakenStore() {
  const [classesTaken, setClassesTaken] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  });

  const save = useCallback((next) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    window.dispatchEvent(new CustomEvent(BUS_EVENT, { detail: next }));
  }, []);

  const addClass = useCallback((item) => {
    const k = keyOf(item);
    if (!k) return;
    setClassesTaken((curr) => {
      if (curr.some((c) => keyOf(c) === k)) return curr;
      const normalized = typeof item === "string" ? { className: item } : item;
      const next = [...curr, normalized];
      save(next);
      return next;
    });
  }, [save]);

  const removeClass = useCallback((itemOrKey) => {
    const k = keyOf(itemOrKey);
    setClassesTaken((curr) => {
      const next = curr.filter((c) => keyOf(c) !== k);
      save(next);
      return next;
    });
  }, [save]);

  const clearClasses = useCallback(() => {
    setClassesTaken([]);
    save([]);
  }, [save]);

  const isTaken = useCallback((itemOrKey) => {
    const k = keyOf(itemOrKey);
    return classesTaken.some((c) => keyOf(c) === k);
  }, [classesTaken]);

  useEffect(() => {
    const onBus = (e) => setClassesTaken(e.detail || []);
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        try { setClassesTaken(JSON.parse(e.newValue || "[]")); } catch { setClassesTaken([]); }
      }
    };
    window.addEventListener(BUS_EVENT, onBus);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(BUS_EVENT, onBus);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return { classesTaken, addClass, removeClass, clearClasses, isTaken };
}

// drop in wrapper so you do not refactor pages
export function withClassesTakenProps(Component) {
  return function Wrapped(props) {
    const s = useClassesTakenStore();
    return (
      <Component
        {...props}
        classesTaken={s.classesTaken}
        onAddClass={s.addClass}
        onDeleteClass={s.removeClass}
        clearClasses={s.clearClasses}
        isTaken={s.isTaken}
      />
    );
  };
}

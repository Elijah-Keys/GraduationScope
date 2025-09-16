import React, { createContext, useEffect, useState, useCallback } from "react";

export const PremiumContext = createContext({ premium: false, loading: true });

export function PremiumProvider({ children }) {
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/user-status");
      const data = await r.json();
      setPremium(!!data.active);
    } catch {
      setPremium(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <PremiumContext.Provider value={{ premium, loading, refresh }}>
      {children}
    </PremiumContext.Provider>
  );
}

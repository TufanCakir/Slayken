import { useCallback } from "react";

export function useDamage() {
  const calculateDamage = useCallback((params) => {
    const { attack, defense = 0 } = params;
    // Einfaches Beispiel: Angriff - 1.5-fache Verteidigung, mindestens 1 Schaden
    const rawDamage = attack - defense * 1.5;
    const finalDamage = Math.max(1, Math.floor(rawDamage));
    return finalDamage;
  }, []);

  return {
    calculateDamage,
  };
}

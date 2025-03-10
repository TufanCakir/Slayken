import { useState, useCallback, useEffect, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useGiftBoxLogic = (gifts, onClaim) => {
  // Statt einem booleschen Wert speichern wir hier ein Objekt, das pro Geschenk (Index) den Claim-Status ablegt.
  const [claimed, setClaimed] = useState({});

  // Erzeuge einen Storage-Key basierend auf den angebotenen Geschenken.
  const storageKey = useMemo(() => {
    return `gift_claimed_${JSON.stringify(gifts)}`;
  }, [gifts]);

  // Lade den Claim-Status beim Mounten aus AsyncStorage
  useEffect(() => {
    const loadClaimState = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(storageKey);
        if (storedValue) {
          setClaimed(JSON.parse(storedValue));
        } else {
          // Falls kein Status gespeichert ist, initialisieren wir alle als nicht beansprucht
          const initialStatus = gifts.reduce((acc, _gift, index) => {
            acc[index] = false;
            return acc;
          }, {});
          setClaimed(initialStatus);
        }
      } catch (error) {
        console.error("Fehler beim Laden des Claim-Status:", error);
      }
    };
    loadClaimState();
  }, [storageKey, gifts]);

  // Funktion, um ein einzelnes Geschenk zu beanspruchen
  const handleClaimGift = useCallback(
    async (index) => {
      if (!claimed[index]) {
        // Beanspruche nur das einzelne Geschenk (als Array, um Kompatibilität mit onClaim zu wahren)
        onClaim([gifts[index]]);
        const newClaimed = { ...claimed, [index]: true };
        setClaimed(newClaimed);
        try {
          await AsyncStorage.setItem(storageKey, JSON.stringify(newClaimed));
        } catch (error) {
          console.error("Fehler beim Speichern des Claim-Status:", error);
        }
      }
    },
    [claimed, gifts, onClaim, storageKey]
  );

  return { claimed, handleClaimGift };
};

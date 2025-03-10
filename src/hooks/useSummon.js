import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PLAYERS_URL =
  "https://raw.githubusercontent.com/TufanCakir/slayken-assets/main/players.json";

// useSummonLogic-Hook
export function useSummonLogic() {
  const [crystals, setCrystals] = useState(100);
  // Gesamte Historie:
  const [summonedPlayers, setSummonedPlayers] = useState([]);
  // Letzter Summon:
  const [latestSummoned, setLatestSummoned] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playersPool, setPlayersPool] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedCrystals = await AsyncStorage.getItem("crystals");
        const storedSummons = await AsyncStorage.getItem("summonedPlayers");
        const storedLatestSummons = await AsyncStorage.getItem(
          "latestSummoned"
        );

        if (storedCrystals !== null) {
          setCrystals(parseInt(storedCrystals, 10));
        }
        if (storedSummons !== null) {
          setSummonedPlayers(JSON.parse(storedSummons));
        }
        if (storedLatestSummons !== null) {
          setLatestSummoned(JSON.parse(storedLatestSummons));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    const fetchPlayersPool = async () => {
      try {
        const response = await fetch(PLAYERS_URL);
        const data = await response.json();
        setPlayersPool(data);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    loadData();
    fetchPlayersPool();
  }, []);

  // Pickt zufällig einen Spieler aus dem Pool.
  const summonCharacter = () => {
    if (playersPool.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * playersPool.length);
    return playersPool[randomIndex];
  };

  // Single Summon (1 Spieler):
  // - zieht 5 Kristalle ab
  // - updated den State & speichert in AsyncStorage
  const handleSingleSummon = async () => {
    if (crystals < 5) {
      alert("Nicht genügend Crystals!");
      return;
    }
    setLoading(true);

    const newPlayer = summonCharacter();
    if (newPlayer) {
      // 1) Gesamte Historie updaten
      const updatedAll = [...summonedPlayers, newPlayer];
      setSummonedPlayers(updatedAll);
      await AsyncStorage.setItem("summonedPlayers", JSON.stringify(updatedAll));

      // 2) "Letzter Summon" nur dieser eine Spieler
      setLatestSummoned([newPlayer]);
      await AsyncStorage.setItem("latestSummoned", JSON.stringify([newPlayer]));

      // 3) Kristalle abziehen
      const newCrystals = crystals - 5;
      setCrystals(newCrystals);
      await AsyncStorage.setItem("crystals", String(newCrystals));
    }
    setLoading(false);
  };

  // Multi Summon (10 Spieler):
  // - zieht 50 Kristalle ab
  // - updated den State & speichert in AsyncStorage
  const handleMultiSummon = async () => {
    if (crystals < 50) {
      alert("Nicht genügend Crystals!");
      return;
    }
    setLoading(true);

    const newPlayers = [];
    for (let i = 0; i < 10; i++) {
      const player = summonCharacter();
      if (player) {
        newPlayers.push(player);
      }
    }

    // 1) Gesamte Historie updaten
    const updatedAll = [...summonedPlayers, ...newPlayers];
    setSummonedPlayers(updatedAll);
    await AsyncStorage.setItem("summonedPlayers", JSON.stringify(updatedAll));

    // 2) "Letzter Summon" nur die neuen 10 Spieler
    setLatestSummoned(newPlayers);
    await AsyncStorage.setItem("latestSummoned", JSON.stringify(newPlayers));

    // 3) Kristalle abziehen
    const newCrystals = crystals - 50;
    setCrystals(newCrystals);
    await AsyncStorage.setItem("crystals", String(newCrystals));

    setLoading(false);
  };

  return {
    crystals,
    summonedPlayers,
    latestSummoned,
    loading,
    handleSingleSummon,
    handleMultiSummon,
  };
}

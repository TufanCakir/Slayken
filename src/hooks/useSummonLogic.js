import { useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CrystalsContext } from "../context/CrystalsContext";

const PLAYERS_URL =
  "https://raw.githubusercontent.com/TufanCakir/slayken-assets/main/players.json";
const SUMMONED_PLAYERS_KEY = "summonedPlayers";
const LATEST_SUMMONED_KEY = "latestSummoned";

export function useSummonLogic() {
  // Verwende den globalen CrystalsContext für Crystals
  const { crystals, setCrystals } = useContext(CrystalsContext);
  const [playersPool, setPlayersPool] = useState([]);
  const [summonedPlayers, setSummonedPlayers] = useState([]);
  const [latestSummoned, setLatestSummoned] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lade initiale Daten: Spieler-Pool, sowie bisherige Summons
  useEffect(() => {
    const loadData = async () => {
      try {
        // Spieler laden
        const response = await fetch(PLAYERS_URL);
        const data = await response.json();
        if (Array.isArray(data)) {
          setPlayersPool(data);
        } else {
          console.error("Unerwartetes Format der Spieler-Daten.");
        }

        // Gesamte Summons laden
        const storedSummons = await AsyncStorage.getItem(SUMMONED_PLAYERS_KEY);
        if (storedSummons) {
          setSummonedPlayers(JSON.parse(storedSummons));
        }

        // Letzten Summon laden
        const storedLatest = await AsyncStorage.getItem(LATEST_SUMMONED_KEY);
        if (storedLatest) {
          setLatestSummoned(JSON.parse(storedLatest));
        }
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Wählt zufällig einen Spieler aus dem Pool aus.
  const summonCharacter = () => {
    if (playersPool.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * playersPool.length);
    return playersPool[randomIndex];
  };

  // Hilfsfunktion zum Speichern der Summon-Historie.
  const persistData = async (newSummonedPlayers, newLatestSummoned) => {
    try {
      await AsyncStorage.setItem(
        SUMMONED_PLAYERS_KEY,
        JSON.stringify(newSummonedPlayers)
      );
      await AsyncStorage.setItem(
        LATEST_SUMMONED_KEY,
        JSON.stringify(newLatestSummoned)
      );
    } catch (error) {
      console.error("Fehler beim Speichern der Daten:", error);
    }
  };

  /**
   * Single Summon: Beschwört 1 zufälligen Charakter (5 Crystals)
   */
  const handleSingleSummon = async () => {
    if (crystals < 5) {
      alert("Nicht genügend Crystals! Du benötigst mindestens 5 Crystals.");
      return false;
    }
    setLoading(true);
    const newPlayer = summonCharacter();
    if (newPlayer) {
      const newLatestSummoned = [newPlayer];
      const newSummonedPlayers = [...summonedPlayers, newPlayer];
      const newCrystals = crystals - 5;

      setLatestSummoned(newLatestSummoned);
      setSummonedPlayers(newSummonedPlayers);
      setCrystals(newCrystals);

      await persistData(newSummonedPlayers, newLatestSummoned);
    }
    setLoading(false);
    return true;
  };

  /**
   * Multi Summon: Beschwört 10 zufällige Charaktere (50 Crystals)
   */
  const handleMultiSummon = async () => {
    if (crystals < 50) {
      alert("Nicht genügend Crystals! Du benötigst mindestens 50 Crystals.");
      return false;
    }
    setLoading(true);

    let newPlayers = [];
    if (playersPool.length >= 10) {
      // Kopiere und mische den Pool
      const shuffledPool = [...playersPool].sort(() => 0.5 - Math.random());
      newPlayers = shuffledPool.slice(0, 10);
    } else {
      // Falls der Pool weniger als 10 Spieler enthält, wähle 10 zufällige (mögliche Duplikate)
      for (let i = 0; i < 10; i++) {
        const player = summonCharacter();
        if (player) {
          newPlayers.push(player);
        }
      }
    }

    const newSummonedPlayers = [...summonedPlayers, ...newPlayers];
    const newCrystals = crystals - 50;

    setLatestSummoned(newPlayers);
    setSummonedPlayers(newSummonedPlayers);
    setCrystals(newCrystals);

    await persistData(newSummonedPlayers, newPlayers);
    setLoading(false);
    return true;
  };

  return {
    playersPool,
    crystals,
    summonedPlayers,
    latestSummoned,
    loading,
    handleSingleSummon,
    handleMultiSummon,
  };
}

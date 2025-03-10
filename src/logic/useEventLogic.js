import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { useDamage } from "../hooks/useDamage";
import { CoinsContext } from "../context/CoinsContext";
import { CrystalsContext } from "../context/CrystalsContext";

// Hilfsfunktion: Gibt ein zufälliges Element aus einem Array zurück
function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function useEventLogic() {
  const { calculateDamage } = useDamage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [eventBosses, setEventBosses] = useState([]);
  const [players, setPlayers] = useState([]);

  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventHp, setEventHp] = useState(0);

  // Spielerwerte: Anfangswerte
  const [playerAttack, setPlayerAttack] = useState(10);
  const [playerDefense, setPlayerDefense] = useState(5);

  const [eventCount, setEventCount] = useState(0);

  // Coins und Crystals aus den jeweiligen Contexts
  const { coins, setCoins } = useContext(CoinsContext);
  const { crystals, setCrystals } = useContext(CrystalsContext);

  // URLs für die Daten
  const eventBossesUrl =
    "https://raw.githubusercontent.com/TufanCakir/slayken-assets/refs/heads/main/eventBoss.json";
  const playersUrl =
    "https://raw.githubusercontent.com/TufanCakir/slayken-assets/refs/heads/main/players.json";

  useEffect(() => {
    async function loadEventData() {
      try {
        // Lade die Eventboss-Daten von der URL
        const bossRes = await fetch(eventBossesUrl);
        if (!bossRes.ok) {
          throw new Error("Eventboss-Daten nicht erreichbar.");
        }
        const bossesData = await bossRes.json();
        setEventBosses(bossesData);

        // Lade die Spieler-Daten
        const playerRes = await fetch(playersUrl);
        if (!playerRes.ok) {
          throw new Error("Spieler-Daten nicht erreichbar.");
        }
        const playersData = await playerRes.json();
        setPlayers(playersData);
        if (playersData.length > 0) {
          const firstPlayer = playersData[0];
          if (firstPlayer.attack) setPlayerAttack(firstPlayer.attack);
          if (firstPlayer.defense) setPlayerDefense(firstPlayer.defense);
        }

        // Setze den aktuellen Eventboss, falls vorhanden
        if (bossesData.length > 0) {
          const initialBoss = getRandomItem(bossesData);
          setCurrentEvent(initialBoss);
          // Starte mit 100 HP für den ersten Boss
          setEventHp(100);
        }
      } catch (err) {
        console.error("Error loading event data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    loadEventData();
  }, [eventBossesUrl, playersUrl]);

  // Jeder neue Eventboss erhält ab dem ersten 100 HP plus 100 pro besiegtem Boss
  const spawnNextEvent = useCallback(
    (count) => {
      if (eventBosses.length === 0) return;
      const randomBoss = getRandomItem(eventBosses);
      const scaledHp = 100 + 100 * count;
      setCurrentEvent({ ...randomBoss, hp: scaledHp });
      setEventHp(scaledHp);
    },
    [eventBosses]
  );

  // Bei jeder Aktion wird der Schaden berechnet.
  // Wenn der Boss besiegt wird, erhöht sich der Angriff des Spielers,
  // Belohnungen werden hinzugefügt und ein neuer Boss wird gespawnt.
  const handleAction = useCallback(
    (damage) => {
      if (!currentEvent) return;

      const actualDamage = calculateDamage({ attack: damage, defense: 0 });
      const newHp = Math.max(0, eventHp - actualDamage);
      setEventHp(newHp);

      if (newHp === 0) {
        const coinReward =
          currentEvent.coinReward != null ? currentEvent.coinReward : 10;
        const crystalReward =
          currentEvent.crystalReward != null ? currentEvent.crystalReward : 1;

        setCoins((prev) => prev + coinReward);
        setCrystals((prev) => prev + crystalReward);
        setPlayerAttack((prev) => prev + 10);
        setEventCount((prevCount) => {
          const newCount = prevCount + 1;
          spawnNextEvent(newCount);
          return newCount;
        });
      }
    },
    [
      currentEvent,
      eventHp,
      calculateDamage,
      spawnNextEvent,
      setCoins,
      setCrystals,
    ]
  );

  const effectivePlayerAttack = useMemo(() => playerAttack, [playerAttack]);

  const handleNextPlayer = useCallback(() => {
    console.log("handleNextPlayer: not implemented");
  }, []);

  const handlePrevPlayer = useCallback(() => {
    console.log("handlePrevPlayer: not implemented");
  }, []);

  return {
    loading,
    error,
    currentEvent,
    eventHp,
    playerAttack: effectivePlayerAttack,
    playerDefense,
    coins,
    crystals,
    handleAction,
    handleNextPlayer,
    handlePrevPlayer,
  };
}

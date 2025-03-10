import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { useDamage } from "../hooks/useDamage";
import { CoinsContext } from "../context/CoinsContext";
import { CrystalsContext } from "../context/CrystalsContext";

// Hilfsfunktion: Gibt ein zufälliges Element aus einem Array zurück
function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function useBattleLogic() {
  const { calculateDamage } = useDamage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [backgrounds, setBackgrounds] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [players, setPlayers] = useState([]);

  const [currentBackground, setCurrentBackground] = useState(null);
  const [currentEnemy, setCurrentEnemy] = useState(null);
  const [enemyHp, setEnemyHp] = useState(0);

  // Spielerwerte: Anfangswerte
  const [playerAttack, setPlayerAttack] = useState(10);
  const [playerDefense, setPlayerDefense] = useState(5);

  const [enemyCount, setEnemyCount] = useState(0);

  // Coins und Crystals aus den jeweiligen Contexts
  const { coins, setCoins } = useContext(CoinsContext);
  const { crystals, setCrystals } = useContext(CrystalsContext);

  const backgroundsUrl =
    "https://raw.githubusercontent.com/TufanCakir/slayken-assets/refs/heads/main/backgrounds.json";
  const enemiesUrl =
    "https://raw.githubusercontent.com/TufanCakir/slayken-assets/refs/heads/main/enemies.json";
  const playersUrl =
    "https://raw.githubusercontent.com/TufanCakir/slayken-assets/refs/heads/main/players.json";

  useEffect(() => {
    async function loadBattleData() {
      try {
        const [bgRes, enemyRes, playerRes] = await Promise.all([
          fetch(backgroundsUrl),
          fetch(enemiesUrl),
          fetch(playersUrl),
        ]);

        if (!bgRes.ok || !enemyRes.ok || !playerRes.ok) {
          throw new Error(
            "Ein oder mehrere Datenquellen sind nicht erreichbar."
          );
        }

        const backgroundsData = await bgRes.json();
        const enemiesData = await enemyRes.json();
        const playersData = await playerRes.json();

        setBackgrounds(backgroundsData);
        setEnemies(enemiesData);
        setPlayers(playersData);

        if (backgroundsData.length > 0) {
          setCurrentBackground(getRandomItem(backgroundsData));
        }

        if (enemiesData.length > 0) {
          // Starte mit 100 HP für den ersten Gegner
          setCurrentEnemy(getRandomItem(enemiesData));
          setEnemyHp(100);
        }

        if (playersData.length > 0) {
          const firstPlayer = playersData[0];
          if (firstPlayer.attack) setPlayerAttack(firstPlayer.attack);
          if (firstPlayer.defense) setPlayerDefense(firstPlayer.defense);
        }
      } catch (err) {
        console.error("Error loading battle data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    loadBattleData();
  }, []);

  // Jeder neue Gegner erhält ab dem ersten 100 HP plus 100 pro besiegtem Gegner
  const spawnNextEnemy = useCallback(
    (count) => {
      if (enemies.length === 0) return;
      const randomEnemy = getRandomItem(enemies);
      const scaledHp = 100 + 100 * count;
      setCurrentEnemy({ ...randomEnemy, hp: scaledHp });
      setEnemyHp(scaledHp);
    },
    [enemies]
  );

  const spawnNextBackground = useCallback(() => {
    if (backgrounds.length === 0) return;
    setCurrentBackground(getRandomItem(backgrounds));
  }, [backgrounds]);

  // Bei jedem Angriff wird der Schaden berechnet.
  // Wenn der Gegner besiegt wird, erhöht sich der Angriff des Spielers,
  // Belohnungen werden hinzugefügt und ein neuer Gegner wird gespawnt.
  const handleAttack = useCallback(
    (damage) => {
      if (!currentEnemy) return;

      const actualDamage = calculateDamage({ attack: damage, defense: 0 });
      const newHp = Math.max(0, enemyHp - actualDamage);

      setEnemyHp(newHp);

      if (newHp === 0) {
        const coinReward =
          currentEnemy.coinReward != null ? currentEnemy.coinReward : 10;
        const crystalReward =
          currentEnemy.crystalReward != null ? currentEnemy.crystalReward : 1;

        setCoins((prev) => prev + coinReward);
        setCrystals((prev) => prev + crystalReward);
        setPlayerAttack((prev) => prev + 10);
        setEnemyCount((prevCount) => {
          const newCount = prevCount + 1;
          spawnNextEnemy(newCount);
          return newCount;
        });
        spawnNextBackground();
      }
    },
    [
      currentEnemy,
      enemyHp,
      calculateDamage,
      spawnNextEnemy,
      spawnNextBackground,
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
    currentBackground,
    currentEnemy,
    enemyHp,
    playerAttack: effectivePlayerAttack,
    playerDefense,
    coins,
    crystals,
    handleAttack,
    handleNextPlayer,
    handlePrevPlayer,
  };
}

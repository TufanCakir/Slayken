// src/screens/BattleScreen.js
import React, { useEffect, useCallback, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useBattleLogic } from "../logic/useBattleLogic";
import { useTeam } from "../hooks/useTeam";
import { CoinsContext } from "../context/CoinsContext";
import { CrystalsContext } from "../context/CrystalsContext";
import { useAccount } from "../context/AccountContext";
import { prefetchImages } from "../helpers/prefetchImages";

import BattleStartModal from "../components/BattleStartModal";
import BattleContent from "../components/BattleContent";
import { useNavigation } from "@react-navigation/native";

export default function BattleScreen() {
  const navigation = useNavigation();
  const {
    currentEnemy,
    currentBackground,
    enemyHp,
    handleAttack,
    playerAttack,
  } = useBattleLogic();
  const { coins } = useContext(CoinsContext);
  const { crystals } = useContext(CrystalsContext);
  const { team, currentFighter, handleSelectFighter } = useTeam();
  const { incrementLevel } = useAccount();

  // Lokaler State
  const [battleStarted, setBattleStarted] = useState(false);
  const [lastDamage, setLastDamage] = useState(0);
  const [hasLeveled, setHasLeveled] = useState(false);

  // Bilder vorladen
  useEffect(() => {
    const fighterImg = currentFighter?.imageNoBg || currentFighter?.image;
    prefetchImages([
      currentBackground?.image,
      currentEnemy?.imageNoBg,
      fighterImg,
    ]);
  }, [currentBackground, currentEnemy, currentFighter]);

  // Angriff auslösen
  const onScreenTap = useCallback(() => {
    if (!currentEnemy) return;
    console.log("Angriff gestartet mit Schaden:", playerAttack);
    setLastDamage(playerAttack);
    handleAttack(playerAttack);
  }, [currentEnemy, playerAttack, handleAttack]);

  // Kampfstart: Jetzt wird der Kampf direkt gestartet
  const handleBattleStart = useCallback(() => {
    setBattleStarted(true);
  }, []);

  // Speichern der Kampfdaten in AsyncStorage
  const saveBattleData = useCallback(async (data) => {
    try {
      await AsyncStorage.setItem("battleData", JSON.stringify(data));
      console.log("Kampfdaten gespeichert:", data);
    } catch (error) {
      console.error("Fehler beim Speichern der Kampfdaten:", error);
    }
  }, []);

  useEffect(() => {
    const data = {
      enemyHp,
      currentEnemyId: currentEnemy?.id || null,
      currentFighterId: currentFighter?.id || null,
    };
    console.log("Speichere Kampfdaten (ohne Währungen):", data);
    saveBattleData(data);
  }, [enemyHp, currentEnemy, currentFighter, saveBattleData]);

  useEffect(() => {
    const loadBattleData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("battleData");
        if (storedData) {
          console.log("Geladene Kampfdaten:", JSON.parse(storedData));
        }
      } catch (error) {
        console.error("Fehler beim Laden der Kampfdaten:", error);
      }
    };
    loadBattleData();
  }, []);

  // Level-Up Logik
  useEffect(() => {
    if (currentEnemy && enemyHp <= 0 && !hasLeveled) {
      console.log("Gegner besiegt! Erhöhe Account-Level.");
      incrementLevel();
      setHasLeveled(true);
    }
  }, [enemyHp, currentEnemy, hasLeveled, incrementLevel]);

  useEffect(() => {
    setHasLeveled(false);
  }, [currentEnemy]);

  // Hier wird nicht mehr geprüft, ob ein Team ausgewählt ist.
  // Übergabe der benötigten Props an die Kind-Komponenten
  return battleStarted ? (
    <BattleContent
      currentBackground={currentBackground}
      currentEnemy={currentEnemy}
      enemyHp={enemyHp}
      enemyMaxHp={currentEnemy?.maxHp || 100}
      lastDamage={lastDamage}
      currentFighter={currentFighter}
      team={team}
      coins={coins}
      crystals={crystals}
      onScreenTap={onScreenTap}
      onSelectFighter={handleSelectFighter}
    />
  ) : (
    <BattleStartModal onStartBattle={handleBattleStart} />
  );
}

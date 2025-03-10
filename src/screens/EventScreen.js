// src/screens/EventScreen.js
import React, { useEffect, useCallback, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useEventLogic } from "../logic/useEventLogic"; // Angepasster Hook
import { useTeam } from "../hooks/useTeam";
import { CoinsContext } from "../context/CoinsContext";
import { CrystalsContext } from "../context/CrystalsContext";
import { useAccount } from "../context/AccountContext";
import { prefetchImages } from "../helpers/prefetchImages";

import EventStartModal from "../components/EventStartModal"; // Angepasste Komponente
import EventContent from "../components/EventContent"; // Angepasste Komponente
import { useNavigation } from "@react-navigation/native";

export default function EventScreen() {
  const navigation = useNavigation();
  const {
    currentEvent,
    currentBackground,
    eventHp,
    handleAction,
    playerAttack,
  } = useEventLogic();

  const { coins } = useContext(CoinsContext);
  const { crystals } = useContext(CrystalsContext);
  const { team, currentFighter, handleSelectFighter } = useTeam();
  const { incrementLevel } = useAccount();

  // Lokaler State
  const [eventStarted, setEventStarted] = useState(false);
  const [lastDamage, setLastDamage] = useState(0);
  const [hasLeveled, setHasLeveled] = useState(false);

  // Bilder vorladen
  useEffect(() => {
    const fighterImg = currentFighter?.imageNoBg || currentFighter?.image;
    prefetchImages([
      currentBackground?.image,
      currentEvent?.imageNoBg,
      fighterImg,
    ]);
  }, [currentBackground, currentEvent, currentFighter]);

  // Aktion auslösen
  const onScreenTap = useCallback(() => {
    if (!currentEvent) return;
    console.log("Aktion gestartet mit Schaden:", playerAttack);
    setLastDamage(playerAttack);
    handleAction(playerAttack);
  }, [currentEvent, playerAttack, handleAction]);

  // Eventstart: Jetzt wird das Event direkt gestartet
  const handleEventStart = useCallback(() => {
    setEventStarted(true);
  }, []);

  // Speichern der Eventdaten in AsyncStorage
  const saveEventData = useCallback(async (data) => {
    try {
      await AsyncStorage.setItem("eventData", JSON.stringify(data));
      console.log("Eventdaten gespeichert:", data);
    } catch (error) {
      console.error("Fehler beim Speichern der Eventdaten:", error);
    }
  }, []);

  useEffect(() => {
    const data = {
      eventHp,
      currentEventId: currentEvent?.id || null,
      currentFighterId: currentFighter?.id || null,
    };
    console.log("Speichere Eventdaten (ohne Währungen):", data);
    saveEventData(data);
  }, [eventHp, currentEvent, currentFighter, saveEventData]);

  useEffect(() => {
    const loadEventData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("eventData");
        if (storedData) {
          console.log("Geladene Eventdaten:", JSON.parse(storedData));
        }
      } catch (error) {
        console.error("Fehler beim Laden der Eventdaten:", error);
      }
    };
    loadEventData();
  }, []);

  // Level-Up Logik
  useEffect(() => {
    if (currentEvent && eventHp <= 0 && !hasLeveled) {
      console.log("Event abgeschlossen! Erhöhe Account-Level.");
      incrementLevel();
      setHasLeveled(true);
    }
  }, [eventHp, currentEvent, hasLeveled, incrementLevel]);

  useEffect(() => {
    setHasLeveled(false);
  }, [currentEvent]);

  // Übergabe der benötigten Props an die Kind-Komponenten
  return eventStarted ? (
    <EventContent
      currentBackground={currentBackground}
      currentEvent={currentEvent}
      enemyHp={eventHp}
      eventMaxHp={currentEvent?.maxHp || 100}
      lastDamage={lastDamage}
      currentFighter={currentFighter}
      team={team}
      coins={coins}
      crystals={crystals}
      onScreenTap={onScreenTap}
      onSelectFighter={handleSelectFighter}
    />
  ) : (
    <EventStartModal onStartEvent={handleEventStart} />
  );
}

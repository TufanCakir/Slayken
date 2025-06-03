// Datei: screens/EventScreen.js
import { useState, useEffect, useCallback, useRef } from "react";
import { View, StatusBar, StyleSheet } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useThemeContext } from "../context/ThemeContext";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useTeam } from "../context/TeamContext";

import eventsData from "../data/eventsData.json";
import { difficultyLevels } from "../constants/battleConstants";
import { calculateXpReward } from "../utils/xpUtils";

import EventList from "../components/EventList";
import BattleView from "../components/BattleView";
import ScreenshotModal from "../components/ScreenshotModal";

// Konstante Belohnungen
const COIN_REWARD = 100;
const CRYSTAL_REWARD = 30;

export default function EventScreen() {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const { addXp } = useAccountLevel();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { activeMemberId, addXpToMember } = useTeam();

  const [unlockedItemIds, setUnlockedItemIds] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [hp, setHp] = useState(100);
  const [bossDefeated, setBossDefeated] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [difficultyKey, setDifficultyKey] = useState(difficultyLevels[0].key);

  const [screenshotUri, setScreenshotUri] = useState(null);
  const viewShotRef = useRef(null);

  // Berechnete Belohnungen
  const xpReward = selectedEvent
    ? calculateXpReward(selectedEvent.eventName, difficultyKey)
    : 0;
  const coinReward = 100;
  const crystalReward = 5;

  // Alle bisher freigeschalteten Item-IDs aus AsyncStorage laden
  const loadUnlocked = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const itemKeys = keys.filter((k) => k.startsWith("unlocked_item_"));
      setUnlockedItemIds(itemKeys.map((k) => k.replace("unlocked_item_", "")));
    } catch (e) {
      console.error("Fehler beim Laden der freigeschalteten Items:", e);
    }
  }, []);

  useEffect(() => {
    loadUnlocked();
  }, [loadUnlocked]);

  useFocusEffect(
    useCallback(() => {
      loadUnlocked();
    }, [loadUnlocked])
  );

  // Bei jedem Kampf-Tap den Boss-Hp reduzieren, und erst bei 0 „Sieg“ auslösen
  const handleFight = useCallback(() => {
    const remaining = hp - 30;

    if (remaining <= 0 && selectedEvent) {
      setHp(0);
      setBossDefeated(true);

      // Belohnungen vergeben
      addCoins(coinReward);
      addCrystals(crystalReward);
      addXp(xpReward);

      if (activeMemberId) {
        addXpToMember(activeMemberId, xpReward);
      }

      navigation.navigate("VictoryScreen", {
        coinReward: COIN_REWARD,
        crystalReward: CRYSTAL_REWARD,
        xpReward,
        characterId: activeMemberId,
        isEvent: true,
      });
    } else {
      setHp(remaining);
    }
  }, [
    hp,
    selectedEvent,
    addCoins,
    addCrystals,
    addXp,
    xpReward,
    coinReward,
    crystalReward,
    addXpToMember, // anstelle von team.forEach
    navigation,
  ]);

  // Nur solche Events anzeigen, für die das Unlock-Item freigeschaltet ist
  const availableEvents = eventsData.filter((e) =>
    unlockedItemIds.includes(String(e.unlockItemId))
  );

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setHp(100);
    setBossDefeated(false);
    setScreenshotUri(null);
  }, []);

  const takeScreenshot = useCallback(async () => {
    if (!viewShotRef.current) return;
    try {
      const uri = await viewShotRef.current.capture();
      setScreenshotUri(uri);
    } catch (e) {
      console.error("Fehler beim Screenshot:", e);
    }
  }, []);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.backgroundColor}
      />

      {selectedEvent ? (
        <BattleView
          viewShotRef={viewShotRef}
          selectedEvent={selectedEvent}
          difficultyKey={difficultyKey}
          setDifficultyKey={setDifficultyKey}
          tabIndex={tabIndex}
          setTabIndex={setTabIndex}
          hp={hp}
          xpReward={xpReward} // bereits hinzugefügt
          bossDefeated={bossDefeated}
          handleFight={handleFight}
          onBack={() => {
            setSelectedEvent(null);
            setScreenshotUri(null);
          }}
          takeScreenshot={takeScreenshot}
        />
      ) : (
        <EventList
          availableEvents={availableEvents}
          viewShotRef={viewShotRef}
          onSelectEvent={handleSelectEvent}
          takeScreenshot={takeScreenshot}
        />
      )}

      <ScreenshotModal
        screenshotUri={screenshotUri}
        onClose={() => setScreenshotUri(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

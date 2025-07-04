import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useThemeContext } from "../context/ThemeContext";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useClass } from "../context/ClassContext";
import { useLevelSystem } from "../hooks/useLevelSystem";
import { useAssets } from "../context/AssetsContext";

import eventData from "../data/eventData.json";
import classData from "../data/classData.json";

import EventList from "../components/EventList";
import BattleView from "../components/BattleView";
import { Image } from "expo-image";

import { getClassImageUrl } from "../utils/classUtils";
import { calculateSkillDamage } from "../utils/combatUtils";
import { getCharacterStatsWithEquipment } from "../utils/combat/statUtils";

// Helper
const getEventBossKey = (url) => {
  if (!url) return null;
  const match = /\/([\w-]+)\.png$/i.exec(url);
  return match ? "eventboss_" + match[1].toLowerCase() : null;
};

const getBackgroundKey = (url) => {
  if (!url) return null;
  const match = /\/([\w-]+)\.png$/i.exec(url);
  return match ? "bg_" + match[1].toLowerCase() : null;
};

const tabOptions = [
  { key: "special", label: "Spezial" },
  { key: "recommended", label: "Empfohlen" },
  { key: "raid", label: "Überfall" },
  { key: "skill", label: "Fähigkeit" },
];

export default function EventScreen() {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const { addXp } = useAccountLevel();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { classList, addCharacter, activeClassId, updateCharacter } =
    useClass();
  const { gainExp } = useLevelSystem();

  const activeCharacter = classList.find((c) => c.id === activeClassId);
  const [activeTab, setActiveTab] = useState("special");
  const [unlockedItemIds, setUnlockedItemIds] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bossHp, setBossHp] = useState(null);
  const [bossDefeated, setBossDefeated] = useState(false);

  // Modal states
  const [reward, setReward] = useState(null);
  const [modalStep, setModalStep] = useState(null);

  // Unlocked Items
  const loadUnlocked = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const itemKeys = keys.filter((k) => k.startsWith("unlocked_item_"));
      setUnlockedItemIds(itemKeys.map((k) => k.replace("unlocked_item_", "")));
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUnlocked();
    }, [loadUnlocked])
  );

  // Events filtern
  const availableEvents = eventData
    .filter((e) => e.tag === activeTab)
    .map((e) => {
      const bossKey = getEventBossKey(e.image);
      const bgKey = getBackgroundKey(e.background);
      return {
        ...e,
        image: bossKey && imageMap[bossKey] ? imageMap[bossKey] : e.image,
        background: bgKey && imageMap[bgKey] ? imageMap[bgKey] : e.background,
      };
    });

  useEffect(() => {
    if (selectedEvent) {
      setBossHp(selectedEvent.maxHp ?? 200);
      setBossDefeated(false);
    }
  }, [selectedEvent]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  function handleFight(skill) {
    console.log("handleFight called with skill:", skill);
    if (!activeCharacter || bossDefeated || !selectedEvent) return;
    const { stats: charStats, percentBonuses } =
      getCharacterStatsWithEquipment(activeCharacter);
    const skillPower = skill?.power ?? selectedEvent.skillDmg ?? 30;
    const damage = calculateSkillDamage({
      charStats,
      percentBonuses,
      skill: { skillDmg: skillPower },
      enemyDefense: selectedEvent.bossDefense || 0,
    });

    setBossHp((prev) => {
      const newHp = Math.max(prev - damage, 0);
      if (newHp === 0) setBossDefeated(true);
      return newHp;
    });
  }

  useEffect(() => {
    if (bossDefeated && selectedEvent && activeCharacter) {
      const expReward = selectedEvent.expReward ?? 120;
      const accountExpReward = selectedEvent.accountExpReward ?? 100;
      const coinReward = selectedEvent.coinReward ?? 100;
      const crystalReward = selectedEvent.crystalReward ?? 30;

      addCoins(coinReward);
      addCrystals(crystalReward);
      addXp(accountExpReward);
      const updatedChar = gainExp(activeCharacter, expReward);
      updateCharacter(updatedChar);

      // --------- Skin als Event-Reward freischalten ---------
      if (selectedEvent.rewardSkinId || selectedEvent.unlockItemId) {
        const skinId = selectedEvent.rewardSkinId || selectedEvent.unlockItemId;
        AsyncStorage.setItem(`unlock_skin_${skinId}`, "true").then(() => {
          setReward({ type: "skin", skinId }); // Hier kannst du Modal/Toast nutzen
        });
      }

      (async () => {
        let newCharacter = null;
        if (
          selectedEvent.rewardCharacterId &&
          !classList.some((c) =>
            [c.baseId, c.id].includes(selectedEvent.rewardCharacterId)
          )
        ) {
          const baseChar = classData.find(
            (c) => c.id === selectedEvent.rewardCharacterId
          );
          if (baseChar) {
            newCharacter = {
              ...baseChar,
              baseId: baseChar.id,
              id: `${baseChar.id}-${Date.now()}`,
              label: baseChar.label,
              name: baseChar.label,
              level: 1,
              exp: 0,
              skills: baseChar.skills ?? [],
              classUrl: getClassImageUrl(baseChar.id),
            };
            await addCharacter(newCharacter);
          }
        }

        navigation.navigate("VictoryScreen", {
          coinReward,
          crystalReward,
          character: updatedChar,
          isEvent: true,
          newCharacter,
          skinId:
            selectedEvent.rewardSkinId || selectedEvent.unlockItemId || null,
        });
      })();
    }
  }, [bossDefeated]);

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {selectedEvent?.background && (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={selectedEvent.background}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={400}
          />
          <View style={StyleSheet.absoluteFillObject} />
        </View>
      )}

      {!selectedEvent && (
        <View style={styles.stickyHeader}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {tabOptions.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.tab,
                  activeTab === tab.key && [
                    styles.activeTab,
                    { backgroundColor: theme.borderGlowColor },
                  ],
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && { color: theme.accentColor },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedEvent ? (
        <BattleView
          selectedEvent={selectedEvent}
          bossHp={bossHp}
          bossDefeated={bossDefeated}
          handleFight={handleFight}
          onBack={() => setSelectedEvent(null)}
          character={activeCharacter}
          imageMap={imageMap}
          visible={!!selectedEvent}
        />
      ) : (
        <EventList
          availableEvents={availableEvents}
          onSelectEvent={handleSelectEvent}
          imageMap={imageMap}
        />
      )}
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1 },
    stickyHeader: {
      zIndex: 10,
      backgroundColor: theme.accentColor,
      paddingTop: 8,
    },
    tabsRow: {
      flexDirection: "row",
      paddingHorizontal: 12,
      gap: 8,
    },
    tab: {
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.shadowColor,
      marginRight: 8,
    },
    activeTab: {
      backgroundColor: theme.borderGlowColor,
    },
    tabText: {
      color: theme.textColor,
      fontSize: 16,
    },
  });
}

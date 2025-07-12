import { useState, useEffect, useCallback, useMemo } from "react";
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
import { LinearGradient } from "expo-linear-gradient";

import eventData from "../data/eventData.json";
import classData from "../data/classData.json";

import EventList from "../components/EventList";
import BattleView from "../components/BattleView";
import { Image } from "expo-image";

import { getClassImageUrl } from "../utils/classUtils";
import { calculateSkillDamage, scaleBossStats } from "../utils/combatUtils";
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
  const [bossMaxHp, setBossMaxHp] = useState(null); // WICHTIG!
  const [bossDefeated, setBossDefeated] = useState(false);

  // Modal states (kannst du später für Rewards weiterverwenden)
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

  // Events filtern + Image-Map
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

  // Skalierter Event-Boss – und MaxHP holen!
  const scaledEvent = useMemo(() => {
    if (!selectedEvent || !activeCharacter) return null;
    return scaleBossStats(selectedEvent, activeCharacter.level || 1);
  }, [selectedEvent, activeCharacter]);

  // Jedes Mal, wenn Event oder Char wechselt: MaxHP und Hp setzen
  useEffect(() => {
    if (scaledEvent) {
      setBossMaxHp(scaledEvent.hp ?? 200);
      setBossHp(scaledEvent.hp ?? 200);
      setBossDefeated(false);
    }
  }, [scaledEvent]);

  // Event-Auswahl-Handler
  const handleSelectEvent = (event) => setSelectedEvent(event);

  // Kampf-Handler: Damage-Berechnung und HP reduzieren
  function handleFight(skill) {
    if (!activeCharacter || bossDefeated || !scaledEvent) return;
    const { stats: charStats, percentBonuses } =
      getCharacterStatsWithEquipment(activeCharacter);
    const skillPower = skill?.power ?? scaledEvent.skillDmg ?? 30;
    const damage = calculateSkillDamage({
      charStats,
      percentBonuses,
      skill: { skillDmg: skillPower },
      enemyDefense: scaledEvent.defense || 0,
    });
    setBossHp((prev) => {
      const newHp = Math.max(prev - damage, 0);
      if (newHp === 0) setBossDefeated(true);
      return newHp;
    });
  }

  // On Boss Defeated: Belohnungen, Rewards, VictoryScreen etc.
  useEffect(() => {
    if (bossDefeated && scaledEvent && activeCharacter) {
      const expReward = scaledEvent.expReward ?? 120;
      const accountExpReward = scaledEvent.accountExpReward ?? 100;
      const coinReward = scaledEvent.coinReward ?? 100;
      const crystalReward = scaledEvent.crystalReward ?? 30;

      addCoins(coinReward);
      addCrystals(crystalReward);
      addXp(accountExpReward);
      const updatedChar = gainExp(activeCharacter, expReward);
      updateCharacter(updatedChar);

      // Skin- oder Item-Reward unlock
      if (scaledEvent.rewardSkinId || scaledEvent.unlockItemId) {
        const skinId = scaledEvent.rewardSkinId || scaledEvent.unlockItemId;
        AsyncStorage.setItem(`unlock_skin_${skinId}`, "true").then(() => {
          setReward({ type: "skin", skinId });
        });
      }

      (async () => {
        let newCharacter = null;
        if (
          scaledEvent.rewardCharacterId &&
          !classList.some((c) =>
            [c.baseId, c.id].includes(scaledEvent.rewardCharacterId)
          )
        ) {
          const baseChar = classData.find(
            (c) => c.id === scaledEvent.rewardCharacterId
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
          skinId: scaledEvent.rewardSkinId || scaledEvent.unlockItemId || null,
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
            {tabOptions.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.86}
                  style={styles.tabTouchable}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={[
                        theme.accentColorSecondary,
                        theme.accentColor,
                        theme.accentColorDark,
                      ]}
                      start={[0, 0]}
                      end={[1, 1]}
                      style={styles.tabGradient}
                    >
                      <Text style={[styles.tabText, styles.tabTextActive]}>
                        {tab.label}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.tab}>
                      <Text style={styles.tabText}>{tab.label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {selectedEvent ? (
        <BattleView
          selectedEvent={scaledEvent}
          bossHp={bossHp}
          bossMaxHp={bossMaxHp} // WICHTIG!
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
    tabTouchable: {
      marginRight: 8,
      borderRadius: 20,
    },
    tabGradient: {
      borderRadius: 20,
      paddingHorizontal: 18,
      paddingVertical: 8,
      justifyContent: "center",
      alignItems: "center",
      minWidth: 78,
    },
    tab: {
      borderRadius: 20,
      paddingHorizontal: 18,
      paddingVertical: 8,
      backgroundColor: theme.shadowColor,
      justifyContent: "center",
      alignItems: "center",
      minWidth: 78,
    },
    tabText: {
      color: theme.textColor,
      fontSize: 16,
      fontWeight: "600",
    },
    tabTextActive: {
      color: theme.borderGlowColor,
    },
  });
}

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useThemeContext } from "../context/ThemeContext";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useClass } from "../context/ClassContext";
import eventData from "../data/eventData.json";
import { useLevelSystem } from "../hooks/useLevelSystem";
import classData from "../data/classData.json";
import EventList from "../components/EventList";
import BattleView from "../components/BattleView";
import { Image } from "expo-image";
import { getClassImageUrl } from "../utils/classUtils";
import { calculateSkillDamage } from "../utils/combatUtils";
import { equipmentPool } from "../data/equipmentPool";
import { getCharacterStatsWithEquipment } from "../utils/combat/statUtils";

const getEventBossKey = (imageUrl) => {
  if (!imageUrl) return null;
  const match = /\/([\w-]+)\.png$/i.exec(imageUrl);
  return match ? "eventboss_" + match[1].toLowerCase() : null;
};
const getBackgroundKey = (bgUrl) => {
  if (!bgUrl) return null;
  const match = /\/([\w-]+)\.png$/i.exec(bgUrl);
  return match ? "bg_" + match[1].toLowerCase() : null;
};

const tabOptions = [
  { key: "special", label: "Spezial" },
  { key: "recommended", label: "Empfohlen" },
  { key: "raid", label: "Überfall" },
  { key: "skill", label: "Fähigkeit" },
];

export default function EventScreen({ imageMap = {} }) {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
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

  // Modal State
  const [reward, setReward] = useState(null);
  const [modalStep, setModalStep] = useState(null);

  // Freigeschaltete Items laden
  const loadUnlocked = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const itemKeys = keys.filter((k) => k.startsWith("unlocked_item_"));
      setUnlockedItemIds(itemKeys.map((k) => k.replace("unlocked_item_", "")));
    } catch (e) {
      // silent fail
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUnlocked();
    }, [loadUnlocked])
  );

  // Events filtern & Bild-Mapping anwenden
  const availableEvents = eventData
    .filter(
      (e) =>
        unlockedItemIds.includes(String(e.unlockItemId)) && e.tag === activeTab
    )
    .map((e) => {
      const bossKey = getEventBossKey(e.image);
      const bgKey = getBackgroundKey(e.background);
      return {
        ...e,
        image: bossKey && imageMap[bossKey] ? imageMap[bossKey] : e.image,
        background: bgKey && imageMap[bgKey] ? imageMap[bgKey] : e.background,
      };
    });

  // Event-Auswahl

  useEffect(() => {
    if (selectedEvent) {
      setBossHp(selectedEvent.maxHp ?? 200);
      setBossDefeated(false);
    }
  }, [selectedEvent]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    // setBossHp() und setBossDefeated() werden jetzt durch useEffect erledigt!
  };

  // Kampf/Skill ausführen
  function handleFight(skill) {
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
    setBossHp((prevBossHp) => {
      const newHp = Math.max(prevBossHp - damage, 0);
      if (newHp === 0) setBossDefeated(true);
      return newHp;
    });
  }

  // Rewards/Modals
  useEffect(() => {
    if (bossDefeated && selectedEvent && activeCharacter) {
      // Rewards
      const expReward = selectedEvent.expReward ?? 120;
      const accountExpReward = selectedEvent.accountExpReward ?? 100;
      const coinReward = selectedEvent.coinReward ?? 100;
      const crystalReward = selectedEvent.crystalReward ?? 30;

      addCoins(coinReward);
      addCrystals(crystalReward);
      addXp(accountExpReward);
      const updatedChar = gainExp(activeCharacter, expReward);
      updateCharacter(updatedChar);

      (async () => {
        let newEquipment = null;
        let newCharacter = null;

        if (selectedEvent.rewardEquipmentId) {
          const unlockKey = "unlocked_item_" + selectedEvent.rewardEquipmentId;
          const alreadyUnlocked = await AsyncStorage.getItem(unlockKey);
          if (!alreadyUnlocked) {
            await AsyncStorage.setItem(unlockKey, "1");
            const equip = equipmentPool.find(
              (eq) => eq.id === selectedEvent.rewardEquipmentId
            );
            if (equip) newEquipment = equip;
          }
          loadUnlocked();
        }
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
        // Navigation nur wenn Reward
        navigation.navigate("VictoryScreen", {
          coinReward,
          crystalReward,
          character: updatedChar,
          isEvent: true,
          newEquipment,
          newCharacter,
        });
      })();
    }
    // eslint-disable-next-line
  }, [bossDefeated]);

  // Modal schließen & ggf. nächsten Schritt anzeigen
  const closeModal = () => {
    setReward(null);
    setModalStep(null);
    if (activeCharacter)
      navigation.navigate("VictoryScreen", {
        coinReward: selectedEvent?.coinReward ?? 100,
        crystalReward: selectedEvent?.crystalReward ?? 30,
        character: activeCharacter,
        isEvent: true,
      });
  };

  const styles = createStyles(theme);

  // --- Render ---
  return (
    <View style={styles.container}>
      {/* Background-Bild */}
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

      {/* Tabs */}
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

      {/* BattleView/EventList */}
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

      {/* Modals */}
      {modalStep && (
        <Modal transparent animationType="fade" visible>
          <View style={styles.modalOverlay}>
            <View style={styles.skillModal}>
              {modalStep === "skills" && reward?.skills && (
                <>
                  <Text style={styles.skillModalTitle}>
                    🎉 Neue Skills freigeschaltet!
                  </Text>
                  {reward.skills.map((skill, idx) => (
                    <View key={idx} style={styles.skillItem}>
                      <Text style={styles.skillName}>{skill.name}</Text>
                      <Text style={styles.skillDescription}>
                        {skill.description}
                      </Text>
                      <Text style={styles.skillPower}>
                        Power: {skill.power}
                      </Text>
                    </View>
                  ))}
                </>
              )}
              {modalStep === "equipment" && reward?.equipment && (
                <>
                  <Text style={styles.skillModalTitle}>
                    🗡️ Neue Ausrüstung freigeschaltet!
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      color: theme.borderGlowColor,
                      textAlign: "center",
                      marginBottom: 12,
                    }}
                  >
                    {reward.equipment.label}
                  </Text>
                  <Text style={styles.skillDescription}>
                    {reward.equipment.description}
                  </Text>
                </>
              )}
              {modalStep === "character" && reward?.character && (
                <>
                  <Text style={styles.skillModalTitle}>
                    🎉 Neuer Held freigeschaltet!
                  </Text>
                  <Image
                    source={{ uri: reward.character.classUrl }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      alignSelf: "center",
                      marginVertical: 12,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 18,
                      color: theme.borderGlowColor,
                      textAlign: "center",
                    }}
                  >
                    {reward.character.label}
                  </Text>
                </>
              )}
              <Pressable style={styles.okButton} onPress={closeModal}>
                <Text style={styles.okText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
    skillModal: {
      backgroundColor: theme.accentColor,
      margin: 32,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.14,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 15,
      elevation: 4,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.74)",
    },
    skillModalTitle: {
      fontSize: 18,
      color: theme.textColor,
      marginBottom: 12,
      textAlign: "center",
      fontWeight: "bold",
      letterSpacing: 0.1,
    },
    skillItem: { marginBottom: 12 },
    skillName: { fontSize: 16, color: theme.borderGlowColor },
    skillDescription: { fontSize: 14, color: theme.textColor },
    skillPower: { fontSize: 12, color: theme.glowColor },
    okButton: {
      marginTop: 16,
      backgroundColor: theme.borderGlowColor,
      padding: 10,
      borderRadius: 10,
      alignSelf: "center",
      minWidth: 90,
    },
    okText: {
      color: theme.accentColor,
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 15,
    },
  });
}

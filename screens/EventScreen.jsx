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

// --- Hilfsfunktionen für Bild-Mapping
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
  // Context & Navigation
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const { addXp } = useAccountLevel();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const {
    classList,
    addCharacter,
    activeClassId,
    updateCharacter,
    setActiveClassId,
  } = useClass();

  const { gainExp } = useLevelSystem();

  // State
  const activeCharacter = classList.find((c) => c.id === activeClassId);
  const [activeTab, setActiveTab] = useState("special");
  const [unlockedItemIds, setUnlockedItemIds] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bossHp, setBossHp] = useState(100);
  const [bossDefeated, setBossDefeated] = useState(false);

  // Rewards / Modals
  const [reward, setReward] = useState(null);
  const [modalStep, setModalStep] = useState(null); // "skills" | "equipment" | "character"

  // --- Utility: Ausgerüstete Stats berechnen
  const getCharacterStatsWithEquipment = (character) => {
    let stats = { ...(character.stats || {}) };
    let percentBonuses = { attack: 0, expGain: 0 };
    if (character.equipment) {
      Object.values(character.equipment).forEach((equipId) => {
        const item = equipmentPool.find((eq) => eq.id === equipId);
        if (item) {
          item.bonuses.forEach((bonus) => {
            if (bonus.type === "flat")
              stats[bonus.stat] = (stats[bonus.stat] || 0) + bonus.value;
            if (bonus.type === "percent")
              percentBonuses[bonus.stat] =
                (percentBonuses[bonus.stat] || 0) + bonus.value;
          });
        }
      });
    }
    stats.level = character.level ?? 1;
    return { stats, percentBonuses };
  };

  // --- Freigeschaltete Items laden
  const loadUnlocked = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const itemKeys = keys.filter((k) => k.startsWith("unlocked_item_"));
      setUnlockedItemIds(itemKeys.map((k) => k.replace("unlocked_item_", "")));
    } catch (e) {
      console.error("Fehler beim Laden der freigeschalteten Items:", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUnlocked();
    }, [loadUnlocked])
  );

  // --- Verfügbare Events filtern und Bild-Mapping anwenden
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

  // --- Eventauswahl
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setBossHp(event.maxHp ?? 200);
    setBossDefeated(false);
  };

  // --- Angriff/Skill ausführen
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

  // --- Kampfende: Rewards & Modals
  useEffect(() => {
    if (bossDefeated && selectedEvent && activeCharacter) {
      // Rewards berechnen
      const expReward = selectedEvent.expReward ?? 120;
      const accountExpReward = selectedEvent.accountExpReward ?? 100;
      const coinReward = selectedEvent.coinReward ?? 100;
      const crystalReward = selectedEvent.crystalReward ?? 30;

      // Rewards auszahlen
      addCoins(coinReward);
      addCrystals(crystalReward);
      addXp(accountExpReward);

      // Charakter updaten
      const updatedChar = gainExp(activeCharacter, expReward);
      updateCharacter(updatedChar);

      // --- NEU: Async-Handling für Equipment & Character
      (async () => {
        let newEquipment = null;
        let newCharacter = null;

        // 1. Equipment: Nur wenn NOCH NICHT freigeschaltet
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
          // Lade neue Freischaltungen für Anzeige/Liste etc.
          loadUnlocked();
        }

        // 2. Charakter: Nur wenn noch nicht im Team
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
            await addCharacter(newCharacter); // <-- Wichtig!
          }
        }

        // Jetzt Navigation auslösen – NUR wenn einer von beiden neu ist, übergebe ihn
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

  // --- Modal-Handler: Nächstes Modal oder Victory
  const closeModal = () => {
    if (modalStep === "skills" && reward?.skills) {
      // Als nächstes ggf. Equipment?
      if (selectedEvent?.rewardEquipmentId) {
        const equip = equipmentPool.find(
          (eq) => eq.id === selectedEvent.rewardEquipmentId
        );
        if (equip) {
          setReward({ type: "equipment", equipment: equip });
          setModalStep("equipment");
          return;
        }
      }
      // Oder als nächstes Charakter?
      if (
        selectedEvent?.rewardCharacterId &&
        !classList.some((c) =>
          [c.baseId, c.id].includes(selectedEvent.rewardCharacterId)
        )
      ) {
        const baseChar = classData.find(
          (c) => c.id === selectedEvent.rewardCharacterId
        );
        if (baseChar) {
          const newChar = {
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
          updateCharacter(newChar);
          setReward({ type: "character", character: newChar });
          setModalStep("character");
          return;
        }
      }
    }
    if (modalStep === "equipment" && reward?.equipment) {
      // Danach ggf. Charakter?
      if (
        selectedEvent?.rewardCharacterId &&
        !classList.some((c) =>
          [c.baseId, c.id].includes(selectedEvent.rewardCharacterId)
        )
      ) {
        const baseChar = classData.find(
          (c) => c.id === selectedEvent.rewardCharacterId
        );
        if (baseChar) {
          const newChar = {
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
          updateCharacter(newChar);
          setReward({ type: "character", character: newChar });
          setModalStep("character");
          return;
        }
      }
    }
    // Modal-Kette fertig: Sieges-Screen!
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

  // --- Render
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
          <View style={{ ...StyleSheet.absoluteFillObject }} />
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
                style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.activeTabText,
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

      {/* --- Rewards/Modals: */}
      {modalStep === "skills" && reward?.skills && (
        <Modal transparent animationType="fade" visible>
          <View style={styles.modalOverlay}>
            <View style={styles.skillModal}>
              <Text style={styles.skillModalTitle}>
                🎉 Neue Skills freigeschaltet!
              </Text>
              {reward.skills.map((skill, idx) => (
                <View key={idx} style={styles.skillItem}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillDescription}>
                    {skill.description}
                  </Text>
                  <Text style={styles.skillPower}>Power: {skill.power}</Text>
                </View>
              ))}
              <Pressable style={styles.okButton} onPress={closeModal}>
                <Text style={styles.okText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
      {modalStep === "equipment" && reward?.equipment && (
        <Modal transparent animationType="fade" visible>
          <View style={styles.modalOverlay}>
            <View style={styles.skillModal}>
              <Text style={styles.skillModalTitle}>
                🗡️ Neue Ausrüstung freigeschaltet!
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  color: "#F9B801",
                  textAlign: "center",
                  marginBottom: 12,
                }}
              >
                {reward.equipment.label}
              </Text>
              <Text style={styles.skillDescription}>
                {reward.equipment.description}
              </Text>
              <Pressable style={styles.okButton} onPress={closeModal}>
                <Text style={styles.okText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
      {modalStep === "character" && reward?.character && (
        <Modal transparent animationType="fade" visible>
          <View style={styles.modalOverlay}>
            <View style={styles.skillModal}>
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
                style={{ fontSize: 18, color: "#F9B801", textAlign: "center" }}
              >
                {reward.character.label}
              </Text>
              <Pressable
                style={styles.okButton}
                onPress={() => {
                  setReward(null);
                  setModalStep(null);
                  setActiveClassId(reward.character.id);
                  navigation.navigate("CharacterOverviewScreen");
                }}
              >
                <Text style={styles.okText}>Zum Team</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stickyHeader: { zIndex: 10, backgroundColor: "#000", paddingTop: 8 },
  tabsRow: { flexDirection: "row", paddingHorizontal: 12, gap: 8 },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#2B2F38",
    marginRight: 8,
  },
  activeTab: { backgroundColor: "#F9B801" },
  tabText: { color: "#fff", fontSize: 16 },
  activeTabText: { color: "#222" },
  skillModal: {
    backgroundColor: "#222",
    margin: 32,
    borderRadius: 16,
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  skillModalTitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  skillItem: { marginBottom: 12 },
  skillName: { fontSize: 16, color: "#F9B801" },
  skillDescription: { fontSize: 14, color: "#ccc" },
  skillPower: { fontSize: 12, color: "#888" },
  okButton: {
    marginTop: 16,
    backgroundColor: "#F9B801",
    padding: 10,
    borderRadius: 10,
    alignSelf: "center",
  },
  okText: { color: "#222" },
});

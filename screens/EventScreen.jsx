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

import EventList from "../components/EventList";
import BattleView from "../components/BattleView";
import { Image } from "expo-image";

// Hilfsfunktion: Bild-Key aus URL, unabhängig von Groß/Klein!
const getEventBossKey = (imageUrl) => {
  if (!imageUrl) return null;
  const match = /\/([\w-]+)\.png$/i.exec(imageUrl);
  return match ? "eventboss_" + match[1].toLowerCase() : null;
};

// Background-Key (falls du im Preloader die BGs auch ablegst – sonst bleibt's wie gehabt)
const getBackgroundKey = (bgUrl) => {
  if (!bgUrl) return null;
  const match = /\/([\w-]+)\.png$/i.exec(bgUrl);
  return match ? "bg_" + match[1].toLowerCase() : null;
};

export default function EventScreen({ imageMap = {} }) {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const { addXp } = useAccountLevel();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { classList, activeClassId, updateCharacter } = useClass();
  const { gainExp } = useLevelSystem();

  const activeCharacter = classList.find((c) => c.id === activeClassId);

  const [activeTab, setActiveTab] = useState("special");
  const [unlockedItemIds, setUnlockedItemIds] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bossHp, setBossHp] = useState(100);
  const [bossDefeated, setBossDefeated] = useState(false);
  const [newUnlockedSkills, setNewUnlockedSkills] = useState(null);

  // 📦 Freigeschaltete Items laden
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

  // Tab Optionen
  const tabOptions = [
    { key: "special", label: "Spezial" },
    { key: "recommended", label: "Empfohlen" },
    { key: "raid", label: "Überfall" },
    { key: "skill", label: "Fähigkeit" },
  ];

  // Events für den aktuellen Tab, MAPPING lokal!
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

  // 🧠 Kampf-Logik (Side-Effect auf bossDefeated)
  useEffect(() => {
    if (bossDefeated && selectedEvent && activeCharacter) {
      const updatedChar = gainExp(activeCharacter, 120);
      const oldSkills = (activeCharacter.skills || []).map((s) => s.name);
      const freshSkills = (updatedChar.skills || []).filter(
        (s) => !oldSkills.includes(s.name)
      );

      addCoins(100);
      addCrystals(30);
      addXp(100);
      updateCharacter(updatedChar);

      if (freshSkills.length > 0) {
        setNewUnlockedSkills(freshSkills);
      } else {
        navigation.navigate("VictoryScreen", {
          coinReward: 100,
          crystalReward: 30,
          character: updatedChar,
          isEvent: true,
        });
      }
    }
    // eslint-disable-next-line
  }, [bossDefeated]);

  // Angriff: Skill anwenden
  const handleFight = useCallback(
    (skill) => {
      if (!activeCharacter || bossDefeated) return;
      const skillPower = skill?.power ?? 30;
      setBossHp((prevBossHp) => {
        const newHp = Math.max(prevBossHp - skillPower, 0);
        if (newHp === 0) setBossDefeated(true);
        return newHp;
      });
    },
    [activeCharacter, bossDefeated]
  );

  // 📌 Event auswählen
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setBossHp(100);
    setBossDefeated(false);
  };

  // BattleView bekommt ein gemapptes selectedEvent mit richtigen Bildern
  return (
    <View style={styles.container}>
      {/* Background-Bild mit Caching */}
      {selectedEvent?.background && (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={selectedEvent.background}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={400}
          />
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: "rgba(0,0,0,0.35)",
            }}
          />
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

      {selectedEvent ? (
        <BattleView
          selectedEvent={selectedEvent}
          bossHp={bossHp}
          bossDefeated={bossDefeated}
          handleFight={handleFight}
          onBack={() => {
            setSelectedEvent(null);
          }}
          character={activeCharacter}
          imageMap={imageMap}
        />
      ) : (
        <EventList
          availableEvents={availableEvents}
          onSelectEvent={handleSelectEvent}
          imageMap={imageMap}
        />
      )}

      {/* 🎉 Modal für neue Skills */}
      {newUnlockedSkills && (
        <Modal transparent animationType="fade" visible>
          <View style={styles.modalOverlay}>
            <View style={styles.skillModal}>
              <Text style={styles.skillModalTitle}>
                🎉 Neue Skills freigeschaltet!
              </Text>
              {newUnlockedSkills.map((skill, index) => (
                <View key={index} style={styles.skillItem}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillDescription}>
                    {skill.description}
                  </Text>
                  <Text style={styles.skillPower}>Power: {skill.power}</Text>
                </View>
              ))}
              <Pressable
                style={styles.okButton}
                onPress={() => {
                  setNewUnlockedSkills(null);
                  setTimeout(() => {
                    navigation.navigate("VictoryScreen", {
                      coinReward: 100,
                      crystalReward: 30,
                      character: activeCharacter,
                      isEvent: true,
                    });
                  }, 100);
                }}
              >
                <Text style={styles.okText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    zIndex: 10,
    backgroundColor: "#000",
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
    backgroundColor: "#2B2F38",
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: "#F9B801",
  },
  tabText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#222",
  },
  skillModal: {
    backgroundColor: "#222",
    margin: 32,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#888",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  skillModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  skillItem: {
    marginBottom: 12,
  },
  skillName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F9B801",
  },
  skillDescription: {
    fontSize: 14,
    color: "#ccc",
  },
  skillPower: {
    fontSize: 12,
    color: "#888",
  },
  okButton: {
    marginTop: 16,
    backgroundColor: "#F9B801",
    padding: 10,
    borderRadius: 10,
    alignSelf: "center",
  },
  okText: {
    color: "#222",
    fontWeight: "bold",
  },
});

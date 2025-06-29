import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useClass } from "../context/ClassContext";
import { useLevelSystem } from "../hooks/useLevelSystem";
import BattleScene from "../components/BattleScene";
import { useMissions } from "../context/MissionContext";

import bossData from "../data/bossData.json";
import { Image } from "expo-image";
import { useCompleteMissionOnce } from "../utils/mission/missionUtils";

const COIN_REWARD = 100;
const CRYSTAL_REWARD = 30;
const PLAYER_MAX_HP_DEFAULT = 100;

// Helper für Boss-Image-Key
function getEventBossKey(imageUrl, fallbackName) {
  if (!imageUrl && !fallbackName) return null;
  // Falls eine URL, extrahiere Name
  let name = null;
  if (typeof imageUrl === "string" && imageUrl.endsWith(".png")) {
    const match = /\/([\w-]+)\.png$/i.exec(imageUrl);
    name = match ? match[1] : null;
  }
  // Falls es kein Bild oder kein Match gibt, nimm den Namen
  if (!name && fallbackName) {
    name = fallbackName;
  }
  // Key bauen
  return name ? "eventboss_" + name.toLowerCase() : null;
}

// Helper für Background-Key (optional, je nach Caching)
function getBackgroundKey(bgUrl) {
  if (!bgUrl) return null;
  const match = /\/([\w-]+)\.png$/i.exec(bgUrl);
  return match ? "bg_" + match[1].toLowerCase() : null;
}

export default function EndlessModeScreen({ imageMap = {} }) {
  const navigation = useNavigation();
  const { addXp } = useAccountLevel();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { classList, activeClassId, updateCharacter } = useClass();
  const { gainExp } = useLevelSystem();
  const { missions, markMissionCompleted } = useMissions();
  const completeMissionOnce = useCompleteMissionOnce();

  const activeCharacter = classList.find((c) => c.id === activeClassId);
  const maxHp = activeCharacter?.maxHp || PLAYER_MAX_HP_DEFAULT;

  const [bossHp, setBossHp] = useState(100);
  const [currentBoss, setCurrentBoss] = useState(null);

  // Modal für neue Skills
  const [newUnlockedSkills, setNewUnlockedSkills] = useState(null);

  useEffect(() => {
    spawnNewBoss();
    // eslint-disable-next-line
  }, []);

  const spawnNewBoss = useCallback(() => {
    const randomBoss = bossData[Math.floor(Math.random() * bossData.length)];
    setCurrentBoss(randomBoss);
    setBossHp(randomBoss.hp || 100);
  }, []);

  const handleFight = useCallback(
    (skill) => {
      if (!activeCharacter || !currentBoss) return;

      const damage = typeof skill?.power === "number" ? skill.power : 20;

      setBossHp((prevBossHp) => {
        const newHp = Math.max(prevBossHp - damage, 0);

        if (newHp === 0) {
          setTimeout(() => {
            addCoins(COIN_REWARD);
            addCrystals(CRYSTAL_REWARD);
            addXp(100);

            completeMissionOnce("1");

            const updatedCharacter = gainExp(activeCharacter, 120);
            updateCharacter(updatedCharacter);

            const oldSkillNames = (activeCharacter.skills || []).map(
              (s) => s.name
            );
            const newSkills = (updatedCharacter.skills || []).filter(
              (s) => !oldSkillNames.includes(s.name)
            );

            if (newSkills.length > 0) {
              setNewUnlockedSkills(newSkills);
            } else {
              setTimeout(spawnNewBoss, 500);
            }
          }, 300);
        }

        return newHp;
      });
    },
    [
      activeCharacter,
      currentBoss,
      addCoins,
      addCrystals,
      addXp,
      gainExp,
      updateCharacter,
      spawnNewBoss,
      completeMissionOnce,
    ]
  );

  const handleCloseSkillModal = useCallback(() => {
    setNewUnlockedSkills(null);
    setTimeout(spawnNewBoss, 400);
  }, [spawnNewBoss]);

  // Prozent-HP für Balkenanzeige
  const bossHpPercent =
    currentBoss && currentBoss.hp
      ? Math.max(0, Math.round((bossHp / currentBoss.hp) * 100))
      : 0;

  // Background gecacht (optional)
  const bossBgKey = getBackgroundKey(currentBoss?.background);
  const bossBgSrc =
    (bossBgKey && imageMap[bossBgKey]) || currentBoss?.background;

  // --- Boss-Objekt IMMER gemappt mit eventboss_ ---
  let mappedBoss = { ...currentBoss };
  if (currentBoss) {
    // Nutze Bild ODER fallback auf Name
    const imgKey = getEventBossKey(
      currentBoss.image,
      currentBoss.name || currentBoss.id
    );
    console.log(
      "ENDLESS/Boss:",
      currentBoss?.name,
      "| Key:",
      imgKey,
      "| In Map:",
      !!imageMap[imgKey]
    );
    mappedBoss.image = (imgKey && imageMap[imgKey]) || currentBoss.image;
  }

  return (
    <View style={styles.container}>
      {/* Boss-Background gecacht */}
      {bossBgSrc && (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={bossBgSrc}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={400}
          />
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
            }}
          />
        </View>
      )}

      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Zurück</Text>
      </Pressable>

      {currentBoss && (
        <BattleScene
          boss={mappedBoss} // <-- Bossbild IMMER als eventboss_ gemappt!
          bossHp={bossHpPercent}
          bossDefeated={bossHp === 0}
          handleFight={handleFight}
          bossBackground={bossBgSrc}
          imageMap={imageMap}
        />
      )}

      {/* Modal für neue Skills */}
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
                onPress={handleCloseSkillModal}
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
  container: { flex: 1, padding: 20 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  skillModal: {
    backgroundColor: "#222",
    margin: 32,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#888",
  },
  skillModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  skillItem: { marginBottom: 12 },
  skillName: { fontSize: 16, fontWeight: "bold", color: "#F9B801" },
  skillDescription: { fontSize: 14, color: "#ccc" },
  skillPower: { fontSize: 12, color: "#888" },
  okButton: {
    marginTop: 16,
    backgroundColor: "#F9B801",
    padding: 10,
    borderRadius: 10,
    alignSelf: "center",
  },
  okText: { color: "#222", fontWeight: "bold" },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#1e293b",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#2563eb",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.11,
    shadowRadius: 6,
    elevation: 4,
  },
  backText: {
    color: "#38bdf8",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.12,
    textAlign: "center",
  },
});

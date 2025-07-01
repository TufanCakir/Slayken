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
import { useThemeContext } from "../context/ThemeContext";

import bossData from "../data/bossData.json";
import { Image } from "expo-image";
import { useCompleteMissionOnce } from "../utils/mission/missionUtils";

const COIN_REWARD = 100;
const CRYSTAL_REWARD = 30;
const PLAYER_MAX_HP_DEFAULT = 100;

// Helper für Boss-Image-Key
function getEventBossKey(imageUrl, fallbackName) {
  if (!imageUrl && !fallbackName) return null;
  let name = null;
  if (typeof imageUrl === "string" && imageUrl.endsWith(".png")) {
    const match = /\/([\w-]+)\.png$/i.exec(imageUrl);
    name = match ? match[1] : null;
  }
  if (!name && fallbackName) {
    name = fallbackName;
  }
  return name ? "eventboss_" + name.toLowerCase() : null;
}
function getBackgroundKey(bgUrl) {
  if (!bgUrl) return null;
  const match = /\/([\w-]+)\.png$/i.exec(bgUrl);
  return match ? "bg_" + match[1].toLowerCase() : null;
}

export default function EndlessModeScreen({ imageMap = {} }) {
  const { theme } = useThemeContext(); // <= HIER: Dein Theme aus dem Context!
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

  const bossHpPercent =
    currentBoss && currentBoss.hp
      ? Math.max(0, Math.round((bossHp / currentBoss.hp) * 100))
      : 0;

  const bossBgKey = getBackgroundKey(currentBoss?.background);
  const bossBgSrc =
    (bossBgKey && imageMap[bossBgKey]) || currentBoss?.background;

  let mappedBoss = { ...currentBoss };
  if (currentBoss) {
    const imgKey = getEventBossKey(
      currentBoss.image,
      currentBoss.name || currentBoss.id
    );
    mappedBoss.image = (imgKey && imageMap[imgKey]) || currentBoss.image;
  }

  // --- THEME STYLES ---
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {bossBgSrc && (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={bossBgSrc}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={400}
          />
          <View style={StyleSheet.absoluteFillObject} />
        </View>
      )}

      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Zurück</Text>
      </Pressable>

      {currentBoss && (
        <BattleScene
          boss={mappedBoss}
          bossHp={bossHpPercent}
          bossDefeated={bossHp === 0}
          handleFight={handleFight}
          bossBackground={bossBgSrc}
          imageMap={imageMap}
        />
      )}

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

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.background, // Fallback, falls kein Bild geladen
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.74)",
      paddingHorizontal: 12,
    },
    skillModal: {
      backgroundColor: theme.accentColor,
      borderRadius: 18,
      paddingVertical: 24,
      paddingHorizontal: 22,
      borderWidth: 2,
      borderColor: theme.borderColor,
      minWidth: 270,
      maxWidth: 350,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 18,
      elevation: 12,
      alignItems: "center",
    },
    skillModalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.textColor,
      marginBottom: 18,
      textAlign: "center",
      letterSpacing: 0.1,
    },
    skillItem: {
      marginBottom: 13,
      backgroundColor: theme.shadowColor,
      padding: 8,
      borderRadius: 8,
      width: "100%",
    },
    skillName: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.accentHighlight || "#F9B801",
      marginBottom: 1,
    },
    skillDescription: {
      fontSize: 14,
      color: theme.textColor,
      marginBottom: 1,
    },
    skillPower: {
      fontSize: 12,
      color: theme.borderColor,
    },
    okButton: {
      marginTop: 16,
      backgroundColor: theme.accentHighlight || "#F9B801",
      paddingVertical: 10,
      paddingHorizontal: 34,
      borderRadius: 13,
      alignSelf: "center",
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.13,
      shadowRadius: 8,
      elevation: 3,
    },
    okText: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 16,
      letterSpacing: 0.06,
    },
    backButton: {
      alignSelf: "flex-start",
      marginTop: 2,
      backgroundColor: theme.shadowColor,
      paddingVertical: 9,
      paddingHorizontal: 24,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: theme.borderColor,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.11,
      shadowRadius: 6,
      elevation: 3,
      marginBottom: 12,
    },
    backText: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 16,
      letterSpacing: 0.12,
      textAlign: "center",
    },
  });
}

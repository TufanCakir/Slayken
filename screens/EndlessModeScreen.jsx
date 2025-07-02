import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useClass } from "../context/ClassContext";
import { useLevelSystem } from "../hooks/useLevelSystem";
import BattleScene from "../components/BattleScene";
import { useThemeContext } from "../context/ThemeContext";
import bossData from "../data/bossData.json";
import { Image } from "expo-image";
import { useCompleteMissionOnce } from "../utils/mission/missionUtils";
import { calculateSkillDamage } from "../utils/combatUtils";
import { getCharacterStatsWithEquipment } from "../utils/combat/statUtils";

const COIN_REWARD = 100;
const CRYSTAL_REWARD = 30;

// Helper-Funktionen zum Image-Mapping
const getEventBossKey = (imageUrl, fallbackName) => {
  if (typeof imageUrl === "string" && imageUrl.endsWith(".png")) {
    const match = /\/([\w-]+)\.png$/i.exec(imageUrl);
    if (match) return "eventboss_" + match[1].toLowerCase();
  }
  if (fallbackName) return "eventboss_" + fallbackName.toLowerCase();
  return null;
};
const getBackgroundKey = (bgUrl) => {
  if (!bgUrl) return null;
  const match = /\/([\w-]+)\.png$/i.exec(bgUrl);
  return match ? "bg_" + match[1].toLowerCase() : null;
};

export default function EndlessModeScreen({ imageMap = {} }) {
  const { theme } = useThemeContext();
  const navigation = useNavigation();
  const { addXp } = useAccountLevel();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { classList, activeClassId, updateCharacter } = useClass();
  const { gainExp } = useLevelSystem();
  const completeMissionOnce = useCompleteMissionOnce();

  // Aktueller Charakter (Memo für stabile Referenz)
  const activeCharacter = useMemo(
    () => classList.find((c) => c.id === activeClassId),
    [classList, activeClassId]
  );

  // States: bossData[0].hp als Initialwert, um null zu vermeiden
  const firstBossHp = bossData[0]?.hp ?? 100;
  const [currentBoss, setCurrentBoss] = useState(bossData[0] || null);
  const [bossHp, setBossHp] = useState(firstBossHp);
  const [newUnlockedSkills, setNewUnlockedSkills] = useState(null);

  // Boss spawnen: wähle zufällig und setze HP
  const spawnNewBoss = useCallback(() => {
    const randomBoss = bossData[Math.floor(Math.random() * bossData.length)];
    setCurrentBoss(randomBoss);
    setBossHp(randomBoss.hp || 100);
  }, []);

  // Beim Mount und nach jedem Boss-Reset
  useEffect(() => {
    spawnNewBoss();
  }, [spawnNewBoss]);

  // Kampf-Handler
  const handleFight = useCallback(
    (skill) => {
      if (!activeCharacter || !currentBoss) return;

      const { stats: charStats, percentBonuses } =
        getCharacterStatsWithEquipment(activeCharacter);
      const skillPower = skill?.power ?? 30;
      const damage = calculateSkillDamage({
        charStats,
        percentBonuses,
        skill: { skillDmg: skillPower },
        enemyDefense: currentBoss.defense || 0,
      });

      setBossHp((prev) => {
        const nextHp = Math.max(prev - damage, 0);
        // Boss besiegt?
        if (nextHp === 0) {
          setTimeout(() => {
            // Rewards und XP
            addCoins(COIN_REWARD);
            addCrystals(CRYSTAL_REWARD);
            addXp(100);
            completeMissionOnce("1");

            // Charakter-Level-Up
            const leveled = gainExp(activeCharacter, 120);
            updateCharacter(leveled);

            // Neue Skills freischalten?
            const oldNames = activeCharacter.skills?.map((s) => s.name) || [];
            const newSkills = leveled.skills?.filter(
              (s) => !oldNames.includes(s.name)
            );
            if (newSkills?.length) {
              setNewUnlockedSkills(newSkills);
            } else {
              // Sonst gleich neuen Boss starten
              setTimeout(spawnNewBoss, 500);
            }
          }, 300);
        }
        return nextHp;
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

  // Modal schließen → neuen Boss generieren
  const handleCloseSkillModal = useCallback(() => {
    setNewUnlockedSkills(null);
    setTimeout(spawnNewBoss, 400);
  }, [spawnNewBoss]);

  // Bild-Keys aus imageMap oder Fallback-URLs
  const bossBgKey = getBackgroundKey(currentBoss?.background);
  const bossBgSrc =
    (bossBgKey && imageMap[bossBgKey]) || currentBoss?.background;

  const mappedBoss = currentBoss
    ? {
        ...currentBoss,
        image:
          (getEventBossKey(currentBoss.image, currentBoss.name) &&
            imageMap[getEventBossKey(currentBoss.image, currentBoss.name)]) ||
          currentBoss.image,
      }
    : null;

  const styles = useMemo(() => createStyles(theme), [theme]);

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

      <Pressable style={styles.backButton} onPress={navigation.goBack}>
        <Text style={styles.backText}>← Zurück</Text>
      </Pressable>

      {mappedBoss && (
        <BattleScene
          boss={mappedBoss}
          bossHp={bossHp} // aktueller HP-Wert, z.B. 300
          bossMaxHp={currentBoss.hp} // Max-HP, z.B. 300
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
              {newUnlockedSkills.map((s, i) => (
                <View key={i} style={styles.skillItem}>
                  <Text style={styles.skillName}>{s.name}</Text>
                  <Text style={styles.skillDescription}>{s.description}</Text>
                  <Text style={styles.skillPower}>Power: {s.power}</Text>
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
    container: { flex: 1 },
    backButton: {
      alignSelf: "flex-start",
      marginTop: 8,
      marginBottom: 12,
      backgroundColor: theme.accentColor,
      paddingVertical: 9,
      paddingHorizontal: 24,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: theme.borderGlowColor,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.11,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 2,
    },
    backText: {
      color: theme.textColor,
      fontSize: 16,
      letterSpacing: 0.12,
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
      minWidth: 270,
      maxWidth: 350,
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.12,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 13,
      elevation: 3,
    },
    skillModalTitle: {
      fontSize: 20,
      color: theme.textColor,
      marginBottom: 18,
      textAlign: "center",
      letterSpacing: 0.1,
    },
    skillItem: {
      marginBottom: 13,
      backgroundColor: theme.accentColor,
      padding: 8,
      borderRadius: 8,
      width: "100%",
      borderWidth: 1,
      borderColor: theme.borderGlowColor,
    },
    skillName: {
      fontSize: 16,
      color: theme.borderGlowColor,
      marginBottom: 4,
      fontWeight: "bold",
    },
    skillDescription: { fontSize: 14, color: theme.textColor, marginBottom: 4 },
    skillPower: { fontSize: 12, color: theme.glowColor },
    okButton: {
      marginTop: 16,
      backgroundColor: theme.accentColor,
      paddingVertical: 10,
      paddingHorizontal: 34,
      borderRadius: 13,
      borderWidth: 1.2,
      borderColor: theme.borderGlowColor,
    },
    okText: {
      color: theme.textColor,
      fontSize: 16,
      letterSpacing: 0.06,
      fontWeight: "600",
    },
  });
}
